"""
Tests for CRM app
"""

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.erp.models import Cliente
from .models import Funil, EtapaFunil, Oportunidade, Atividade, Interacao


class CRMTest(TestCase):
    def setUp(self):
        # Criar funil
        self.funil = Funil.objects.create(
            nome='Vendas',
            descricao='Funil principal de vendas'
        )
        
        # Criar etapas
        self.etapa_lead = EtapaFunil.objects.create(
            funil=self.funil,
            nome='Lead',
            ordem=1,
            probabilidade=10,
            is_inicial=True
        )
        self.etapa_proposta = EtapaFunil.objects.create(
            funil=self.funil,
            nome='Proposta',
            ordem=2,
            probabilidade=50
        )
        self.etapa_ganho = EtapaFunil.objects.create(
            funil=self.funil,
            nome='Ganho',
            ordem=3,
            probabilidade=100,
            is_ganho=True
        )
        
        # Criar cliente
        self.cliente = Cliente.objects.create(
            nome_razao_social='Cliente Teste',
            cpf_cnpj='12345678901',
            telefone_principal='11999999999'
        )
    
    def test_oportunidade_creation(self):
        """Test opportunity creation"""
        oportunidade = Oportunidade.objects.create(
            titulo='Venda de Sistema',
            cliente=self.cliente,
            funil=self.funil,
            etapa=self.etapa_lead,
            valor_estimado=5000.00,
            data_fechamento_prevista=timezone.now().date() + timedelta(days=30)
        )
        
        self.assertIsNotNone(oportunidade.numero)
        self.assertTrue(oportunidade.numero.startswith('OPP'))
        self.assertEqual(oportunidade.probabilidade, 10)  # Da etapa
        self.assertEqual(oportunidade.valor_ponderado, 500.00)  # 5000 * 10%
    
    def test_mudanca_etapa(self):
        """Test stage change"""
        oportunidade = Oportunidade.objects.create(
            titulo='Venda',
            cliente=self.cliente,
            funil=self.funil,
            etapa=self.etapa_lead,
            valor_estimado=1000.00
        )
        
        # Mudar para proposta
        oportunidade.etapa = self.etapa_proposta
        oportunidade.save()
        
        # Deve ter criado interação
        self.assertEqual(Interacao.objects.filter(oportunidade=oportunidade).count(), 1)
        
        # Probabilidade deve ter mudado
        self.assertEqual(oportunidade.probabilidade, 50)
    
    def test_oportunidade_ganha(self):
        """Test won opportunity"""
        oportunidade = Oportunidade.objects.create(
            titulo='Venda',
            cliente=self.cliente,
            funil=self.funil,
            etapa=self.etapa_proposta,
            valor_estimado=1000.00
        )
        
        # Marcar como ganha
        oportunidade.etapa = self.etapa_ganho
        oportunidade.save()
        
        # Deve ter data de fechamento
        self.assertIsNotNone(oportunidade.data_fechamento)
        self.assertEqual(oportunidade.probabilidade, 100)
    
    def test_atividade_creation(self):
        """Test activity creation"""
        oportunidade = Oportunidade.objects.create(
            titulo='Venda',
            cliente=self.cliente,
            funil=self.funil,
            etapa=self.etapa_lead,
            valor_estimado=1000.00
        )
        
        atividade = Atividade.objects.create(
            oportunidade=oportunidade,
            tipo='ligacao',
            titulo='Ligar para cliente',
            data_prevista=timezone.now() + timedelta(days=1)
        )
        
        self.assertEqual(atividade.status, 'pendente')
        self.assertEqual(atividade.oportunidade, oportunidade)
