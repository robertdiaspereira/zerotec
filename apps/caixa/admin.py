"""
Admin configuration for Caixa app
"""

from django.contrib import admin
from .models import Caixa


@admin.register(Caixa)
class CaixaAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'usuario_abertura',
        'data_abertura',
        'data_fechamento',
        'valor_inicial',
        'valor_final',
        'quebra_caixa',
        'status',
    ]
    list_filter = ['status', 'data_abertura', 'usuario_abertura']
    search_fields = ['usuario_abertura__username', 'observacoes_abertura', 'observacoes_fechamento']
    readonly_fields = ['created_at', 'updated_at', 'quebra_caixa', 'total_vendas', 'quantidade_vendas']
    
    fieldsets = (
        ('Informações de Abertura', {
            'fields': ('usuario_abertura', 'data_abertura', 'valor_inicial', 'observacoes_abertura')
        }),
        ('Informações de Fechamento', {
            'fields': ('usuario_fechamento', 'data_fechamento', 'valor_final', 'valor_esperado', 'observacoes_fechamento')
        }),
        ('Status e Cálculos', {
            'fields': ('status', 'quebra_caixa', 'total_vendas', 'quantidade_vendas')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def quebra_caixa(self, obj):
        """Exibe a quebra de caixa formatada"""
        quebra = obj.quebra_caixa
        if quebra is not None:
            if quebra > 0:
                return f'+R$ {quebra:.2f} (Sobra)'
            elif quebra < 0:
                return f'-R$ {abs(quebra):.2f} (Falta)'
            else:
                return 'R$ 0,00 (Sem quebra)'
        return '-'
    quebra_caixa.short_description = 'Quebra de Caixa'
