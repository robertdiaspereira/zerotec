"""
Serializers for Financeiro models
"""

from rest_framework import serializers
from .models import CategoriaFinanceira, ContaBancaria, ContaPagar, ContaReceber, FluxoCaixa


class CategoriaFinanceiraSerializer(serializers.ModelSerializer):
    """Serializer for CategoriaFinanceira"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = CategoriaFinanceira
        fields = [
            'id', 'nome', 'tipo', 'tipo_display', 'descricao',
            'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContaBancariaSerializer(serializers.ModelSerializer):
    """Serializer for ContaBancaria"""
    
    class Meta:
        model = ContaBancaria
        fields = [
            'id', 'banco', 'agencia', 'conta', 'tipo_conta',
            'saldo_inicial', 'saldo_atual', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'saldo_atual', 'created_at', 'updated_at']


class ContaPagarSerializer(serializers.ModelSerializer):
    """Serializer for ContaPagar"""
    
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    conta_bancaria_nome = serializers.CharField(source='conta_bancaria.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    valor_total = serializers.ReadOnlyField()
    saldo_pendente = serializers.ReadOnlyField()
    dias_atraso = serializers.ReadOnlyField()
    
    class Meta:
        model = ContaPagar
        fields = [
            'id', 'numero', 'fornecedor', 'fornecedor_nome', 'categoria',
            'categoria_nome', 'descricao', 'valor_original', 'valor_pago',
            'juros', 'multa', 'desconto', 'valor_total', 'saldo_pendente',
            'data_emissao', 'data_vencimento', 'data_pagamento',
            'conta_bancaria', 'conta_bancaria_nome', 'forma_pagamento',
            'status', 'status_display', 'observacoes', 'numero_documento',
            'dias_atraso', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'valor_total', 'saldo_pendente', 'dias_atraso',
            'created_at', 'updated_at'
        ]


class ContaPagarListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing accounts payable"""
    
    fornecedor_nome = serializers.CharField(source='fornecedor.razao_social', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    valor_total = serializers.ReadOnlyField()
    
    class Meta:
        model = ContaPagar
        fields = [
            'id', 'numero', 'fornecedor_nome', 'descricao',
            'data_vencimento', 'valor_total', 'status', 'status_display'
        ]


class ContaReceberSerializer(serializers.ModelSerializer):
    """Serializer for ContaReceber"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    conta_bancaria_nome = serializers.CharField(source='conta_bancaria.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    valor_total = serializers.ReadOnlyField()
    saldo_pendente = serializers.ReadOnlyField()
    dias_atraso = serializers.ReadOnlyField()
    
    class Meta:
        model = ContaReceber
        fields = [
            'id', 'numero', 'cliente', 'cliente_nome', 'categoria',
            'categoria_nome', 'descricao', 'valor_original', 'valor_recebido',
            'juros', 'multa', 'desconto', 'valor_total', 'saldo_pendente',
            'data_emissao', 'data_vencimento', 'data_recebimento',
            'conta_bancaria', 'conta_bancaria_nome', 'forma_recebimento',
            'status', 'status_display', 'observacoes', 'numero_documento',
            'dias_atraso', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'valor_total', 'saldo_pendente', 'dias_atraso',
            'created_at', 'updated_at'
        ]


class ContaReceberListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing accounts receivable"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    valor_total = serializers.ReadOnlyField()
    
    class Meta:
        model = ContaReceber
        fields = [
            'id', 'numero', 'cliente_nome', 'descricao',
            'data_vencimento', 'valor_total', 'status', 'status_display'
        ]


class FluxoCaixaSerializer(serializers.ModelSerializer):
    """Serializer for FluxoCaixa"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    conta_bancaria_nome = serializers.CharField(source='conta_bancaria.__str__', read_only=True)
    
    class Meta:
        model = FluxoCaixa
        fields = [
            'id', 'data', 'tipo', 'tipo_display', 'categoria', 'categoria_nome',
            'descricao', 'valor', 'conta_bancaria', 'conta_bancaria_nome',
            'conta_pagar', 'conta_receber', 'observacoes'
        ]
        read_only_fields = ['id']
