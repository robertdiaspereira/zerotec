"""
Serializers for Estoque models
"""

from rest_framework import serializers
from django.utils import timezone
from .models import MovimentacaoEstoque, Lote, Inventario, ItemInventario
from apps.erp.serializers import ProdutoListSerializer


class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    """Serializer for MovimentacaoEstoque"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo_interno', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    documento_display = serializers.CharField(source='get_documento_display', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = MovimentacaoEstoque
        fields = [
            'id', 'produto', 'produto_nome', 'produto_codigo', 'tipo', 'tipo_display',
            'quantidade', 'quantidade_anterior', 'quantidade_nova', 'valor_unitario',
            'valor_total', 'motivo', 'documento', 'documento_display', 'documento_numero',
            'lote', 'data_validade', 'local_origem', 'local_destino', 'usuario',
            'usuario_nome', 'data_movimentacao', 'observacoes', 'active'
        ]
        read_only_fields = [
            'id', 'quantidade_anterior', 'quantidade_nova', 'valor_total',
            'data_movimentacao', 'usuario'
        ]
    
    def create(self, validated_data):
        """Add current user to the movement"""
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class MovimentacaoEstoqueListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing movements"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = MovimentacaoEstoque
        fields = [
            'id', 'produto_nome', 'tipo', 'tipo_display', 'quantidade',
            'valor_total', 'data_movimentacao'
        ]


class LoteSerializer(serializers.ModelSerializer):
    """Serializer for Lote"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    vencido = serializers.ReadOnlyField()
    dias_para_vencer = serializers.ReadOnlyField()
    
    class Meta:
        model = Lote
        fields = [
            'id', 'produto', 'produto_nome', 'numero_lote', 'data_fabricacao',
            'data_validade', 'quantidade', 'fornecedor', 'fornecedor_nome',
            'nota_fiscal', 'vencido', 'dias_para_vencer', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'vencido', 'dias_para_vencer']


class ItemInventarioSerializer(serializers.ModelSerializer):
    """Serializer for ItemInventario"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo_interno', read_only=True)
    
    class Meta:
        model = ItemInventario
        fields = [
            'id', 'inventario', 'produto', 'produto_nome', 'produto_codigo',
            'quantidade_sistema', 'quantidade_contada', 'diferenca',
            'valor_diferenca', 'ajustado'
        ]
        read_only_fields = ['id', 'diferenca', 'valor_diferenca']


class InventarioSerializer(serializers.ModelSerializer):
    """Serializer for Inventario"""
    
    itens = ItemInventarioSerializer(many=True, read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    total_diferencas = serializers.ReadOnlyField()
    valor_total_diferenca = serializers.ReadOnlyField()
    
    class Meta:
        model = Inventario
        fields = [
            'id', 'data_inicio', 'data_conclusao', 'status', 'status_display',
            'responsavel', 'responsavel_nome', 'observacoes', 'itens',
            'total_itens', 'total_diferencas', 'valor_total_diferenca',
            'active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'data_inicio', 'data_conclusao', 'created_at', 'updated_at',
            'total_itens', 'total_diferencas', 'valor_total_diferenca'
        ]
    
    def create(self, validated_data):
        """Add current user as responsible"""
        validated_data['responsavel'] = self.context['request'].user
        return super().create(validated_data)


class InventarioListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing inventories"""
    
    responsavel_nome = serializers.CharField(source='responsavel.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    
    class Meta:
        model = Inventario
        fields = [
            'id', 'data_inicio', 'status', 'status_display',
            'responsavel_nome', 'total_itens'
        ]


class EntradaEstoqueSerializer(serializers.Serializer):
    """Serializer for stock entry"""
    
    produto = serializers.IntegerField()
    quantidade = serializers.DecimalField(max_digits=10, decimal_places=3, min_value=0.001)
    valor_unitario = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    lote = serializers.CharField(max_length=50, required=False, allow_blank=True)
    data_validade = serializers.DateField(required=False, allow_null=True)
    documento_numero = serializers.CharField(max_length=50, required=False, allow_blank=True)
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True)


class SaidaEstoqueSerializer(serializers.Serializer):
    """Serializer for stock exit"""
    
    produto = serializers.IntegerField()
    quantidade = serializers.DecimalField(max_digits=10, decimal_places=3, min_value=0.001)
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True)
    documento_numero = serializers.CharField(max_length=50, required=False, allow_blank=True)


class AjusteEstoqueSerializer(serializers.Serializer):
    """Serializer for stock adjustment"""
    
    produto = serializers.IntegerField()
    quantidade_nova = serializers.DecimalField(max_digits=10, decimal_places=3, min_value=0)
    motivo = serializers.CharField(max_length=200)


class TransferenciaEstoqueSerializer(serializers.Serializer):
    """Serializer for stock transfer"""
    
    produto = serializers.IntegerField()
    quantidade = serializers.DecimalField(max_digits=10, decimal_places=3, min_value=0.001)
    local_origem = serializers.CharField(max_length=100)
    local_destino = serializers.CharField(max_length=100)
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True)
