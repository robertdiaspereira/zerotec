"""
Views for Financeiro models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Q
from decimal import Decimal
from .models import (
    CategoriaFinanceira, ContaBancaria, ContaPagar, ContaReceber, FluxoCaixa,
    FormaRecebimento, FormaPagamento, Pagamento, Parcela
)
from .serializers import (
    CategoriaFinanceiraSerializer, ContaBancariaSerializer,
    ContaPagarSerializer, ContaPagarListSerializer,
    ContaReceberSerializer, ContaReceberListSerializer,
    FluxoCaixaSerializer, FormaRecebimentoSerializer, FormaRecebimentoListSerializer,
    PagamentoSerializer, ParcelaSerializer
)


class CategoriaFinanceiraViewSet(viewsets.ModelViewSet):
    """ViewSet for CategoriaFinanceira"""
    queryset = CategoriaFinanceira.objects.all()
    serializer_class = CategoriaFinanceiraSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'tipo']
    filterset_fields = ['tipo', 'active']


class ContaBancariaViewSet(viewsets.ModelViewSet):
    """ViewSet for ContaBancaria"""
    queryset = ContaBancaria.objects.all()
    serializer_class = ContaBancariaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['banco', 'agencia', 'conta']
    ordering_fields = ['banco', 'saldo_atual']


class ContaPagarViewSet(viewsets.ModelViewSet):
    """ViewSet for ContaPagar"""
    queryset = ContaPagar.objects.select_related('fornecedor', 'categoria', 'conta_bancaria').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'descricao', 'fornecedor__razao_social', 'numero_documento']
    ordering_fields = ['data_vencimento', 'valor_original']
    filterset_fields = ['status', 'fornecedor', 'categoria']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContaPagarListSerializer
        return ContaPagarSerializer
    
    @action(detail=True, methods=['post'])
    def pagar(self, request, pk=None):
        """Pay account"""
        conta = self.get_object()
        
        if conta.status == 'pago':
            return Response({'error': 'Conta já está paga'}, status=status.HTTP_400_BAD_REQUEST)
        
        valor_pago = request.data.get('valor_pago', conta.valor_total)
        data_pagamento = request.data.get('data_pagamento', timezone.now().date())
        conta_bancaria_id = request.data.get('conta_bancaria')
        
        conta.valor_pago = valor_pago
        conta.data_pagamento = data_pagamento
        conta.status = 'pago'
        
        if conta_bancaria_id:
            conta.conta_bancaria_id = conta_bancaria_id
        
        conta.save()
        
        return Response({
            'message': 'Conta paga com sucesso',
            'conta': ContaPagarSerializer(conta).data
        })
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Get overdue accounts"""
        hoje = timezone.now().date()
        contas = self.queryset.filter(status='pendente', data_vencimento__lt=hoje)
        serializer = ContaPagarListSerializer(contas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencendo(self, request):
        """Get accounts due soon (next 7 days)"""
        hoje = timezone.now().date()
        data_limite = hoje + timezone.timedelta(days=7)
        contas = self.queryset.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=data_limite
        )
        serializer = ContaPagarListSerializer(contas, many=True)
        return Response(serializer.data)


class ContaReceberViewSet(viewsets.ModelViewSet):
    """ViewSet for ContaReceber"""
    queryset = ContaReceber.objects.select_related('cliente', 'categoria', 'conta_bancaria').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'descricao', 'cliente__nome_razao_social', 'numero_documento']
    ordering_fields = ['data_vencimento', 'valor_original']
    filterset_fields = ['status', 'cliente', 'categoria']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContaReceberListSerializer
        return ContaReceberSerializer
    
    @action(detail=True, methods=['post'])
    def receber(self, request, pk=None):
        """Receive payment"""
        conta = self.get_object()
        
        if conta.status == 'recebido':
            return Response({'error': 'Conta já foi recebida'}, status=status.HTTP_400_BAD_REQUEST)
        
        valor_recebido = request.data.get('valor_recebido', conta.valor_total)
        data_recebimento = request.data.get('data_recebimento', timezone.now().date())
        conta_bancaria_id = request.data.get('conta_bancaria')
        
        conta.valor_recebido = valor_recebido
        conta.data_recebimento = data_recebimento
        conta.status = 'recebido'
        
        if conta_bancaria_id:
            conta.conta_bancaria_id = conta_bancaria_id
        
        conta.save()
        
        return Response({
            'message': 'Recebimento registrado com sucesso',
            'conta': ContaReceberSerializer(conta).data
        })
    
    @action(detail=False, methods=['get'])
    def vencidas(self, request):
        """Get overdue accounts"""
        hoje = timezone.now().date()
        contas = self.queryset.filter(status='pendente', data_vencimento__lt=hoje)
        serializer = ContaReceberListSerializer(contas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vencendo(self, request):
        """Get accounts due soon (next 7 days)"""
        hoje = timezone.now().date()
        data_limite = hoje + timezone.timedelta(days=7)
        contas = self.queryset.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=data_limite
        )
        serializer = ContaReceberListSerializer(contas, many=True)
        return Response(serializer.data)


class FluxoCaixaViewSet(viewsets.ModelViewSet):
    """ViewSet for FluxoCaixa"""
    queryset = FluxoCaixa.objects.select_related('categoria', 'conta_bancaria').all()
    serializer_class = FluxoCaixaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['descricao']
    ordering_fields = ['data', 'valor']
    filterset_fields = ['tipo', 'categoria', 'conta_bancaria']
    
    @action(detail=False, methods=['get'])
    def resumo(self, request):
        """Get cash flow summary"""
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        queryset = self.queryset
        
        if data_inicio:
            queryset = queryset.filter(data__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data__lte=data_fim)
        
        entradas = queryset.filter(tipo='entrada').aggregate(total=Sum('valor'))['total'] or 0
        saidas = queryset.filter(tipo='saida').aggregate(total=Sum('valor'))['total'] or 0
        saldo = entradas - saidas
        
        return Response({
            'entradas': entradas,
            'saidas': saidas,
            'saldo': saldo,
            'periodo': {
                'inicio': data_inicio,
                'fim': data_fim
            }
        })
    
    @action(detail=False, methods=['get'])
    def por_categoria(self, request):
        """Get cash flow by category"""
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        queryset = self.queryset
        
        if data_inicio:
            queryset = queryset.filter(data__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(data__lte=data_fim)
        
        por_categoria = queryset.values(
            'categoria__nome', 'tipo'
        ).annotate(
            total=Sum('valor')
        ).order_by('-total')
        
        return Response(list(por_categoria))


class FormaRecebimentoViewSet(viewsets.ModelViewSet):
    """ViewSet for FormaRecebimento"""
    queryset = FormaRecebimento.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'operadora']
    ordering_fields = ['nome', 'tipo']
    filterset_fields = ['tipo', 'ativo', 'permite_parcelamento']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FormaRecebimentoListSerializer
        return FormaRecebimentoSerializer
    
    @action(detail=True, methods=['post'])
    def calcular_taxa(self, request, pk=None):
        """Calculate fee for a given value and installments"""
        forma = self.get_object()
        
        valor = request.data.get('valor')
        parcelas = request.data.get('parcelas', 1)
        
        if not valor:
            return Response(
                {'error': 'Valor é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            valor = Decimal(str(valor))
            parcelas = int(parcelas)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Valor ou parcelas inválidos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if parcelas > forma.max_parcelas:
            return Response(
                {'error': f'Número máximo de parcelas é {forma.max_parcelas}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        taxa_total, valor_liquido = forma.calcular_taxa(valor, parcelas)
        
        return Response({
            'valor_bruto': valor,
            'parcelas': parcelas,
            'taxa_percentual': forma.taxa_percentual,
            'taxa_fixa': forma.taxa_fixa,
            'taxa_total': taxa_total,
            'valor_liquido': valor_liquido,
            'valor_parcela': valor / parcelas if parcelas > 0 else valor,
            'dias_recebimento': forma.dias_recebimento
        })
    
    @action(detail=False, methods=['get'])
    def ativos(self, request):
        """Get only active payment methods"""
        formas = self.queryset.filter(ativo=True)
        serializer = FormaRecebimentoListSerializer(formas, many=True)
        return Response(serializer.data)


# Manter compatibilidade com código antigo
class FormaPagamentoViewSet(FormaRecebimentoViewSet):
    """Alias for backward compatibility"""
    pass


class PagamentoViewSet(viewsets.ModelViewSet):
    queryset = Pagamento.objects.all()
    serializer_class = PagamentoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ordem_servico']


class ParcelaViewSet(viewsets.ModelViewSet):
    queryset = Parcela.objects.all()
    serializer_class = ParcelaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pagamento', 'recebido']
