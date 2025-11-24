"""
Tests for Estoque app
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import Tenant, Domain
from apps.erp.models import Produto, Categoria
from .models import MovimentacaoEstoque, Lote, Inventario, ItemInventario

User = get_user_model()


class MovimentacaoEstoqueTest(TestCase):
    def setUp(self):
        # Create tenant and user
        self.tenant = Tenant.objects.create(
            schema_name='test',
            name='Test Company'
        )
        self.user = User.objects.create_user(
            username='test',
            password='test123',
            tenant=self.tenant
        )
        
        # Create product
        self.categoria = Categoria.objects.create(nome='Test', tipo='produto')
        self.produto = Produto.objects.create(
            nome='Produto Teste',
            codigo_interno='TEST001',
            preco_custo=100.00,
            preco_venda=150.00,
            estoque_atual=10
        )
    
    def test_entrada_estoque(self):
        """Test stock entry"""
        estoque_inicial = self.produto.estoque_atual
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='entrada',
            quantidade=5,
            valor_unitario=100.00,
            usuario=self.user
        )
        
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.estoque_atual, estoque_inicial + 5)
        self.assertEqual(movimentacao.valor_total, 500.00)
    
    def test_saida_estoque(self):
        """Test stock exit"""
        estoque_inicial = self.produto.estoque_atual
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='saida',
            quantidade=3,
            valor_unitario=100.00,
            usuario=self.user
        )
        
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.estoque_atual, estoque_inicial - 3)
    
    def test_ajuste_estoque(self):
        """Test stock adjustment"""
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=self.produto,
            tipo='ajuste',
            quantidade=20,
            valor_unitario=100.00,
            usuario=self.user
        )
        
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.estoque_atual, 20)


class LoteTest(TestCase):
    def setUp(self):
        self.produto = Produto.objects.create(
            nome='Produto com Lote',
            codigo_interno='LOTE001',
            preco_custo=50.00,
            preco_venda=80.00,
            controla_lote=True,
            controla_validade=True
        )
        
        self.lote = Lote.objects.create(
            produto=self.produto,
            numero_lote='L001',
            data_validade=timezone.now().date() + timezone.timedelta(days=30),
            quantidade=100
        )
    
    def test_lote_creation(self):
        """Test batch creation"""
        self.assertEqual(self.lote.numero_lote, 'L001')
        self.assertEqual(self.lote.quantidade, 100)
    
    def test_lote_vencido(self):
        """Test expired batch"""
        self.assertFalse(self.lote.vencido)
        
        # Create expired batch
        lote_vencido = Lote.objects.create(
            produto=self.produto,
            numero_lote='L002',
            data_validade=timezone.now().date() - timezone.timedelta(days=1),
            quantidade=50
        )
        
        self.assertTrue(lote_vencido.vencido)
    
    def test_dias_para_vencer(self):
        """Test days until expiration"""
        dias = self.lote.dias_para_vencer
        self.assertIsNotNone(dias)
        self.assertGreater(dias, 0)


class InventarioTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='test',
            password='test123'
        )
        
        self.produto1 = Produto.objects.create(
            nome='Produto 1',
            codigo_interno='P001',
            preco_custo=100.00,
            estoque_atual=10
        )
        
        self.produto2 = Produto.objects.create(
            nome='Produto 2',
            codigo_interno='P002',
            preco_custo=50.00,
            estoque_atual=20
        )
        
        self.inventario = Inventario.objects.create(
            responsavel=self.user,
            status='em_andamento'
        )
    
    def test_inventario_creation(self):
        """Test inventory creation"""
        self.assertEqual(self.inventario.status, 'em_andamento')
        self.assertEqual(self.inventario.total_itens, 0)
    
    def test_adicionar_item_inventario(self):
        """Test adding item to inventory"""
        item = ItemInventario.objects.create(
            inventario=self.inventario,
            produto=self.produto1,
            quantidade_sistema=10,
            quantidade_contada=12
        )
        
        self.assertEqual(item.diferenca, 2)
        self.assertEqual(item.valor_diferenca, 200.00)  # 2 * 100.00
    
    def test_inventario_estatisticas(self):
        """Test inventory statistics"""
        ItemInventario.objects.create(
            inventario=self.inventario,
            produto=self.produto1,
            quantidade_sistema=10,
            quantidade_contada=12
        )
        
        ItemInventario.objects.create(
            inventario=self.inventario,
            produto=self.produto2,
            quantidade_sistema=20,
            quantidade_contada=18
        )
        
        self.assertEqual(self.inventario.total_itens, 2)
        self.assertEqual(self.inventario.total_diferencas, 2)
