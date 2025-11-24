"""
Serializers for Vendas models
"""

from rest_framework import serializers
from .models import Venda, ItemVenda, FormaPagamento, PDV, MovimentoPDV


class ItemVendaSerializer(serializers.ModelSerializer):
    """Serializer for ItemVenda"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo_interno', read_only=True)
    
    class Meta:
        model = ItemVenda
        fields = [
            'id', 'venda', 'produto', 'produto_nome', 'produto_codigo',
            'quantidade', 'preco_unitario', 'preco_total',
            'desconto', 'acrescimo'
        ]
        read_only_fields = ['id', 'preco_total']


class FormaPagamentoSerializer(serializers.ModelSerializer):
    """Serializer for FormaPagamento"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = FormaPagamento
        fields = [
            'id', 'venda', 'tipo', 'tipo_display', 'valor',
            'parcelas', 'data_vencimento', 'status', 'status_display'
        ]
        read_only_fields = ['id']


class VendaSerializer(serializers.ModelSerializer):
    """Serializer for Venda"""
    
    itens = ItemVendaSerializer(many=True, read_only=True)
    pagamentos = FormaPagamentoSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    vendedor_nome = serializers.CharField(source='vendedor.get_full_name', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_itens = serializers.ReadOnlyField()
    total_pago = serializers.ReadOnlyField()
    saldo_pendente = serializers.ReadOnlyField()
    
    class Meta:
        model = Venda
        fields = [
            'id', 'numero', 'tipo', 'tipo_display', 'cliente', 'cliente_nome',
            'data_venda', 'data_entrega', 'status', 'status_display',
            'valor_produtos', 'valor_desconto', 'valor_acrescimo', 'valor_total',
            'vendedor', 'vendedor_nome', 'observacoes', 'itens', 'pagamentos',
            'total_itens', 'total_pago', 'saldo_pendente', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'data_venda', 'valor_produtos', 'valor_total',
            'created_at', 'updated_at', 'total_itens', 'total_pago', 'saldo_pendente'
        ]
    
    def create(self, validated_data):
        """Add current user as vendedor"""
        validated_data['vendedor'] = self.context['request'].user
        return super().create(validated_data)


class VendaListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing sales"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Venda
        fields = [
            'id', 'numero', 'cliente_nome', 'data_venda',
            'status', 'status_display', 'valor_total'
        ]


class MovimentoPDVSerializer(serializers.ModelSerializer):
    """Serializer for MovimentoPDV"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = MovimentoPDV
        fields = [
            'id', 'pdv', 'tipo', 'tipo_display', 'valor', 'descricao', 'data'
        ]
        read_only_fields = ['id', 'data']


class PDVSerializer(serializers.ModelSerializer):
    """Serializer for PDV"""
    
    movimentos = MovimentoPDVSerializer(many=True, read_only=True)
    operador_nome = serializers.CharField(source='operador.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_movimentos = serializers.ReadOnlyField()
    saldo_calculado = serializers.ReadOnlyField()
    
    class Meta:
        model = PDV
        fields = [
            'id', 'numero_caixa', 'operador', 'operador_nome',
            'data_abertura', 'data_fechamento', 'valor_inicial',
            'valor_vendas', 'valor_sangrias', 'valor_suprimentos',
            'valor_final', 'status', 'status_display', 'movimentos',
            'total_movimentos', 'saldo_calculado', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'data_abertura', 'data_fechamento', 'valor_vendas',
            'valor_sangrias', 'valor_suprimentos', 'created_at', 'updated_at',
            'total_movimentos', 'saldo_calculado'
        ]
    
    def create(self, validated_data):
        """Add current user as operador"""
        validated_data['operador'] = self.context['request'].user
        return super().create(validated_data)


class PDVListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing PDVs"""
    
    operador_nome = serializers.CharField(source='operador.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PDV
        fields = [
            'id', 'numero_caixa', 'operador_nome', 'data_abertura',
            'status', 'status_display', 'valor_final'
        ]
