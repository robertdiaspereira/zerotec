"""
View para Relatório DRE (Demonstrativo de Resultado do Exercício)
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta

from apps.vendas.models import Venda
from apps.assistencia.models import OrdemServico
from apps.financeiro.models import ContaPagar, ContaReceber, CategoriaDRE


class DREView(APIView):
    """
    Relatório DRE (Demonstrativo de Resultado do Exercício)
    Baseado no sistema PHP existente
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        # Parâmetros
        ano = int(request.query_params.get('ano', timezone.now().year))
        mes = request.query_params.get('mes')  # Opcional
        
        if mes:
            # DRE Mensal
            mes = int(mes)
            return Response(self._calcular_dre_mensal(ano, mes))
        else:
            # DRE Anual
            return Response(self._calcular_dre_anual(ano))
    
    def _calcular_dre_mensal(self, ano, mes):
        """
        Calcula DRE para um mês específico
        """
        # Calcular início e fim do mês
        inicio = timezone.datetime(ano, mes, 1).date()
        if mes == 12:
            fim = timezone.datetime(ano + 1, 1, 1).date() - timedelta(days=1)
        else:
            fim = timezone.datetime(ano, mes + 1, 1).date() - timedelta(days=1)
        
        # Calcular todos os valores
        valores = self._calcular_valores_periodo(inicio, fim)
        
        # Montar estrutura do DRE
        dre = {
            'periodo': {
                'mes': mes,
                'ano': ano,
                'data_inicio': inicio.isoformat(),
                'data_fim': fim.isoformat()
            },
            'receita_bruta': {
                'vendas_produtos': valores['vendas_produtos'],
                'vendas_mercadorias': valores['vendas_mercadorias'],
                'prestacao_servicos': valores['prestacao_servicos'],
                'frete': valores['frete'],
                'total': valores['receita_bruta_total']
            },
            'deducoes': {
                'devolucoes': valores['devolucoes'],
                'abatimentos': valores['abatimentos'],
                'impostos': valores['impostos'],
                'total': valores['deducoes_total']
            },
            'receita_liquida': valores['receita_liquida'],
            'custos': {
                'produtos': valores['custo_produtos'],
                'mercadorias': valores['custo_mercadorias'],
                'servicos': valores['custo_servicos'],
                'total': valores['custos_total']
            },
            'lucro_bruto': valores['lucro_bruto'],
            'despesas_operacionais': {
                'vendas': valores['despesas_vendas'],
                'administrativas': valores['despesas_administrativas'],
                'salarios': valores['pagamento_salarios'],
                'total': valores['despesas_operacionais_total']
            },
            'despesas_financeiras_liquidas': valores['despesas_financeiras_liquidas'],
            'outras_receitas_despesas': valores['outras_receitas_despesas'],
            'resultado_operacional': valores['resultado_operacional'],
            'provisao_ir_csll': valores['provisao_ir_csll'],
            'lucro_antes_participacoes': valores['lucro_antes_participacoes'],
            'participacoes': valores['participacoes'],
            'lucro_liquido': valores['lucro_liquido'],
            'margem_liquida': valores['margem_liquida']
        }
        
        return dre
    
    def _calcular_dre_anual(self, ano):
        """
        Calcula DRE para o ano inteiro (12 meses)
        """
        meses_data = []
        totais = {
            'receita_bruta': 0,
            'deducoes': 0,
            'receita_liquida': 0,
            'custos': 0,
            'lucro_bruto': 0,
            'despesas_operacionais': 0,
            'lucro_liquido': 0
        }
        
        for mes in range(1, 13):
            # Calcular início e fim do mês
            inicio = timezone.datetime(ano, mes, 1).date()
            if mes == 12:
                fim = timezone.datetime(ano + 1, 1, 1).date() - timedelta(days=1)
            else:
                fim = timezone.datetime(ano, mes + 1, 1).date() - timedelta(days=1)
            
            # Calcular valores do mês
            valores = self._calcular_valores_periodo(inicio, fim)
            
            # Adicionar aos totais
            totais['receita_bruta'] += valores['receita_bruta_total']
            totais['deducoes'] += valores['deducoes_total']
            totais['receita_liquida'] += valores['receita_liquida']
            totais['custos'] += valores['custos_total']
            totais['lucro_bruto'] += valores['lucro_bruto']
            totais['despesas_operacionais'] += valores['despesas_operacionais_total']
            totais['lucro_liquido'] += valores['lucro_liquido']
            
            # Adicionar dados do mês
            meses_data.append({
                'mes': mes,
                'receita_bruta': valores['receita_bruta_total'],
                'deducoes': valores['deducoes_total'],
                'receita_liquida': valores['receita_liquida'],
                'custos': valores['custos_total'],
                'lucro_bruto': valores['lucro_bruto'],
                'despesas_operacionais': valores['despesas_operacionais_total'],
                'lucro_liquido': valores['lucro_liquido'],
                'margem_liquida': valores['margem_liquida']
            })
        
        # Calcular margem líquida total
        margem_total = (totais['lucro_liquido'] / totais['receita_bruta'] * 100) if totais['receita_bruta'] > 0 else 0
        
        return {
            'periodo': {
                'ano': ano
            },
            'meses': meses_data,
            'totais': {
                'receita_bruta': float(totais['receita_bruta']),
                'deducoes': float(totais['deducoes']),
                'receita_liquida': float(totais['receita_liquida']),
                'custos': float(totais['custos']),
                'lucro_bruto': float(totais['lucro_bruto']),
                'despesas_operacionais': float(totais['despesas_operacionais']),
                'lucro_liquido': float(totais['lucro_liquido']),
                'margem_liquida': round(margem_total, 2)
            }
        }
    
    def _calcular_valores_periodo(self, inicio, fim):
        """
        Calcula todos os valores do DRE para um período
        """
        # ========== RECEITA BRUTA ==========
        
        # Vendas de produtos (das vendas normais)
        vendas = Venda.objects.filter(
            data_venda__gte=inicio,
            data_venda__lte=fim,
            status='finalizada'
        ).aggregate(
            total=Sum('valor_total'),
            custo=Sum('custo_total'),
            frete=Sum('frete'),
            desconto=Sum('desconto')
        )
        
        vendas_produtos = vendas['total'] or 0
        custo_mercadorias = vendas['custo'] or 0
        frete_vendas = vendas['frete'] or 0
        desconto_vendas = vendas['desconto'] or 0
        
        # OS (Ordens de Serviço)
        os = OrdemServico.objects.filter(
            data_abertura__gte=inicio,
            data_abertura__lte=fim
        ).aggregate(
            servicos=Sum('valor_servicos'),
            produtos=Sum('valor_produtos'),
            custos=Sum('custo_total'),
            frete=Sum('frete'),
            desconto=Sum('desconto')
        )
        
        prestacao_servicos = os['servicos'] or 0
        vendas_mercadorias = os['produtos'] or 0
        custo_servicos = os['custos'] or 0
        frete_os = os['frete'] or 0
        desconto_os = os['desconto'] or 0
        
        # Frete total
        frete = frete_vendas + frete_os
        
        # Receita Bruta Total
        receita_bruta_total = vendas_produtos + vendas_mercadorias + prestacao_servicos + frete
        
        # ========== DEDUÇÕES ==========
        
        # Buscar valores por categoria DRE
        categorias_valores = self._buscar_valores_categorias(inicio, fim)
        
        devolucoes = categorias_valores.get('5', 0)  # Categoria 5
        abatimentos = categorias_valores.get('6', 0) + desconto_vendas + desconto_os  # Categoria 6 + descontos
        impostos = categorias_valores.get('7', 0)  # Categoria 7
        
        deducoes_total = devolucoes + abatimentos + impostos
        
        # ========== RECEITA LÍQUIDA ==========
        receita_liquida = receita_bruta_total - deducoes_total
        
        # ========== CUSTOS ==========
        custo_produtos = categorias_valores.get('8', 0)  # Categoria 8
        # custo_mercadorias já calculado acima
        # custo_servicos já calculado acima
        
        custos_total = custo_produtos + custo_mercadorias + custo_servicos
        
        # ========== LUCRO BRUTO ==========
        lucro_bruto = receita_liquida - custos_total
        
        # ========== DESPESAS OPERACIONAIS ==========
        despesas_vendas = categorias_valores.get('11', 0)  # Categoria 11
        despesas_administrativas = categorias_valores.get('12', 0)  # Categoria 12
        pagamento_salarios = categorias_valores.get('13', 0)  # Categoria 13
        
        despesas_operacionais_total = despesas_vendas + despesas_administrativas + pagamento_salarios
        
        # ========== DESPESAS FINANCEIRAS LÍQUIDAS ==========
        despesas_financeiras = categorias_valores.get('14', 0)  # Categoria 14
        variacoes_cambiais = categorias_valores.get('15', 0)  # Categoria 15
        
        despesas_financeiras_liquidas = variacoes_cambiais - despesas_financeiras
        
        # ========== OUTRAS RECEITAS E DESPESAS ==========
        equivalencia_patrimonial = categorias_valores.get('16', 0)  # Categoria 16
        venda_bens = categorias_valores.get('17', 0)  # Categoria 17
        custo_venda_bens = categorias_valores.get('18', 0)  # Categoria 18
        outras_receitas = categorias_valores.get('21', 0)  # Categoria 21
        outras_despesas = categorias_valores.get('22', 0)  # Categoria 22
        
        outras_receitas_despesas = (equivalencia_patrimonial + venda_bens + outras_receitas) - (custo_venda_bens + outras_despesas)
        
        # ========== RESULTADO OPERACIONAL ==========
        resultado_operacional = lucro_bruto - despesas_operacionais_total + despesas_financeiras_liquidas + outras_receitas_despesas
        
        # ========== PROVISÃO IR/CSLL ==========
        provisao_ir_csll = categorias_valores.get('19', 0)  # Categoria 19
        
        # ========== LUCRO ANTES DAS PARTICIPAÇÕES ==========
        lucro_antes_participacoes = resultado_operacional - provisao_ir_csll
        
        # ========== PARTICIPAÇÕES ==========
        participacoes = categorias_valores.get('20', 0)  # Categoria 20
        
        # ========== LUCRO LÍQUIDO ==========
        lucro_liquido = lucro_antes_participacoes - participacoes
        
        # ========== MARGEM LÍQUIDA ==========
        margem_liquida = (lucro_liquido / receita_bruta_total * 100) if receita_bruta_total > 0 else 0
        
        return {
            # Receita Bruta
            'vendas_produtos': float(vendas_produtos),
            'vendas_mercadorias': float(vendas_mercadorias),
            'prestacao_servicos': float(prestacao_servicos),
            'frete': float(frete),
            'receita_bruta_total': float(receita_bruta_total),
            
            # Deduções
            'devolucoes': float(devolucoes),
            'abatimentos': float(abatimentos),
            'impostos': float(impostos),
            'deducoes_total': float(deducoes_total),
            
            # Receita Líquida
            'receita_liquida': float(receita_liquida),
            
            # Custos
            'custo_produtos': float(custo_produtos),
            'custo_mercadorias': float(custo_mercadorias),
            'custo_servicos': float(custo_servicos),
            'custos_total': float(custos_total),
            
            # Lucro Bruto
            'lucro_bruto': float(lucro_bruto),
            
            # Despesas Operacionais
            'despesas_vendas': float(despesas_vendas),
            'despesas_administrativas': float(despesas_administrativas),
            'pagamento_salarios': float(pagamento_salarios),
            'despesas_operacionais_total': float(despesas_operacionais_total),
            
            # Despesas Financeiras
            'despesas_financeiras_liquidas': float(despesas_financeiras_liquidas),
            
            # Outras Receitas/Despesas
            'outras_receitas_despesas': float(outras_receitas_despesas),
            
            # Resultado Operacional
            'resultado_operacional': float(resultado_operacional),
            
            # Provisão IR/CSLL
            'provisao_ir_csll': float(provisao_ir_csll),
            
            # Lucro antes Participações
            'lucro_antes_participacoes': float(lucro_antes_participacoes),
            
            # Participações
            'participacoes': float(participacoes),
            
            # Lucro Líquido
            'lucro_liquido': float(lucro_liquido),
            
            # Margem Líquida
            'margem_liquida': round(margem_liquida, 2)
        }
    
    def _buscar_valores_categorias(self, inicio, fim):
        """
        Busca valores das categorias DRE no período
        Retorna um dicionário {codigo_categoria: valor}
        """
        valores = {}
        
        # Buscar todas as categorias
        categorias = CategoriaDRE.objects.filter(ativo=True)
        
        for categoria in categorias:
            # Buscar em Contas a Pagar (despesas)
            if categoria.tipo in ['despesa', 'custo']:
                total_pagar = ContaPagar.objects.filter(
                    data_pagamento__gte=inicio,
                    data_pagamento__lte=fim,
                    status='pago',
                    categoria_dre=categoria
                ).aggregate(total=Sum('valor_original'))['total'] or 0
                
                valores[categoria.codigo] = float(total_pagar)
            
            # Buscar em Contas a Receber (receitas)
            elif categoria.tipo == 'receita':
                total_receber = ContaReceber.objects.filter(
                    data_recebimento__gte=inicio,
                    data_recebimento__lte=fim,
                    status='recebido',
                    categoria_dre=categoria
                ).aggregate(total=Sum('valor_original'))['total'] or 0
                
                valores[categoria.codigo] = float(total_receber)
        
        return valores
