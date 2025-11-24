"""
Admin configuration for Financeiro app
"""

from django.contrib import admin
from .models import CategoriaFinanceira, ContaBancaria, ContaPagar, ContaReceber, FluxoCaixa


@admin.register(CategoriaFinanceira)
class CategoriaFinanceiraAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'active']
    list_filter = ['tipo', 'active']
    search_fields = ['nome', 'descricao']


@admin.register(ContaBancaria)
class ContaBancariaAdmin(admin.ModelAdmin):
    list_display = ['banco', 'agencia', 'conta', 'tipo_conta', 'saldo_atual', 'active']
    list_filter = ['banco', 'active']
    search_fields = ['banco', 'agencia', 'conta']
    readonly_fields = ['saldo_atual', 'created_at', 'updated_at']


@admin.register(ContaPagar)
class ContaPagarAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'fornecedor', 'descricao', 'data_vencimento',
        'valor_total', 'valor_pago', 'status', 'dias_atraso'
    ]
    list_filter = ['status', 'data_vencimento', 'categoria']
    search_fields = ['numero', 'descricao', 'fornecedor__razao_social', 'numero_documento']
    readonly_fields = ['numero', 'valor_total', 'saldo_pendente', 'dias_atraso', 'created_at', 'updated_at']
    date_hierarchy = 'data_vencimento'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'fornecedor', 'categoria', 'descricao')
        }),
        ('Valores', {
            'fields': (
                'valor_original', 'valor_pago', 'juros', 'multa',
                'desconto', 'valor_total', 'saldo_pendente'
            )
        }),
        ('Datas', {
            'fields': ('data_emissao', 'data_vencimento', 'data_pagamento', 'dias_atraso')
        }),
        ('Pagamento', {
            'fields': ('conta_bancaria', 'forma_pagamento', 'numero_documento')
        }),
        ('Status', {
            'fields': ('status', 'observacoes', 'active')
        }),
    )


@admin.register(ContaReceber)
class ContaReceberAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'cliente', 'descricao', 'data_vencimento',
        'valor_total', 'valor_recebido', 'status', 'dias_atraso'
    ]
    list_filter = ['status', 'data_vencimento', 'categoria']
    search_fields = ['numero', 'descricao', 'cliente__nome_razao_social', 'numero_documento']
    readonly_fields = ['numero', 'valor_total', 'saldo_pendente', 'dias_atraso', 'created_at', 'updated_at']
    date_hierarchy = 'data_vencimento'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'cliente', 'categoria', 'descricao')
        }),
        ('Valores', {
            'fields': (
                'valor_original', 'valor_recebido', 'juros', 'multa',
                'desconto', 'valor_total', 'saldo_pendente'
            )
        }),
        ('Datas', {
            'fields': ('data_emissao', 'data_vencimento', 'data_recebimento', 'dias_atraso')
        }),
        ('Recebimento', {
            'fields': ('conta_bancaria', 'forma_recebimento', 'numero_documento')
        }),
        ('Status', {
            'fields': ('status', 'observacoes', 'active')
        }),
    )


@admin.register(FluxoCaixa)
class FluxoCaixaAdmin(admin.ModelAdmin):
    list_display = ['data', 'tipo', 'categoria', 'descricao', 'valor', 'conta_bancaria']
    list_filter = ['tipo', 'categoria', 'data']
    search_fields = ['descricao']
    date_hierarchy = 'data'
