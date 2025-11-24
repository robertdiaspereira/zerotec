"""
Views for CRM models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from .models import Funil, EtapaFunil, Oportunidade, Atividade, Interacao
from .serializers import (
    FunilSerializer, EtapaFunilSerializer,
    OportunidadeSerializer, OportunidadeListSerializer,
    AtividadeSerializer, InteracaoSerializer
)


class FunilViewSet(viewsets.ModelViewSet):
    """ViewSet for Funil"""
    queryset = Funil.objects.all()
    serializer_class = FunilSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'ordem']


class EtapaFunilViewSet(viewsets.ModelViewSet):
    """ViewSet for EtapaFunil"""
    queryset = EtapaFunil.objects.select_related('funil').all()
    serializer_class = EtapaFunilSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['ordem', 'probabilidade']
    filterset_fields = ['funil']


class OportunidadeViewSet(viewsets.ModelViewSet):
    """ViewSet for Oportunidade"""
    queryset = Oportunidade.objects.select_related(
        'cliente', 'funil', 'etapa', 'responsavel', 'produto'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'titulo', 'descricao', 'cliente__nome_razao_social', 'nome_lead']
    ordering_fields = ['data_abertura', 'valor_estimado', 'probabilidade']
    filterset_fields = ['funil', 'etapa', 'responsavel', 'origem']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OportunidadeListSerializer
        return OportunidadeSerializer
    
    @action(detail=True, methods=['post'])
    def mudar_etapa(self, request, pk=None):
        """Move opportunity to another stage"""
        oportunidade = self.get_object()
        etapa_id = request.data.get('etapa_id')
        
        if not etapa_id:
            return Response(
                {'error': 'etapa_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            etapa = EtapaFunil.objects.get(id=etapa_id, funil=oportunidade.funil)
        except EtapaFunil.DoesNotExist:
            return Response(
                {'error': 'Etapa não encontrada ou não pertence ao funil'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        oportunidade.etapa = etapa
        oportunidade.save()
        
        return Response({
            'message': 'Etapa alterada com sucesso',
            'oportunidade': OportunidadeSerializer(oportunidade).data
        })
    
    @action(detail=True, methods=['post'])
    def ganhar(self, request, pk=None):
        """Mark opportunity as won"""
        oportunidade = self.get_object()
        
        # Buscar etapa de ganho
        etapa_ganho = EtapaFunil.objects.filter(
            funil=oportunidade.funil,
            is_ganho=True
        ).first()
        
        if not etapa_ganho:
            return Response(
                {'error': 'Funil não possui etapa de ganho configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        oportunidade.etapa = etapa_ganho
        oportunidade.save()
        
        return Response({
            'message': 'Oportunidade marcada como ganha!',
            'oportunidade': OportunidadeSerializer(oportunidade).data
        })
    
    @action(detail=True, methods=['post'])
    def perder(self, request, pk=None):
        """Mark opportunity as lost"""
        oportunidade = self.get_object()
        motivo = request.data.get('motivo', '')
        
        # Buscar etapa de perda
        etapa_perdido = EtapaFunil.objects.filter(
            funil=oportunidade.funil,
            is_perdido=True
        ).first()
        
        if not etapa_perdido:
            return Response(
                {'error': 'Funil não possui etapa de perda configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        oportunidade.etapa = etapa_perdido
        oportunidade.motivo_perda = motivo
        oportunidade.save()
        
        return Response({
            'message': 'Oportunidade marcada como perdida',
            'oportunidade': OportunidadeSerializer(oportunidade).data
        })
    
    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """Get opportunities organized by pipeline stage (Kanban view)"""
        funil_id = request.query_params.get('funil_id')
        
        if not funil_id:
            return Response(
                {'error': 'funil_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            funil = Funil.objects.get(id=funil_id)
        except Funil.DoesNotExist:
            return Response(
                {'error': 'Funil não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar etapas do funil
        etapas = EtapaFunil.objects.filter(funil=funil).order_by('ordem')
        
        kanban_data = []
        for etapa in etapas:
            oportunidades = Oportunidade.objects.filter(
                funil=funil,
                etapa=etapa,
                active=True
            ).select_related('cliente', 'responsavel')
            
            kanban_data.append({
                'etapa': EtapaFunilSerializer(etapa).data,
                'oportunidades': OportunidadeListSerializer(oportunidades, many=True).data,
                'total_oportunidades': oportunidades.count(),
                'valor_total': oportunidades.aggregate(total=Sum('valor_estimado'))['total'] or 0
            })
        
        return Response({
            'funil': FunilSerializer(funil).data,
            'kanban': kanban_data
        })
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get CRM dashboard metrics"""
        # Total de oportunidades
        total_oportunidades = Oportunidade.objects.filter(active=True).count()
        
        # Valor total em pipeline
        valor_pipeline = Oportunidade.objects.filter(
            active=True
        ).exclude(
            etapa__is_ganho=True
        ).exclude(
            etapa__is_perdido=True
        ).aggregate(total=Sum('valor_estimado'))['total'] or 0
        
        # Oportunidades ganhas (este mês)
        from django.utils import timezone
        primeiro_dia_mes = timezone.now().date().replace(day=1)
        
        oportunidades_ganhas = Oportunidade.objects.filter(
            etapa__is_ganho=True,
            data_fechamento__gte=primeiro_dia_mes
        )
        
        total_ganho = oportunidades_ganhas.aggregate(total=Sum('valor_estimado'))['total'] or 0
        qtd_ganho = oportunidades_ganhas.count()
        
        # Taxa de conversão
        total_fechadas = Oportunidade.objects.filter(
            Q(etapa__is_ganho=True) | Q(etapa__is_perdido=True),
            data_fechamento__gte=primeiro_dia_mes
        ).count()
        
        taxa_conversao = (qtd_ganho / total_fechadas * 100) if total_fechadas > 0 else 0
        
        # Oportunidades por etapa
        por_etapa = []
        etapas = EtapaFunil.objects.all()
        for etapa in etapas:
            count = Oportunidade.objects.filter(etapa=etapa, active=True).count()
            valor = Oportunidade.objects.filter(etapa=etapa, active=True).aggregate(
                total=Sum('valor_estimado')
            )['total'] or 0
            
            por_etapa.append({
                'etapa': etapa.nome,
                'quantidade': count,
                'valor': valor
            })
        
        return Response({
            'total_oportunidades': total_oportunidades,
            'valor_pipeline': valor_pipeline,
            'oportunidades_ganhas_mes': qtd_ganho,
            'valor_ganho_mes': total_ganho,
            'taxa_conversao': round(taxa_conversao, 2),
            'por_etapa': por_etapa
        })


class AtividadeViewSet(viewsets.ModelViewSet):
    """ViewSet for Atividade"""
    queryset = Atividade.objects.select_related('oportunidade', 'responsavel').all()
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['titulo', 'descricao']
    ordering_fields = ['data_prevista', 'data_conclusao']
    filterset_fields = ['oportunidade', 'tipo', 'status', 'responsavel']
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        """Mark activity as completed"""
        atividade = self.get_object()
        resultado = request.data.get('resultado', '')
        
        from django.utils import timezone
        atividade.status = 'concluida'
        atividade.data_conclusao = timezone.now()
        atividade.resultado = resultado
        atividade.save()
        
        return Response({
            'message': 'Atividade concluída com sucesso',
            'atividade': AtividadeSerializer(atividade).data
        })
    
    @action(detail=False, methods=['get'])
    def pendentes(self, request):
        """Get pending activities"""
        atividades = self.queryset.filter(status='pendente').order_by('data_prevista')
        serializer = self.get_serializer(atividades, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def atrasadas(self, request):
        """Get overdue activities"""
        from django.utils import timezone
        atividades = self.queryset.filter(
            status='pendente',
            data_prevista__lt=timezone.now()
        ).order_by('data_prevista')
        serializer = self.get_serializer(atividades, many=True)
        return Response(serializer.data)


class InteracaoViewSet(viewsets.ModelViewSet):
    """ViewSet for Interacao"""
    queryset = Interacao.objects.select_related('oportunidade', 'cliente', 'usuario').all()
    serializer_class = InteracaoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['assunto', 'descricao']
    ordering_fields = ['data_interacao']
    filterset_fields = ['oportunidade', 'cliente', 'tipo']
    
    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """Get interaction timeline for a customer or opportunity"""
        cliente_id = request.query_params.get('cliente_id')
        oportunidade_id = request.query_params.get('oportunidade_id')
        
        queryset = self.queryset
        
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        if oportunidade_id:
            queryset = queryset.filter(oportunidade_id=oportunidade_id)
        
        queryset = queryset.order_by('-data_interacao')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
