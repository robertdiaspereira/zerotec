"""
Views for Caixa app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Caixa
from .serializers import (
    CaixaSerializer,
    CaixaListSerializer,
    CaixaAbrirSerializer,
    CaixaFecharSerializer
)


class CaixaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de caixas
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Retorna caixas baseado nas permissões do usuário
        - Admin: vê todos os caixas
        - Usuário comum: vê apenas seus próprios caixas
        """
        user = self.request.user
        
        # Verificar se usuário tem permissão para ver todos os caixas
        # TODO: Implementar verificação de permissão customizada
        if user.is_superuser or user.groups.filter(name='Administrador').exists():
            return Caixa.objects.all()
        
        # Usuário comum vê apenas seus caixas
        return Caixa.objects.filter(usuario_abertura=user)
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na action"""
        if self.action == 'list':
            return CaixaListSerializer
        return CaixaSerializer
    
    @action(detail=False, methods=['get'])
    def atual(self, request):
        """
        Retorna o caixa aberto do usuário atual, se existir
        GET /api/caixa/atual/
        """
        caixa = Caixa.caixa_aberto_usuario(request.user)
        
        if not caixa:
            return Response(
                {'detail': 'Nenhum caixa aberto encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CaixaSerializer(caixa)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def abrir(self, request):
        """
        Abre um novo caixa para o usuário
        POST /api/caixa/abrir/
        Body: {
            "valor_inicial": 100.00,
            "observacoes_abertura": "Caixa aberto normalmente"
        }
        """
        # Verificar se já existe caixa aberto
        if Caixa.tem_caixa_aberto(request.user):
            return Response(
                {'detail': 'Você já possui um caixa aberto. Feche-o antes de abrir um novo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar dados
        serializer = CaixaAbrirSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Criar novo caixa
        caixa = Caixa.objects.create(
            usuario_abertura=request.user,
            valor_inicial=serializer.validated_data['valor_inicial'],
            observacoes_abertura=serializer.validated_data.get('observacoes_abertura', ''),
            status='aberto'
        )
        
        response_serializer = CaixaSerializer(caixa)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def fechar(self, request, pk=None):
        """
        Fecha um caixa específico
        POST /api/caixa/{id}/fechar/
        Body: {
            "valor_final": 550.00,
            "observacoes_fechamento": "Fechamento normal"
        }
        """
        caixa = self.get_object()
        
        # Verificar se o caixa pertence ao usuário ou se é admin
        if caixa.usuario_abertura != request.user and not request.user.is_superuser:
            return Response(
                {'detail': 'Você não tem permissão para fechar este caixa'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se já está fechado
        if caixa.status == 'fechado':
            return Response(
                {'detail': 'Este caixa já está fechado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar dados
        serializer = CaixaFecharSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Fechar caixa
        try:
            caixa.fechar(
                usuario=request.user,
                valor_final=serializer.validated_data['valor_final'],
                observacoes=serializer.validated_data.get('observacoes_fechamento', '')
            )
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response_serializer = CaixaSerializer(caixa)
        return Response(response_serializer.data)
    
    @action(detail=True, methods=['get'])
    def vendas(self, request, pk=None):
        """
        Retorna as vendas realizadas neste caixa
        GET /api/caixa/{id}/vendas/
        """
        from apps.vendas.models import Venda
        from apps.vendas.serializers import VendaSerializer
        
        caixa = self.get_object()
        vendas = Venda.objects.filter(caixa=caixa)
        
        serializer = VendaSerializer(vendas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """
        Retorna estatísticas gerais de caixas
        GET /api/caixa/estatisticas/
        """
        from django.db.models import Sum, Avg, Count
        from datetime import datetime, timedelta
        
        # Filtrar por período se fornecido
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        queryset = self.get_queryset()
        
        if data_inicio:
            queryset = queryset.filter(data_abertura__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data_abertura__lte=data_fim)
        
        # Calcular estatísticas
        stats = queryset.aggregate(
            total_caixas=Count('id'),
            total_vendas=Sum('valor_esperado'),
            media_vendas=Avg('valor_esperado'),
            total_quebras=Sum('valor_final') - Sum('valor_esperado') if queryset.filter(status='fechado').exists() else 0
        )
        
        return Response(stats)
