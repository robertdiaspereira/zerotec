"""
Views for Compras models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import (
    Cotacao, ItemCotacao, PedidoCompra, ItemPedidoCompra,
    RecebimentoMercadoria, ItemRecebimento
)
from .serializers import (
    CotacaoSerializer, CotacaoListSerializer, ItemCotacaoSerializer,
    PedidoCompraSerializer, PedidoCompraListSerializer, ItemPedidoCompraSerializer,
    RecebimentoMercadoriaSerializer, RecebimentoMercadoriaListSerializer,
    ItemRecebimentoSerializer
)


class CotacaoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cotacao
    """
    queryset = Cotacao.objects.select_related('solicitante').prefetch_related('itens').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'observacoes']
    ordering_fields = ['data_solicitacao', 'data_validade']
    filterset_fields = ['status', 'solicitante']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CotacaoListSerializer
        return CotacaoSerializer
    
    @action(detail=True, methods=['post'])
    def adicionar_item(self, request, pk=None):
        """Add item to quotation"""
        cotacao = self.get_object()
        
        if cotacao.status != 'em_andamento':
            return Response({
                'error': 'Cotação não está em andamento'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ItemCotacaoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item = ItemCotacao.objects.create(
            cotacao=cotacao,
            **serializer.validated_data
        )
        
        return Response(ItemCotacaoSerializer(item).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """Finalize quotation"""
        cotacao = self.get_object()
        
        if cotacao.status != 'em_andamento':
            return Response({
                'error': 'Cotação não está em andamento'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cotacao.status = 'concluida'
        cotacao.save()
        
        return Response({
            'message': 'Cotação finalizada com sucesso',
            'cotacao': CotacaoSerializer(cotacao).data
        })
    
    @action(detail=True, methods=['get'])
    def melhor_preco(self, request, pk=None):
        """Get best price analysis"""
        cotacao = self.get_object()
        
        # Group by supplier and calculate totals
        from django.db.models import Sum, F
        
        fornecedores = cotacao.itens.values(
            'fornecedor__id',
            'fornecedor__razao_social'
        ).annotate(
            total=Sum(F('preco_unitario') * F('quantidade')),
            total_itens=models.Count('id')
        ).order_by('total')
        
        return Response({
            'cotacao': CotacaoSerializer(cotacao).data,
            'analise_fornecedores': list(fornecedores)
        })


class PedidoCompraViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PedidoCompra
    """
    queryset = PedidoCompra.objects.select_related('fornecedor', 'comprador').prefetch_related('itens').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'fornecedor__razao_social', 'observacoes']
    ordering_fields = ['data_pedido', 'data_entrega_prevista', 'valor_total']
    filterset_fields = ['status', 'fornecedor', 'comprador', 'forma_pagamento', 'itens__produto']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PedidoCompraListSerializer
        return PedidoCompraSerializer
    
    @action(detail=True, methods=['post'])
    def adicionar_item(self, request, pk=None):
        """Add item to purchase order"""
        pedido = self.get_object()
        
        if pedido.status not in ['pendente', 'aprovado']:
            return Response({
                'error': 'Pedido não pode ser modificado neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ItemPedidoCompraSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item = ItemPedidoCompra.objects.create(
            pedido=pedido,
            **serializer.validated_data
        )
        
        # Recalculate order total
        pedido.valor_produtos = sum(
            i.preco_total for i in pedido.itens.all()
        )
        pedido.save()
        
        return Response(ItemPedidoCompraSerializer(item).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def aprovar(self, request, pk=None):
        """Approve purchase order"""
        pedido = self.get_object()
        
        if pedido.status != 'pendente':
            return Response({
                'error': 'Pedido não está pendente'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        pedido.status = 'aprovado'
        pedido.save()
        
        return Response({
            'message': 'Pedido aprovado com sucesso',
            'pedido': PedidoCompraSerializer(pedido).data
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancel purchase order"""
        pedido = self.get_object()
        
        if pedido.status in ['recebido', 'cancelado']:
            return Response({
                'error': 'Pedido não pode ser cancelado neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        pedido.status = 'cancelado'
        pedido.save()
        
        return Response({
            'message': 'Pedido cancelado com sucesso',
            'pedido': PedidoCompraSerializer(pedido).data
        })


class RecebimentoMercadoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RecebimentoMercadoria
    """
    queryset = RecebimentoMercadoria.objects.select_related(
        'pedido_compra', 'recebedor'
    ).prefetch_related('itens').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nota_fiscal', 'pedido_compra__numero']
    ordering_fields = ['data_recebimento']
    filterset_fields = ['pedido_compra', 'recebedor']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RecebimentoMercadoriaListSerializer
        return RecebimentoMercadoriaSerializer
    
    @action(detail=True, methods=['post'])
    def conferir(self, request, pk=None):
        """Mark receiving as checked"""
        recebimento = self.get_object()
        
        serializer = ItemRecebimentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create receiving item
        item = ItemRecebimento.objects.create(
            recebimento=recebimento,
            **serializer.validated_data
        )
        
        return Response(ItemRecebimentoSerializer(item).data, status=status.HTTP_201_CREATED)
