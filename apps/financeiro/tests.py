"""
Tests for Financeiro app
"""

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.erp.models import Cliente, Fornecedor
from .models import CategoriaFinanceira, ContaBancaria, ContaPagar, ContaReceber, FluxoCaixa


class FinanceiroTest(TestCase):
    def setUp(self):
        self.categoria_receita = CategoriaFinanceira.objects.create(
            nome='Vendas',
            tipo='receita'
        )
        self.categoria_despesa = CategoriaFinanceira.objects.create(
            nome='Fornecedores',
            tipo='despesa'
        )
        self.conta_bancaria = ContaBancaria.objects.create(
            banco='Banco Teste',
            agencia='1234',
            conta='56789',
            saldo_inicial=1000.00,
            saldo_atual=1000.00
        )
        self.cliente = Cliente.objects.create(
            nome_razao_social='Cliente Teste',
            cpf_cnpj='12345678901',
            telefone_principal='11999999999'
        )
        self.fornecedor = Fornecedor.objects.create(
            razao_social='Fornecedor Teste',
            cnpj='12345678000190'
        )
    
    def test_conta_pagar_creation(self):
        """Test account payable creation"""
        conta = ContaPagar.objects.create(
            fornecedor=self.fornecedor,
            categoria=self.categoria_despesa,
            descricao='Compra de materiais',
            valor_original=500.00,
            data_emissao=timezone.now().date(),
            data_vencimento=timezone.now().date() + timedelta(days=30)
        )
        
        self.assertIsNotNone(conta.numero)
        self.assertTrue(conta.numero.startswith('CP'))
        self.assertEqual(conta.valor_total, 500.00)
        self.assertEqual(conta.status, 'pendente')
    
    def test_conta_receber_creation(self):
        """Test account receivable creation"""
        conta = ContaReceber.objects.create(
            cliente=self.cliente,
            categoria=self.categoria_receita,
            descricao='Venda de produtos',
            valor_original=1000.00,
            data_emissao=timezone.now().date(),
            data_vencimento=timezone.now().date() + timedelta(days=15)
        )
        
        self.assertIsNotNone(conta.numero)
        self.assertTrue(conta.numero.startswith('CR'))
        self.assertEqual(conta.valor_total, 1000.00)
        self.assertEqual(conta.status, 'pendente')
    
    def test_pagamento_conta(self):
        """Test account payment"""
        conta = ContaPagar.objects.create(
            fornecedor=self.fornecedor,
            categoria=self.categoria_despesa,
            descricao='Compra',
            valor_original=500.00,
            data_emissao=timezone.now().date(),
            data_vencimento=timezone.now().date() + timedelta(days=30)
        )
        
        conta.valor_pago = 500.00
        conta.data_pagamento = timezone.now().date()
        conta.status = 'pago'
        conta.conta_bancaria = self.conta_bancaria
        conta.save()
        
        # Refresh conta bancaria
        self.conta_bancaria.refresh_from_db()
        
        # Should have created cash flow entry
        self.assertEqual(FluxoCaixa.objects.filter(conta_pagar=conta).count(), 1)
        
        # Should have updated bank balance
        self.assertEqual(self.conta_bancaria.saldo_atual, 500.00)  # 1000 - 500
    
    def test_recebimento_conta(self):
        """Test account receipt"""
        conta = ContaReceber.objects.create(
            cliente=self.cliente,
            categoria=self.categoria_receita,
            descricao='Venda',
            valor_original=300.00,
            data_emissao=timezone.now().date(),
            data_vencimento=timezone.now().date() + timedelta(days=15)
        )
        
        conta.valor_recebido = 300.00
        conta.data_recebimento = timezone.now().date()
        conta.status = 'recebido'
        conta.conta_bancaria = self.conta_bancaria
        conta.save()
        
        # Refresh conta bancaria
        self.conta_bancaria.refresh_from_db()
        
        # Should have created cash flow entry
        self.assertEqual(FluxoCaixa.objects.filter(conta_receber=conta).count(), 1)
        
        # Should have updated bank balance
        self.assertEqual(self.conta_bancaria.saldo_atual, 1300.00)  # 1000 + 300
