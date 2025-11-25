"""
Models para Categorias DRE (Demonstrativo de Resultado do Exercício)
"""

from django.db import models
from apps.core.models import BaseModel


class CategoriaDRE(BaseModel):
    """
    Categorias para classificação no DRE
    Baseado no sistema PHP existente
    """
    
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('deducao', 'Dedução'),
        ('custo', 'Custo'),
        ('despesa', 'Despesa'),
    ]
    
    nome = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    codigo = models.CharField(max_length=10, unique=True, help_text="Código da categoria (ex: 1, 3, 5...)")
    descricao = models.TextField(blank=True, null=True)
    ordem = models.IntegerField(default=0, help_text="Ordem de exibição no DRE")
    ativo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'categoria_dre'
        verbose_name = 'Categoria DRE'
        verbose_name_plural = 'Categorias DRE'
        ordering = ['ordem', 'codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nome}"
    
    @classmethod
    def criar_categorias_padrao(cls):
        """
        Cria as categorias padrão do DRE baseadas no sistema PHP
        """
        categorias = [
            # RECEITAS
            {'codigo': '1', 'nome': '(+) Vendas de Produtos', 'tipo': 'receita', 'ordem': 1,
             'descricao': 'Venda de produtos'},
            {'codigo': '3', 'nome': '(+) Prestação de Serviços', 'tipo': 'receita', 'ordem': 3,
             'descricao': 'Serviços prestados'},
            
            # DEDUÇÕES
            {'codigo': '5', 'nome': '(-) Devoluções de Vendas', 'tipo': 'deducao', 'ordem': 5,
             'descricao': 'Vendas devolvidas'},
            {'codigo': '6', 'nome': '(-) Abatimentos', 'tipo': 'deducao', 'ordem': 6,
             'descricao': 'Abatimentos concedidos'},
            {'codigo': '7', 'nome': '(-) Impostos e Contribuições sobre Vendas', 'tipo': 'deducao', 'ordem': 7,
             'descricao': 'Impostos e contribuições incidentes sobre vendas'},
            
            # CUSTOS
            {'codigo': '8', 'nome': '(-) Custo dos Produtos Vendidos', 'tipo': 'custo', 'ordem': 8,
             'descricao': 'CPV - Custo dos produtos vendidos'},
            {'codigo': '10', 'nome': '(-) Custo dos Serviços Prestados', 'tipo': 'custo', 'ordem': 10,
             'descricao': 'Custo dos serviços prestados'},
            
            # DESPESAS OPERACIONAIS
            {'codigo': '11', 'nome': '(-) Despesas com Vendas', 'tipo': 'despesa', 'ordem': 11,
             'descricao': 'Comissões, marketing, propaganda'},
            {'codigo': '12', 'nome': '(-) Despesas Administrativas', 'tipo': 'despesa', 'ordem': 12,
             'descricao': 'Aluguel, água, luz, telefone, material de escritório'},
            {'codigo': '13', 'nome': '(-) Pagamento de Salários', 'tipo': 'despesa', 'ordem': 13,
             'descricao': 'Folha de pagamento'},
            
            # DESPESAS FINANCEIRAS
            {'codigo': '14', 'nome': '(-) Despesas Financeiras', 'tipo': 'despesa', 'ordem': 14,
             'descricao': 'Juros pagos, taxas bancárias'},
            {'codigo': '15', 'nome': '(+) Variações Monetárias e Cambiais Passivas', 'tipo': 'receita', 'ordem': 15,
             'descricao': 'Ganhos com variações cambiais'},
            
            # OUTRAS RECEITAS E DESPESAS
            {'codigo': '16', 'nome': '(+) Resultado da Equivalência Patrimonial', 'tipo': 'receita', 'ordem': 16,
             'descricao': 'Resultado de investimentos'},
            {'codigo': '17', 'nome': '(+) Venda de Bens e Direitos do Ativo Não Circulante', 'tipo': 'receita', 'ordem': 17,
             'descricao': 'Venda de ativos'},
            {'codigo': '18', 'nome': '(-) Custo da Venda de Bens e Direitos', 'tipo': 'custo', 'ordem': 18,
             'descricao': 'Custo dos ativos vendidos'},
            
            # PROVISÕES E PARTICIPAÇÕES
            {'codigo': '19', 'nome': '(-) Provisão para Imposto de Renda e CSLL', 'tipo': 'despesa', 'ordem': 19,
             'descricao': 'Provisão para imposto de renda e contribuição social'},
            {'codigo': '20', 'nome': '(-) Participações de Administradores', 'tipo': 'despesa', 'ordem': 20,
             'descricao': 'Participações nos lucros'},
            
            # OUTRAS
            {'codigo': '21', 'nome': '(+) Outras Receitas', 'tipo': 'receita', 'ordem': 21,
             'descricao': 'Receitas diversas'},
            {'codigo': '22', 'nome': '(-) Outras Despesas', 'tipo': 'despesa', 'ordem': 22,
             'descricao': 'Despesas diversas'},
        ]
        
        for cat_data in categorias:
            cls.objects.get_or_create(
                codigo=cat_data['codigo'],
                defaults=cat_data
            )
        
        return len(categorias)
