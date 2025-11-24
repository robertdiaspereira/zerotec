"""
Tests for Vendas app
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.erp.models import Produto, Cliente
from .models import Venda, ItemVenda, FormaPagamento, PDV, MovimentoPDV

User = get_user_model()


class VendaTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
        self.cliente = Cliente.objects.create(
            nome_razao_social='Cliente Teste',
            cpf_cnpj='12345678901',
            telefone_principal='11999999999'
        )
        self.produto = Produto.objects.create(
            nome='Produto Teste',
            codigo_interno='TEST001',
            preco_venda=100.00,
            estoque_atual=10
        )
    
    def test_venda_creation(self):
        """Test sale creation"""
        venda = Venda.objects.create(
            cliente=self.cliente,
            vendedor=self.user
        )
        
        self.assertIsNotNone(venda.numero)
        self.assertTrue(venda.numero.startswith('VD'))
        self.assertEqual(venda.status, 'orcamento')
    
    def test_adicionar_item_venda(self):
        """Test adding item to sale"""
        venda = Venda.objects.create(
            cliente=self.cliente,
            vendedor=self.user
        )
        
        item = ItemVenda.objects.create(
            venda=venda,
            produto=self.produto,
            quantidade=2,
            preco_unitario=100.00
        )
        
        self.assertEqual(item.preco_total, 200.00)
        
        # Refresh venda to get updated values
        venda.refresh_from_db()
        self.assertEqual(venda.valor_produtos, 200.00)
        self.assertEqual(venda.valor_total, 200.00)
    
    def test_forma_pagamento(self):
        """Test payment method"""
        venda = Venda.objects.create(
            cliente=self.cliente,
            vendedor=self.user,
            valor_produtos=200.00
        )
        
        pagamento = FormaPagamento.objects.create(
            venda=venda,
            tipo='dinheiro',
            valor=200.00,
            status='pago'
        )
        
        self.assertEqual(venda.total_pago, 200.00)
        self.assertEqual(venda.saldo_pendente, 0)


class PDVTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='test', password='test123')
    
    def test_pdv_abertura(self):
        """Test PDV opening"""
        pdv = PDV.objects.create(
            numero_caixa=1,
            operador=self.user,
            valor_inicial=100.00,
            status='aberto'
        )
        
        self.assertEqual(pdv.status, 'aberto')
        self.assertEqual(pdv.valor_inicial, 100.00)
        self.assertEqual(pdv.saldo_calculado, 100.00)
    
    def test_pdv_movimentos(self):
        """Test PDV movements"""
        pdv = PDV.objects.create(
            numero_caixa=1,
            operador=self.user,
            valor_inicial=100.00,
            status='aberto'
        )
        
        # Add sale
        MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='venda',
            valor=50.00,
            descricao='Venda teste'
        )
        
        # Add withdrawal
        MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='sangria',
            valor=30.00,
            descricao='Sangria teste'
        )
        
        # Refresh PDV
        pdv.refresh_from_db()
        
        self.assertEqual(pdv.valor_vendas, 50.00)
        self.assertEqual(pdv.valor_sangrias, 30.00)
        self.assertEqual(pdv.saldo_calculado, 120.00)  # 100 + 50 - 30
