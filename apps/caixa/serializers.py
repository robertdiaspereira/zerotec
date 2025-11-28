"""
Serializers for Caixa app
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Caixa


class UserSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para usuário"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class CaixaSerializer(serializers.ModelSerializer):
    """Serializer completo para Caixa"""
    usuario_abertura_nome = serializers.CharField(source='usuario_abertura.get_full_name', read_only=True)
    usuario_fechamento_nome = serializers.CharField(source='usuario_fechamento.get_full_name', read_only=True)
    quebra_caixa = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_vendas = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantidade_vendas = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Caixa
        fields = [
            'id',
            'usuario_abertura',
            'usuario_abertura_nome',
            'usuario_fechamento',
            'usuario_fechamento_nome',
            'data_abertura',
            'data_fechamento',
            'valor_inicial',
            'valor_final',
            'valor_esperado',
            'observacoes_abertura',
            'observacoes_fechamento',
            'status',
            'quebra_caixa',
            'total_vendas',
            'quantidade_vendas',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'usuario_abertura',
            'data_abertura',
            'valor_esperado',
            'status',
            'created_at',
            'updated_at',
        ]


class CaixaAbrirSerializer(serializers.Serializer):
    """Serializer para abertura de caixa"""
    valor_inicial = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        help_text='Valor inicial em dinheiro (contagem física)'
    )
    observacoes_abertura = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Observações sobre a abertura do caixa'
    )


class CaixaFecharSerializer(serializers.Serializer):
    """Serializer para fechamento de caixa"""
    valor_final = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0,
        help_text='Valor final em dinheiro (contagem física)'
    )
    observacoes_fechamento = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Observações sobre o fechamento (especialmente se houver quebra)'
    )


class CaixaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de caixas"""
    usuario_abertura_nome = serializers.CharField(source='usuario_abertura.get_full_name', read_only=True)
    usuario_fechamento_nome = serializers.CharField(source='usuario_fechamento.get_full_name', read_only=True)
    quebra_caixa = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_vendas = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantidade_vendas = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Caixa
        fields = [
            'id',
            'usuario_abertura',
            'usuario_abertura_nome',
            'usuario_fechamento_nome',
            'data_abertura',
            'data_fechamento',
            'valor_inicial',
            'valor_final',
            'status',
            'quebra_caixa',
            'total_vendas',
            'quantidade_vendas',
        ]
