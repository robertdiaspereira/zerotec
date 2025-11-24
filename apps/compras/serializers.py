"""
Serializers for Compras models
"""

from rest_framework import serializers
from .models import (
    Cotacao, ItemCotacao, PedidoCompra, ItemPedidoCompra,
    RecebimentoMercadoria, ItemRecebimento
)


class ItemCotacaoSerializer(serializers.ModelSerializer):
    """Serializer for ItemCotacao"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    
    class Meta:
        model = ItemCotacao
        fields = [
            'id', 'cotacao', 'produto', 'produto_nome', 'quantidade',
            'fornecedor', 'fornecedor_nome', 'preco_unitario', 'preco_total',
            'prazo_entrega', 'observacoes'
        ]
        read_only_fields = ['id', 'preco_total']


class CotacaoSerializer(serializers.ModelSerializer):
    """Serializer for Cotacao"""
    
    itens = ItemCotacaoSerializer(many=True, read_only=True)
    solicitante_nome = serializers.CharField(source='solicitante.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    melhor_fornecedor = serializers.ReadOnlyField()
    
    class Meta:
        model = Cotacao
        fields = [
            'id', 'numero', 'data_solicitacao', 'data_validade', 'status',
            'status_display', 'solicitante', 'solicitante_nome', 'observacoes',
            'itens', 'total_itens', 'melhor_fornecedor', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'data_solicitacao', 'created_at', 'updated_at',
            'total_itens', 'melhor_fornecedor'
        ]
    
    def create(self, validated_data):
        """Add current user as solicitante"""
        validated_data['solicitante'] = self.context['request'].user
        return super().create(validated_data)


class CotacaoListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing quotations"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    
    class Meta:
        model = Cotacao
        fields = [
            'id', 'numero', 'data_solicitacao', 'data_validade',
            'status', 'status_display', 'total_itens'
        ]


class ItemPedidoCompraSerializer(serializers.ModelSerializer):
    """Serializer for ItemPedidoCompra"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo_interno', read_only=True)
    pendente_receber = serializers.ReadOnlyField()
    
    class Meta:
        model = ItemPedidoCompra
        fields = [
            'id', 'pedido', 'produto', 'produto_nome', 'produto_codigo',
            'quantidade_pedida', 'quantidade_recebida', 'preco_unitario',
            'preco_total', 'desconto', 'pendente_receber'
        ]
        read_only_fields = ['id', 'preco_total', 'quantidade_recebida', 'pendente_receber']


class PedidoCompraSerializer(serializers.ModelSerializer):
    """Serializer for PedidoCompra"""
    
    itens = ItemPedidoCompraSerializer(many=True, read_only=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    comprador_nome = serializers.CharField(source='comprador.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    forma_pagamento_display = serializers.CharField(source='get_forma_pagamento_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    percentual_recebido = serializers.ReadOnlyField()
    
    class Meta:
        model = PedidoCompra
        fields = [
            'id', 'numero', 'fornecedor', 'fornecedor_nome', 'data_pedido',
            'data_entrega_prevista', 'data_entrega_real', 'status', 'status_display',
            'valor_produtos', 'valor_frete', 'valor_desconto', 'valor_total',
            'forma_pagamento', 'forma_pagamento_display', 'condicao_pagamento',
            'comprador', 'comprador_nome', 'observacoes', 'itens', 'total_itens',
            'percentual_recebido', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'data_pedido', 'valor_total', 'created_at',
            'updated_at', 'total_itens', 'percentual_recebido'
        ]
    
    def create(self, validated_data):
        """Add current user as comprador"""
        validated_data['comprador'] = self.context['request'].user
        return super().create(validated_data)


class PedidoCompraListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing purchase orders"""
    
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PedidoCompra
        fields = [
            'id', 'numero', 'fornecedor_nome', 'data_pedido',
            'data_entrega_prevista', 'status', 'status_display', 'valor_total'
        ]


class ItemRecebimentoSerializer(serializers.ModelSerializer):
    """Serializer for ItemRecebimento"""
    
    produto_nome = serializers.CharField(source='item_pedido.produto.nome', read_only=True)
    
    class Meta:
        model = ItemRecebimento
        fields = [
            'id', 'recebimento', 'item_pedido', 'produto_nome',
            'quantidade', 'lote', 'data_validade', 'conferido'
        ]
        read_only_fields = ['id']


class RecebimentoMercadoriaSerializer(serializers.ModelSerializer):
    """Serializer for RecebimentoMercadoria"""
    
    itens = ItemRecebimentoSerializer(many=True, read_only=True)
    pedido_numero = serializers.CharField(source='pedido_compra.numero', read_only=True)
    recebedor_nome = serializers.CharField(source='recebedor.get_full_name', read_only=True)
    total_itens = serializers.ReadOnlyField()
    
    class Meta:
        model = RecebimentoMercadoria
        fields = [
            'id', 'pedido_compra', 'pedido_numero', 'nota_fiscal',
            'data_recebimento', 'recebedor', 'recebedor_nome',
            'observacoes', 'itens', 'total_itens', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'data_recebimento', 'created_at', 'updated_at', 'total_itens'
        ]
    
    def create(self, validated_data):
        """Add current user as recebedor"""
        validated_data['recebedor'] = self.context['request'].user
        return super().create(validated_data)


class RecebimentoMercadoriaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing receivings"""
    
    pedido_numero = serializers.CharField(source='pedido_compra.numero', read_only=True)
    total_itens = serializers.ReadOnlyField()
    
    class Meta:
        model = RecebimentoMercadoria
        fields = [
            'id', 'pedido_numero', 'nota_fiscal',
            'data_recebimento', 'total_itens'
        ]
