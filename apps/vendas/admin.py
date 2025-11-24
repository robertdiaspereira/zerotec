"""
Admin configuration for Vendas app
"""

from django.contrib import admin
from .models import Venda, ItemVenda, FormaPagamento, PDV, MovimentoPDV


class ItemVendaInline(admin.TabularInline):
    model = ItemVenda
    extra = 1
    readonly_fields = ['preco_total']


class FormaPagamentoInline(admin.TabularInline):
    model = FormaPagamento
    extra = 1


@admin.register(Venda)
class VendaAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'cliente', 'data_venda', 'status',
        'valor_total', 'vendedor', 'total_itens'
    ]
    list_filter = ['tipo', 'status', 'data_venda', 'vendedor']
    search_fields = ['numero', 'cliente__nome_razao_social', 'observacoes']
    readonly_fields = [
        'numero', 'data_venda', 'valor_produtos', 'valor_total',
        'total_itens', 'total_pago', 'saldo_pendente', 'created_at', 'updated_at'
    ]
    inlines = [ItemVendaInline, FormaPagamentoInline]
    date_hierarchy = 'data_venda'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'tipo', 'cliente', 'data_venda', 'data_entrega', 'status')
        }),
        ('Valores', {
            'fields': (
                'valor_produtos', 'valor_desconto', 'valor_acrescimo', 'valor_total'
            )
        }),
        ('Pagamento', {
            'fields': ('total_pago', 'saldo_pendente')
        }),
        ('Responsável', {
            'fields': ('vendedor',)
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


class MovimentoPDVInline(admin.TabularInline):
    model = MovimentoPDV
    extra = 0
    readonly_fields = ['data']


@admin.register(PDV)
class PDVAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'numero_caixa', 'operador', 'data_abertura',
        'data_fechamento', 'status', 'valor_final', 'saldo_calculado'
    ]
    list_filter = ['status', 'numero_caixa', 'operador', 'data_abertura']
    readonly_fields = [
        'data_abertura', 'data_fechamento', 'valor_vendas',
        'valor_sangrias', 'valor_suprimentos', 'total_movimentos',
        'saldo_calculado', 'created_at', 'updated_at'
    ]
    inlines = [MovimentoPDVInline]
    date_hierarchy = 'data_abertura'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero_caixa', 'operador', 'status')
        }),
        ('Datas', {
            'fields': ('data_abertura', 'data_fechamento')
        }),
        ('Valores', {
            'fields': (
                'valor_inicial', 'valor_vendas', 'valor_sangrias',
                'valor_suprimentos', 'valor_final', 'saldo_calculado'
            )
        }),
        ('Estatísticas', {
            'fields': ('total_movimentos',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )
