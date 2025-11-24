"""
Tests for Compras app
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.erp.models import Produto, Fornecedor
from .models import (
    Cotacao, ItemCotacao, PedidoCompra, ItemPedidoCompra,
    RecebimentoMercadoria, ItemRecebimento
)

User = get_user_model()


class CotacaoTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
        self.produto = Produto.objects.create(
            nome='Produto Teste',
            codigo_interno='TEST001',
            preco_custo=100.00
        )
        self.fornecedor1 = Fornecedor.objects.create(
            razao_social='Fornecedor 1',
            cnpj='12345678000190'
        )
        self.fornecedor2 = Fornecedor.objects.create(
            razao_social='Fornecedor 2',
            cnpj='98765432000190'
        )
    
    def test_cotacao_creation(self):
        """Test quotation creation"""
        cotacao = Cotacao.objects.create(
            data_validade=timezone.now().date() + timedelta(days=7),
            solicitante=self.user
        )
        
        self.assertIsNotNone(cotacao.numero)
        self.assertTrue(cotacao.numero.startswith('COT'))
        self.assertEqual(cotacao.status, 'em_andamento')
    
    def test_adicionar_item_cotacao(self):
        """Test adding item to quotation"""
        cotacao = Cotacao.objects.create(
            data_validade=timezone.now().date() + timedelta(days=7),
            solicitante=self.user
        )
        
        item = ItemCotacao.objects.create(
            cotacao=cotacao,
            produto=self.produto,
            quantidade=10,
            fornecedor=self.fornecedor1,
            preco_unitario=95.00
        )
        
        self.assertEqual(item.preco_total, 950.00)


class PedidoCompraTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
        self.fornecedor = Fornecedor.objects.create(
            razao_social='Fornecedor Teste',
            cnpj='12345678000190'
        )
        self.produto = Produto.objects.create(
            nome='Produto Teste',
            codigo_interno='TEST001',
            preco_custo=100.00,
            estoque_atual=0
        )
    
    def test_pedido_creation(self):
        """Test purchase order creation"""
        pedido = PedidoCompra.objects.create(
            fornecedor=self.fornecedor,
            data_entrega_prevista=timezone.now().date() + timedelta(days=15),
            comprador=self.user
        )
        
        self.assertIsNotNone(pedido.numero)
        self.assertTrue(pedido.numero.startswith('PC'))
        self.assertEqual(pedido.status, 'pendente')
    
    def test_adicionar_item_pedido(self):
        """Test adding item to purchase order"""
        pedido = PedidoCompra.objects.create(
            fornecedor=self.fornecedor,
            data_entrega_prevista=timezone.now().date() + timedelta(days=15),
            comprador=self.user
        )
        
        item = ItemPedidoCompra.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade_pedida=20,
            preco_unitario=95.00
        )
        
        self.assertEqual(item.preco_total, 1900.00)
        self.assertEqual(item.pendente_receber, 20)
    
    def test_recebimento_mercadoria(self):
        """Test merchandise receiving"""
        pedido = PedidoCompra.objects.create(
            fornecedor=self.fornecedor,
            data_entrega_prevista=timezone.now().date() + timedelta(days=15),
            status='aprovado',
            comprador=self.user
        )
        
        item_pedido = ItemPedidoCompra.objects.create(
            pedido=pedido,
            produto=self.produto,
            quantidade_pedida=20,
            preco_unitario=95.00
        )
        
        recebimento = RecebimentoMercadoria.objects.create(
            pedido_compra=pedido,
            nota_fiscal='NF123456',
            recebedor=self.user
        )
        
        item_recebimento = ItemRecebimento.objects.create(
            recebimento=recebimento,
            item_pedido=item_pedido,
            quantidade=20
        )
        
        # Refresh from database
        item_pedido.refresh_from_db()
        self.produto.refresh_from_db()
        
        # Check if quantity was updated
        self.assertEqual(item_pedido.quantidade_recebida, 20)
        self.assertEqual(self.produto.estoque_atual, 20)
