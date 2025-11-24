"""
Tests for Assistencia app
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.erp.models import Produto, Cliente
from .models import OrdemServico, PecaOS, OrcamentoOS, HistoricoOS

User = get_user_model()


class OrdemServicoTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='tecnico', password='test123')
        self.cliente = Cliente.objects.create(
            nome_razao_social='Cliente Teste',
            cpf_cnpj='12345678901',
            telefone_principal='11999999999'
        )
        self.produto = Produto.objects.create(
            nome='Peça Teste',
            codigo_interno='PECA001',
            preco_venda=50.00,
            estoque_atual=10
        )
    
    def test_os_creation(self):
        """Test service order creation"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook Dell',
            marca='Dell',
            modelo='Inspiron 15',
            defeito_relatado='Não liga',
            tecnico=self.user
        )
        
        self.assertIsNotNone(os.numero)
        self.assertTrue(os.numero.startswith('OS'))
        self.assertEqual(os.status, 'aberta')
    
    def test_adicionar_peca(self):
        """Test adding part to service order"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook',
            defeito_relatado='Tela quebrada',
            tecnico=self.user
        )
        
        peca = PecaOS.objects.create(
            os=os,
            produto=self.produto,
            quantidade=1,
            preco_unitario=50.00
        )
        
        self.assertEqual(peca.preco_total, 50.00)
        
        # Refresh OS
        os.refresh_from_db()
        self.assertEqual(os.valor_pecas, 50.00)
    
    def test_orcamento(self):
        """Test budget creation"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook',
            defeito_relatado='Não liga',
            tecnico=self.user,
            status='orcamento'
        )
        
        orcamento = OrcamentoOS.objects.create(
            os=os,
            descricao_servico='Troca de fonte',
            valor_servico=100.00,
            valor_pecas=50.00
        )
        
        self.assertEqual(orcamento.valor_total, 150.00)
        self.assertEqual(orcamento.status, 'pendente')
    
    def test_aprovar_orcamento(self):
        """Test budget approval"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook',
            defeito_relatado='Não liga',
            tecnico=self.user,
            status='orcamento'
        )
        
        orcamento = OrcamentoOS.objects.create(
            os=os,
            descricao_servico='Troca de fonte',
            valor_servico=100.00,
            valor_pecas=50.00
        )
        
        orcamento.status = 'aprovado'
        orcamento.data_aprovacao = timezone.now()
        orcamento.save()
        
        # Refresh OS
        os.refresh_from_db()
        self.assertEqual(os.status, 'aprovada')
        self.assertEqual(os.valor_servico, 100.00)
    
    def test_garantia(self):
        """Test warranty calculation"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook',
            defeito_relatado='Não liga',
            tecnico=self.user,
            status='concluida',
            garantia_dias=90
        )
        
        os.data_conclusao = timezone.now()
        os.save()
        
        self.assertIsNotNone(os.data_fim_garantia)
        self.assertTrue(os.em_garantia)
    
    def test_historico(self):
        """Test history logging"""
        os = OrdemServico.objects.create(
            cliente=self.cliente,
            equipamento='Notebook',
            defeito_relatado='Não liga',
            tecnico=self.user
        )
        
        # Should have created opening history
        self.assertEqual(os.historico.count(), 1)
        self.assertEqual(os.historico.first().acao, 'OS Aberta')
