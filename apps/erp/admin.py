"""
Admin configuration for ERP app
"""

from django.contrib import admin
from .models import Categoria, Cliente, Fornecedor, Produto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'tipo', 'active', 'created_at']
    list_filter = ['tipo', 'active', 'created_at']
    search_fields = ['nome', 'descricao']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = [
        'nome_razao_social', 'tipo', 'cpf_cnpj', 'telefone_principal',
        'email', 'cidade', 'active', 'created_at'
    ]
    list_filter = ['tipo', 'active', 'estado', 'created_at']
    search_fields = ['nome_razao_social', 'nome_fantasia', 'cpf_cnpj', 'email']
    readonly_fields = ['created_at', 'updated_at', 'total_vendas', 'total_os']
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('tipo', 'nome_razao_social', 'nome_fantasia', 'cpf_cnpj', 'rg_ie')
        }),
        ('Contato', {
            'fields': ('telefone_principal', 'telefone_secundario', 'email')
        }),
        ('Dados Pessoais', {
            'fields': ('data_nascimento',),
            'classes': ('collapse',)
        }),
        ('Endereço', {
            'fields': ('cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'),
            'classes': ('collapse',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Estatísticas', {
            'fields': ('total_vendas', 'total_os'),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = [
        'razao_social', 'nome_fantasia', 'cnpj', 'telefone_principal',
        'email', 'cidade', 'active', 'created_at'
    ]
    list_filter = ['active', 'estado', 'created_at']
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj', 'email']
    readonly_fields = ['created_at', 'updated_at', 'total_compras']
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('razao_social', 'nome_fantasia', 'cnpj', 'ie')
        }),
        ('Contato', {
            'fields': ('telefone_principal', 'telefone_secundario', 'email', 'contato_nome', 'contato_cargo')
        }),
        ('Endereço', {
            'fields': ('cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'),
            'classes': ('collapse',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Estatísticas', {
            'fields': ('total_compras',),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = [
        'codigo_interno', 'nome', 'tipo', 'categoria', 'preco_venda',
        'estoque_atual', 'estoque_minimo', 'estoque_baixo', 'active', 'created_at'
    ]
    list_filter = ['tipo', 'categoria', 'active', 'controla_lote', 'controla_validade', 'created_at']
    search_fields = ['nome', 'descricao', 'codigo_interno', 'codigo_barras']
    readonly_fields = ['created_at', 'updated_at', 'margem_lucro', 'estoque_baixo', 'valor_estoque']
    
    fieldsets = (
        ('Dados Básicos', {
            'fields': ('tipo', 'nome', 'descricao', 'categoria')
        }),
        ('Códigos', {
            'fields': ('codigo_interno', 'codigo_barras', 'ncm')
        }),
        ('Unidade e Medida', {
            'fields': ('unidade_medida',)
        }),
        ('Preços', {
            'fields': ('preco_custo', 'preco_venda', 'margem_lucro')
        }),
        ('Estoque', {
            'fields': (
                'estoque_atual', 'estoque_minimo', 'estoque_maximo',
                'localizacao', 'estoque_baixo', 'valor_estoque'
            )
        }),
        ('Controles', {
            'fields': ('controla_lote', 'controla_validade')
        }),
        ('Imagem', {
            'fields': ('imagem',)
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Auditoria', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def estoque_baixo(self, obj):
        return '⚠️ Sim' if obj.estoque_baixo else 'Não'
    estoque_baixo.short_description = 'Estoque Baixo'
