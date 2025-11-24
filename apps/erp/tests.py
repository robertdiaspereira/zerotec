"""
Tests for ERP app
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.accounts.models import Tenant, Domain
from .models import Categoria, Cliente, Fornecedor, Produto

User = get_user_model()


class CategoriaModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome='Eletrônicos',
            tipo='produto',
            descricao='Produtos eletrônicos'
        )
    
    def test_categoria_creation(self):
        self.assertEqual(self.categoria.nome, 'Eletrônicos')
        self.assertEqual(self.categoria.tipo, 'produto')
        self.assertTrue(self.categoria.active)
    
    def test_categoria_str(self):
        self.assertEqual(str(self.categoria), 'Eletrônicos (Produto)')


class ClienteModelTest(TestCase):
    def setUp(self):
        self.cliente_pf = Cliente.objects.create(
            tipo='pf',
            nome_razao_social='João Silva',
            cpf_cnpj='12345678901',
            telefone_principal='(11) 99999-9999'
        )
        
        self.cliente_pj = Cliente.objects.create(
            tipo='pj',
            nome_razao_social='Empresa LTDA',
            nome_fantasia='Empresa',
            cpf_cnpj='12345678000190',
            telefone_principal='(11) 3333-3333'
        )
    
    def test_cliente_pf_creation(self):
        self.assertEqual(self.cliente_pf.tipo, 'pf')
        self.assertEqual(self.cliente_pf.nome_razao_social, 'João Silva')
    
    def test_cliente_pj_creation(self):
        self.assertEqual(self.cliente_pj.tipo, 'pj')
        self.assertEqual(self.cliente_pj.nome_fantasia, 'Empresa')
    
    def test_cliente_str(self):
        self.assertEqual(str(self.cliente_pf), 'João Silva')


class ProdutoModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome='Peças',
            tipo='produto'
        )
        
        self.produto = Produto.objects.create(
            tipo='produto',
            nome='Tela LCD',
            categoria=self.categoria,
            codigo_interno='LCD001',
            preco_custo=100.00,
            preco_venda=150.00,
            estoque_atual=10,
            estoque_minimo=5
        )
    
    def test_produto_creation(self):
        self.assertEqual(self.produto.nome, 'Tela LCD')
        self.assertEqual(self.produto.codigo_interno, 'LCD001')
    
    def test_margem_lucro_calculation(self):
        # Margem deve ser calculada automaticamente
        self.produto.save()
        self.assertEqual(self.produto.margem_lucro, 50.00)
    
    def test_estoque_baixo(self):
        self.assertFalse(self.produto.estoque_baixo)
        
        self.produto.estoque_atual = 3
        self.produto.save()
        self.assertTrue(self.produto.estoque_baixo)
    
    def test_valor_estoque(self):
        valor_esperado = self.produto.estoque_atual * self.produto.preco_custo
        self.assertEqual(self.produto.valor_estoque, valor_esperado)
