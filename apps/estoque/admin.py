"""
Admin configuration for Estoque app
"""

from django.contrib import admin
from .models import MovimentacaoEstoque, Lote, Inventario, ItemInventario


@admin.register(MovimentacaoEstoque)
class MovimentacaoEstoqueAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'produto', 'tipo', 'quantidade', 'quantidade_anterior',
        'quantidade_nova', 'valor_total', 'usuario', 'data_movimentacao'
    ]
    list_filter = ['tipo', 'documento', 'data_movimentacao', 'usuario']
    search_fields = ['produto__nome', 'produto__codigo_interno', 'documento_numero', 'motivo']
    readonly_fields = [
        'quantidade_anterior', 'quantidade_nova', 'valor_total',
        'data_movimentacao', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'data_movimentacao'
    
    fieldsets = (
        ('Produto', {
            'fields': ('produto', 'tipo', 'quantidade')
        }),
        ('Valores', {
            'fields': ('valor_unitario', 'valor_total')
        }),
        ('Histórico de Estoque', {
            'fields': ('quantidade_anterior', 'quantidade_nova')
        }),
        ('Documento', {
            'fields': ('documento', 'documento_numero', 'motivo')
        }),
        ('Lote e Validade', {
            'fields': ('lote', 'data_validade'),
            'classes': ('collapse',)
        }),
        ('Localização', {
            'fields': ('local_origem', 'local_destino'),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('usuario', 'data_movimentacao', 'observacoes')
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )


@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):
    list_display = [
        'numero_lote', 'produto', 'quantidade', 'data_fabricacao',
        'data_validade', 'vencido_display', 'fornecedor', 'active'
    ]
    list_filter = ['data_validade', 'fornecedor', 'active', 'created_at']
    search_fields = ['numero_lote', 'produto__nome', 'nota_fiscal']
    readonly_fields = ['vencido', 'dias_para_vencer', 'created_at', 'updated_at']
    date_hierarchy = 'data_validade'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('produto', 'numero_lote', 'quantidade')
        }),
        ('Datas', {
            'fields': ('data_fabricacao', 'data_validade', 'vencido', 'dias_para_vencer')
        }),
        ('Fornecedor', {
            'fields': ('fornecedor', 'nota_fiscal')
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def vencido_display(self, obj):
        return '⚠️ Vencido' if obj.vencido else 'OK'
    vencido_display.short_description = 'Status'


class ItemInventarioInline(admin.TabularInline):
    model = ItemInventario
    extra = 0
    readonly_fields = ['diferenca', 'valor_diferenca']
    fields = [
        'produto', 'quantidade_sistema', 'quantidade_contada',
        'diferenca', 'valor_diferenca', 'ajustado'
    ]


@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'data_inicio', 'status', 'responsavel',
        'total_itens', 'total_diferencas', 'valor_total_diferenca'
    ]
    list_filter = ['status', 'responsavel', 'data_inicio']
    readonly_fields = [
        'data_inicio', 'data_conclusao', 'total_itens',
        'total_diferencas', 'valor_total_diferenca', 'created_at', 'updated_at'
    ]
    inlines = [ItemInventarioInline]
    date_hierarchy = 'data_inicio'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('status', 'responsavel')
        }),
        ('Datas', {
            'fields': ('data_inicio', 'data_conclusao')
        }),
        ('Estatísticas', {
            'fields': ('total_itens', 'total_diferencas', 'valor_total_diferenca')
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )


@admin.register(ItemInventario)
class ItemInventarioAdmin(admin.ModelAdmin):
    list_display = [
        'inventario', 'produto', 'quantidade_sistema',
        'quantidade_contada', 'diferenca', 'valor_diferenca', 'ajustado'
    ]
    list_filter = ['ajustado', 'inventario__status']
    search_fields = ['produto__nome', 'produto__codigo_interno']
    readonly_fields = ['diferenca', 'valor_diferenca']
