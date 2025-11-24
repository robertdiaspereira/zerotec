"""
Admin configuration for Compras app
"""

from django.contrib import admin
from .models import (
    Cotacao, ItemCotacao, PedidoCompra, ItemPedidoCompra,
    RecebimentoMercadoria, ItemRecebimento
)


class ItemCotacaoInline(admin.TabularInline):
    model = ItemCotacao
    extra = 1
    readonly_fields = ['preco_total']


@admin.register(Cotacao)
class CotacaoAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'data_solicitacao', 'data_validade',
        'status', 'solicitante', 'total_itens'
    ]
    list_filter = ['status', 'data_solicitacao', 'solicitante']
    search_fields = ['numero', 'observacoes']
    readonly_fields = ['numero', 'data_solicitacao', 'total_itens', 'created_at', 'updated_at']
    inlines = [ItemCotacaoInline]
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'data_solicitacao', 'data_validade', 'status')
        }),
        ('Responsável', {
            'fields': ('solicitante',)
        }),
        ('Estatísticas', {
            'fields': ('total_itens',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )


class ItemPedidoCompraInline(admin.TabularInline):
    model = ItemPedidoCompra
    extra = 1
    readonly_fields = ['preco_total', 'quantidade_recebida', 'pendente_receber']


@admin.register(PedidoCompra)
class PedidoCompraAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'fornecedor', 'data_pedido', 'data_entrega_prevista',
        'status', 'valor_total', 'percentual_recebido'
    ]
    list_filter = ['status', 'forma_pagamento', 'data_pedido', 'comprador']
    search_fields = ['numero', 'fornecedor__razao_social', 'observacoes']
    readonly_fields = [
        'numero', 'data_pedido', 'valor_total', 'total_itens',
        'percentual_recebido', 'created_at', 'updated_at'
    ]
    inlines = [ItemPedidoCompraInline]
    date_hierarchy = 'data_pedido'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'fornecedor', 'data_pedido', 'status')
        }),
        ('Entrega', {
            'fields': ('data_entrega_prevista', 'data_entrega_real')
        }),
        ('Valores', {
            'fields': (
                'valor_produtos', 'valor_frete', 'valor_desconto', 'valor_total'
            )
        }),
        ('Pagamento', {
            'fields': ('forma_pagamento', 'condicao_pagamento')
        }),
        ('Responsável', {
            'fields': ('comprador',)
        }),
        ('Estatísticas', {
            'fields': ('total_itens', 'percentual_recebido')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )


class ItemRecebimentoInline(admin.TabularInline):
    model = ItemRecebimento
    extra = 1


@admin.register(RecebimentoMercadoria)
class RecebimentoMercadoriaAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'pedido_compra', 'nota_fiscal',
        'data_recebimento', 'recebedor', 'total_itens'
    ]
    list_filter = ['data_recebimento', 'recebedor']
    search_fields = ['nota_fiscal', 'pedido_compra__numero']
    readonly_fields = ['data_recebimento', 'total_itens', 'created_at', 'updated_at']
    inlines = [ItemRecebimentoInline]
    date_hierarchy = 'data_recebimento'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('pedido_compra', 'nota_fiscal', 'data_recebimento')
        }),
        ('Responsável', {
            'fields': ('recebedor',)
        }),
        ('Estatísticas', {
            'fields': ('total_itens',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )
