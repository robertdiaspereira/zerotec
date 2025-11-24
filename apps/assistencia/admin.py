"""
Admin configuration for Assistencia app
"""

from django.contrib import admin
from .models import OrdemServico, PecaOS, OrcamentoOS, HistoricoOS


class PecaOSInline(admin.TabularInline):
    model = PecaOS
    extra = 1
    readonly_fields = ['preco_total']


class OrcamentoOSInline(admin.StackedInline):
    model = OrcamentoOS
    extra = 0
    readonly_fields = ['valor_total', 'data_aprovacao', 'created_at']


class HistoricoOSInline(admin.TabularInline):
    model = HistoricoOS
    extra = 0
    readonly_fields = ['data', 'usuario', 'acao', 'descricao']
    can_delete = False


@admin.register(OrdemServico)
class OrdemServicoAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'cliente', 'equipamento', 'data_abertura',
        'data_previsao', 'status', 'prioridade', 'valor_total',
        'tecnico', 'dias_aberta'
    ]
    list_filter = ['status', 'prioridade', 'data_abertura', 'tecnico']
    search_fields = [
        'numero', 'cliente__nome_razao_social', 'equipamento',
        'marca', 'modelo', 'numero_serie', 'defeito_relatado'
    ]
    readonly_fields = [
        'numero', 'data_abertura', 'data_conclusao', 'data_entrega',
        'valor_pecas', 'valor_total', 'data_fim_garantia', 'total_pecas',
        'em_garantia', 'dias_aberta', 'created_at', 'updated_at'
    ]
    inlines = [PecaOSInline, OrcamentoOSInline, HistoricoOSInline]
    date_hierarchy = 'data_abertura'
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'cliente', 'status', 'prioridade')
        }),
        ('Equipamento', {
            'fields': ('equipamento', 'marca', 'modelo', 'numero_serie', 'acessorios')
        }),
        ('Defeito', {
            'fields': ('defeito_relatado', 'observacoes_cliente')
        }),
        ('Diagnóstico', {
            'fields': ('diagnostico', 'solucao')
        }),
        ('Datas', {
            'fields': (
                'data_abertura', 'data_previsao', 'data_conclusao',
                'data_entrega', 'dias_aberta'
            )
        }),
        ('Valores', {
            'fields': (
                'valor_servico', 'valor_pecas', 'valor_desconto', 'valor_total'
            )
        }),
        ('Garantia', {
            'fields': ('garantia_dias', 'data_fim_garantia', 'em_garantia')
        }),
        ('Responsável', {
            'fields': ('tecnico',)
        }),
        ('Estatísticas', {
            'fields': ('total_pecas',)
        }),
        ('Observações', {
            'fields': ('observacoes_internas',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )
    
    def dias_aberta(self, obj):
        return f'{obj.dias_aberta} dias'
    dias_aberta.short_description = 'Tempo Aberta'
