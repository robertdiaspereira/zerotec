"""
Admin configuration for CRM app
"""

from django.contrib import admin
from .models import Funil, EtapaFunil, Oportunidade, Atividade, Interacao


class EtapaFunilInline(admin.TabularInline):
    model = EtapaFunil
    extra = 1
    fields = ['nome', 'ordem', 'cor', 'probabilidade', 'is_inicial', 'is_ganho', 'is_perdido']


@admin.register(Funil)
class FunilAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ordem', 'active']
    list_filter = ['active']
    search_fields = ['nome', 'descricao']
    inlines = [EtapaFunilInline]


@admin.register(EtapaFunil)
class EtapaFunilAdmin(admin.ModelAdmin):
    list_display = ['nome', 'funil', 'ordem', 'probabilidade', 'is_inicial', 'is_ganho', 'is_perdido', 'active']
    list_filter = ['funil', 'is_inicial', 'is_ganho', 'is_perdido', 'active']
    search_fields = ['nome', 'descricao']


class AtividadeInline(admin.TabularInline):
    model = Atividade
    extra = 0
    fields = ['tipo', 'titulo', 'data_prevista', 'responsavel', 'status']
    readonly_fields = []


class InteracaoInline(admin.TabularInline):
    model = Interacao
    extra = 0
    fields = ['tipo', 'assunto', 'data_interacao', 'usuario']
    readonly_fields = ['data_interacao']


@admin.register(Oportunidade)
class OportunidadeAdmin(admin.ModelAdmin):
    list_display = [
        'numero', 'titulo', 'cliente', 'etapa', 'valor_estimado',
        'probabilidade', 'responsavel', 'data_abertura', 'active'
    ]
    list_filter = ['funil', 'etapa', 'origem', 'responsavel', 'active']
    search_fields = ['numero', 'titulo', 'descricao', 'cliente__nome_razao_social', 'nome_lead']
    readonly_fields = ['numero', 'created_at', 'updated_at']
    date_hierarchy = 'data_abertura'
    inlines = [AtividadeInline, InteracaoInline]
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('numero', 'titulo', 'descricao')
        }),
        ('Cliente/Lead', {
            'fields': ('cliente', 'nome_lead', 'email_lead', 'telefone_lead')
        }),
        ('Funil', {
            'fields': ('funil', 'etapa', 'probabilidade')
        }),
        ('Valores', {
            'fields': ('valor_estimado', 'produto')
        }),
        ('Datas', {
            'fields': ('data_fechamento_prevista', 'data_fechamento')
        }),
        ('Responsável e Origem', {
            'fields': ('responsavel', 'origem')
        }),
        ('Perda', {
            'fields': ('motivo_perda',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
    )


@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = [
        'titulo', 'oportunidade', 'tipo', 'data_prevista',
        'responsavel', 'status', 'active'
    ]
    list_filter = ['tipo', 'status', 'responsavel', 'active']
    search_fields = ['titulo', 'descricao', 'oportunidade__titulo']
    date_hierarchy = 'data_prevista'


@admin.register(Interacao)
class InteracaoAdmin(admin.ModelAdmin):
    list_display = [
        'assunto', 'oportunidade', 'cliente', 'tipo',
        'data_interacao', 'usuario'
    ]
    list_filter = ['tipo', 'data_interacao']
    search_fields = ['assunto', 'descricao', 'oportunidade__titulo', 'cliente__nome_razao_social']
    readonly_fields = ['data_interacao']
    date_hierarchy = 'data_interacao'
