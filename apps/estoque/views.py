"""
Views for Estoque models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models as django_models
from .models import MovimentacaoEstoque, Lote, Inventario, ItemInventario
from apps.erp.models import Produto
from .serializers import (
    MovimentacaoEstoqueSerializer,
    MovimentacaoEstoqueListSerializer,
    LoteSerializer,
    InventarioSerializer,
    InventarioListSerializer,
    ItemInventarioSerializer,
    EntradaEstoqueSerializer,
    SaidaEstoqueSerializer,
    AjusteEstoqueSerializer,
    TransferenciaEstoqueSerializer,
)


class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for MovimentacaoEstoque
    """
    queryset = MovimentacaoEstoque.objects.select_related('produto', 'usuario').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['produto__nome', 'produto__codigo_interno', 'documento_numero', 'motivo']
    ordering_fields = ['data_movimentacao', 'quantidade', 'valor_total']
    filterset_fields = ['tipo', 'produto', 'documento', 'usuario']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MovimentacaoEstoqueListSerializer
        return MovimentacaoEstoqueSerializer


class LoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lote
    """
    queryset = Lote.objects.select_related('produto', 'fornecedor').all()
    serializer_class = LoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero_lote', 'produto__nome', 'nota_fiscal']
    ordering_fields = ['data_validade', 'data_fabricacao', 'quantidade']
    filterset_fields = ['produto', 'fornecedor', 'active']
    
    @action(detail=False, methods=['get'])
    def vencendo(self, request):
        """
        Get batches expiring soon (next 30 days)
        """
        hoje = timezone.now().date()
        data_limite = hoje + timezone.timedelta(days=30)
        
        lotes = self.queryset.filter(
            data_validade__gte=hoje,
            data_validade__lte=data_limite,
            quantidade__gt=0,
            active=True
        ).order_by('data_validade')
        
        serializer = self.get_serializer(lotes, many=True)
        return Response(serializer.data)


class InventarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Inventario
    """
    queryset = Inventario.objects.select_related('responsavel').prefetch_related('itens').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['data_inicio', 'data_conclusao']
    filterset_fields = ['status', 'responsavel']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InventarioListSerializer
        return InventarioSerializer
    
    @action(detail=True, methods=['post'])
    def adicionar_item(self, request, pk=None):
        """
        Add item to inventory
        """
        inventario = self.get_object()
        
        if inventario.status != 'em_andamento':
            return Response({
                'error': 'Inventário não está em andamento'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ItemInventarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get product current stock
        produto = serializer.validated_data['produto']
        quantidade_sistema = produto.estoque_atual
        
        # Create item
        item = ItemInventario.objects.create(
            inventario=inventario,
            produto=produto,
            quantidade_sistema=quantidade_sistema,
            quantidade_contada=serializer.validated_data['quantidade_contada']
        )
        
        return Response(ItemInventarioSerializer(item).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """
        Finalize inventory and adjust stock
        """
        inventario = self.get_object()
        
        if inventario.status != 'em_andamento':
            return Response({
                'error': 'Inventário não está em andamento'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Adjust stock for all items with differences
        itens_ajustados = 0
        for item in inventario.itens.filter(ajustado=False):
            if item.diferenca != 0:
                # Create adjustment movement
                MovimentacaoEstoque.objects.create(
                    produto=item.produto,
                    tipo='inventario',
                    quantidade=item.quantidade_contada,
                    valor_unitario=item.produto.preco_custo,
                    motivo=f'Ajuste de inventário #{inventario.id}',
                    documento='inventario',
                    documento_numero=str(inventario.id),
                    usuario=request.user
                )
                
                item.ajustado = True
                item.save()
                itens_ajustados += 1
        
        # Update inventory status
        inventario.status = 'concluido'
        inventario.data_conclusao = timezone.now()
        inventario.save()
        
        return Response({
            'message': f'Inventário finalizado. {itens_ajustados} itens ajustados.',
            'inventario': InventarioSerializer(inventario).data
        })


class EstoqueViewSet(viewsets.ViewSet):
    """
    ViewSet for stock operations (entrada, saida, ajuste, transferencia)
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def entrada(self, request):
        """Stock entry"""
        serializer = EntradaEstoqueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        produto = Produto.objects.get(pk=serializer.validated_data['produto'])
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo='entrada',
            quantidade=serializer.validated_data['quantidade'],
            valor_unitario=serializer.validated_data['valor_unitario'],
            lote=serializer.validated_data.get('lote', ''),
            data_validade=serializer.validated_data.get('data_validade'),
            documento='nota_fiscal',
            documento_numero=serializer.validated_data.get('documento_numero', ''),
            motivo=serializer.validated_data.get('motivo', 'Entrada de estoque'),
            usuario=request.user
        )
        
        return Response(
            MovimentacaoEstoqueSerializer(movimentacao).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def saida(self, request):
        """Stock exit"""
        serializer = SaidaEstoqueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        produto = Produto.objects.get(pk=serializer.validated_data['produto'])
        
        # Check if there's enough stock
        if produto.estoque_atual < serializer.validated_data['quantidade']:
            return Response({
                'error': f'Estoque insuficiente. Disponível: {produto.estoque_atual}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo='saida',
            quantidade=serializer.validated_data['quantidade'],
            valor_unitario=produto.preco_custo,
            documento='ajuste_manual',
            documento_numero=serializer.validated_data.get('documento_numero', ''),
            motivo=serializer.validated_data.get('motivo', 'Saída de estoque'),
            usuario=request.user
        )
        
        return Response(
            MovimentacaoEstoqueSerializer(movimentacao).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def ajuste(self, request):
        """Stock adjustment"""
        serializer = AjusteEstoqueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        produto = Produto.objects.get(pk=serializer.validated_data['produto'])
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo='ajuste',
            quantidade=serializer.validated_data['quantidade_nova'],
            valor_unitario=produto.preco_custo,
            documento='ajuste_manual',
            motivo=serializer.validated_data['motivo'],
            usuario=request.user
        )
        
        return Response(
            MovimentacaoEstoqueSerializer(movimentacao).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def transferencia(self, request):
        """Stock transfer between locations"""
        serializer = TransferenciaEstoqueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        produto = Produto.objects.get(pk=serializer.validated_data['produto'])
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo='transferencia',
            quantidade=serializer.validated_data['quantidade'],
            valor_unitario=produto.preco_custo,
            local_origem=serializer.validated_data['local_origem'],
            local_destino=serializer.validated_data['local_destino'],
            documento='transferencia',
            motivo=serializer.validated_data.get('motivo', 'Transferência de estoque'),
            usuario=request.user
        )
        
        return Response(
            MovimentacaoEstoqueSerializer(movimentacao).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def posicao(self, request):
        """Current stock position"""
        produtos = Produto.objects.filter(active=True, tipo='produto').values(
            'id', 'codigo_interno', 'nome', 'estoque_atual',
            'estoque_minimo', 'preco_custo'
        ).annotate(
            valor_estoque=django_models.F('estoque_atual') * django_models.F('preco_custo')
        )
        
        total_valor = sum(p['valor_estoque'] for p in produtos)
        
        return Response({
            'produtos': list(produtos),
            'total_produtos': produtos.count(),
            'valor_total_estoque': total_valor
        })
    
    @action(detail=False, methods=['get'])
    def alertas(self, request):
        """Stock alerts (low stock)"""
        produtos = Produto.objects.filter(
            active=True,
            tipo='produto',
            estoque_atual__lt=django_models.F('estoque_minimo')
        ).values(
            'id', 'codigo_interno', 'nome', 'estoque_atual', 'estoque_minimo'
        )
        
        return Response({
            'produtos': list(produtos),
            'total_alertas': produtos.count()
        })
