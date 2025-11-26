# -*- coding: utf-8 -*-
"""Views for DRE (Demonstrativo de Resultado do Exercício) export and API.

Provides:
- DREBaseView: API view that returns DRE data (monthly or annual) as JSON.
- DREExportView: API view that returns PDF or Excel export of the DRE.
- DREView: Alias for backward compatibility (imports expecting DREView).
"""

from datetime import timedelta

from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework.response import Response
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph

# Application models
from apps.vendas.models import Venda
from apps.assistencia.models import OrdemServico
from apps.financeiro.models import ContaPagar, ContaReceber, CategoriaDRE


class DREBaseView(APIView):
    """Base view that calculates DRE data.

    GET parameters:
        ano (int) – year, defaults to current year.
        mes (int, optional) – month. If omitted, returns annual DRE.
    """

    def get(self, request):
        ano = int(request.query_params.get('ano', timezone.now().year))
        mes = request.query_params.get('mes')
        if mes:
            return Response(self._calcular_dre_mensal(ano, int(mes)))
        return Response(self._calcular_dre_anual(ano))

    # ---------------------------------------------------------------------
    # Calculation helpers
    # ---------------------------------------------------------------------
    def _calcular_dre_mensal(self, ano, mes):
        """Calculate DRE for a specific month."""
        inicio = timezone.datetime(ano, mes, 1).date()
        if mes == 12:
            fim = timezone.datetime(ano + 1, 1, 1).date() - timedelta(days=1)
        else:
            fim = timezone.datetime(ano, mes + 1, 1).date() - timedelta(days=1)
        valores = self._calcular_valores_periodo(inicio, fim)
        dre = {
            'periodo': {
                'mes': mes,
                'ano': ano,
                'data_inicio': inicio.isoformat(),
                'data_fim': fim.isoformat(),
            },
            'receita_bruta': {
                'vendas_produtos': valores['vendas_produtos'],
                'vendas_mercadorias': valores['vendas_mercadorias'],
                'prestacao_servicos': valores['prestacao_servicos'],
                'frete': valores['frete'],
                'total': valores['receita_bruta_total'],
            },
            'deducoes': {
                'devolucoes': valores['devolucoes'],
                'abatimentos': valores['abatimentos'],
                'impostos': valores['impostos'],
                'total': valores['deducoes_total'],
            },
            'receita_liquida': valores['receita_liquida'],
            'custos': {
                'produtos': valores['custo_produtos'],
                'mercadorias': valores['custo_mercadorias'],
                'servicos': valores['custo_servicos'],
                'total': valores['custos_total'],
            },
            'lucro_bruto': valores['lucro_bruto'],
            'despesas_operacionais': {
                'vendas': valores['despesas_vendas'],
                'administrativas': valores['despesas_administrativas'],
                'salarios': valores['pagamento_salarios'],
                'total': valores['despesas_operacionais_total'],
            },
            'despesas_financeiras_liquidas': valores['despesas_financeiras_liquidas'],
            'outras_receitas_despesas': valores['outras_receitas_despesas'],
            'resultado_operacional': valores['resultado_operacional'],
            'provisao_ir_csll': valores['provisao_ir_csll'],
            'lucro_antes_participacoes': valores['lucro_antes_participacoes'],
            'participacoes': valores['participacoes'],
            'lucro_liquido': valores['lucro_liquido'],
            'margem_liquida': valores['margem_liquida'],
        }
        return dre

    def _calcular_dre_anual(self, ano):
        """Calculate DRE for the whole year (12 months)."""
        meses_data = []
        totais = {
            'receita_bruta': 0,
            'deducoes': 0,
            'receita_liquida': 0,
            'custos': 0,
            'lucro_bruto': 0,
            'despesas_operacionais': 0,
            'lucro_liquido': 0,
        }
        for mes in range(1, 13):
            inicio = timezone.datetime(ano, mes, 1).date()
            if mes == 12:
                fim = timezone.datetime(ano + 1, 1, 1).date() - timedelta(days=1)
            else:
                fim = timezone.datetime(ano, mes + 1, 1).date() - timedelta(days=1)
            valores = self._calcular_valores_periodo(inicio, fim)
            # Accumulate totals
            totais['receita_bruta'] += valores['receita_bruta_total']
            totais['deducoes'] += valores['deducoes_total']
            totais['receita_liquida'] += valores['receita_liquida']
            totais['custos'] += valores['custos_total']
            totais['lucro_bruto'] += valores['lucro_bruto']
            totais['despesas_operacionais'] += valores['despesas_operacionais_total']
            totais['lucro_liquido'] += valores['lucro_liquido']
            meses_data.append({
                'mes': mes,
                'receita_bruta': valores['receita_bruta_total'],
                'deducoes': valores['deducoes_total'],
                'receita_liquida': valores['receita_liquida'],
                'custos': valores['custos_total'],
                'lucro_bruto': valores['lucro_bruto'],
                'despesas_operacionais': valores['despesas_operacionais_total'],
                'lucro_liquido': valores['lucro_liquido'],
                'margem_liquida': valores['margem_liquida'],
            })
        margem_total = (totais['lucro_liquido'] / totais['receita_bruta'] * 100) if totais['receita_bruta'] > 0 else 0
        return {
            'periodo': {'ano': ano},
            'meses': meses_data,
            'totais': {
                'receita_bruta': float(totais['receita_bruta']),
                'deducoes': float(totais['deducoes']),
                'receita_liquida': float(totais['receita_liquida']),
                'custos': float(totais['custos']),
                'lucro_bruto': float(totais['lucro_bruto']),
                'despesas_operacionais': float(totais['despesas_operacionais']),
                'lucro_liquido': float(totais['lucro_liquido']),
                'margem_liquida': round(margem_total, 2),
            },
        }

    def _calcular_valores_periodo(self, inicio, fim):
        """Calculate all financial values for a given period."""
        # ---------- Receita Bruta ----------
        vendas = Venda.objects.filter(
            data_venda__gte=inicio,
            data_venda__lte=fim,
            status='finalizada'
        ).aggregate(total=Sum('valor_total'), custo=Sum('custo_total'), frete=Sum('frete'), desconto=Sum('desconto'))
        vendas_produtos = vendas['total'] or 0
        custo_mercadorias = vendas['custo'] or 0
        frete_vendas = vendas['frete'] or 0
        desconto_vendas = vendas['desconto'] or 0

        os = OrdemServico.objects.filter(
            data_abertura__gte=inicio,
            data_abertura__lte=fim
        ).aggregate(servicos=Sum('valor_servicos'), produtos=Sum('valor_produtos'), custos=Sum('custo_total'), frete=Sum('frete'), desconto=Sum('desconto'))
        prestacao_servicos = os['servicos'] or 0
        vendas_mercadorias = os['produtos'] or 0
        custo_servicos = os['custos'] or 0
        frete_os = os['frete'] or 0
        desconto_os = os['desconto'] or 0

        frete = frete_vendas + frete_os
        receita_bruta_total = vendas_produtos + vendas_mercadorias + prestacao_servicos + frete

        # ---------- Deduções ----------
        categorias_valores = self._buscar_valores_categorias(inicio, fim)
        devolucoes = categorias_valores.get('5', 0)
        abatimentos = categorias_valores.get('6', 0) + desconto_vendas + desconto_os
        impostos = categorias_valores.get('7', 0)
        deducoes_total = devolucoes + abatimentos + impostos

        # ---------- Receita Líquida ----------
        receita_liquida = receita_bruta_total - deducoes_total

        # ---------- Custos ----------
        custo_produtos = categorias_valores.get('8', 0)
        custos_total = custo_produtos + custo_mercadorias + custo_servicos

        # ---------- Lucro Bruto ----------
        lucro_bruto = receita_liquida - custos_total

        # ---------- Despesas Operacionais ----------
        despesas_vendas = categorias_valores.get('11', 0)
        despesas_administrativas = categorias_valores.get('12', 0)
        pagamento_salarios = categorias_valores.get('13', 0)
        despesas_operacionais_total = despesas_vendas + despesas_administrativas + pagamento_salarios

        # ---------- Despesas Financeiras Líquidas ----------
        despesas_financeiras = categorias_valores.get('14', 0)
        variacoes_cambiais = categorias_valores.get('15', 0)
        despesas_financeiras_liquidas = variacoes_cambiais - despesas_financeiras

        # ---------- Outras Receitas e Despesas ----------
        equivalencia_patrimonial = categorias_valores.get('16', 0)
        venda_bens = categorias_valores.get('17', 0)
        custo_venda_bens = categorias_valores.get('18', 0)
        outras_receitas = categorias_valores.get('21', 0)
        outras_despesas = categorias_valores.get('22', 0)
        outras_receitas_despesas = (equivalencia_patrimonial + venda_bens + outras_receitas) - (custo_venda_bens + outras_despesas)

        # ---------- Resultado Operacional ----------
        resultado_operacional = lucro_bruto - despesas_operacionais_total + despesas_financeiras_liquidas + outras_receitas_despesas

        # ---------- Provisão IR/CSLL ----------
        provisao_ir_csll = categorias_valores.get('19', 0)

        # ---------- Lucro antes Participações ----------
        lucro_antes_participacoes = resultado_operacional - provisao_ir_csll

        # ---------- Participações ----------
        participacoes = categorias_valores.get('20', 0)

        # ---------- Lucro Líquido ----------
        lucro_liquido = lucro_antes_participacoes - participacoes

        # ---------- Margem Líquida ----------
        margem_liquida = (lucro_liquido / receita_bruta_total * 100) if receita_bruta_total > 0 else 0

        return {
            'vendas_produtos': float(vendas_produtos),
            'vendas_mercadorias': float(vendas_mercadorias),
            'prestacao_servicos': float(prestacao_servicos),
            'frete': float(frete),
            'receita_bruta_total': float(receita_bruta_total),
            'devolucoes': float(devolucoes),
            'abatimentos': float(abatimentos),
            'impostos': float(impostos),
            'deducoes_total': float(deducoes_total),
            'receita_liquida': float(receita_liquida),
            'custo_produtos': float(custo_produtos),
            'custo_mercadorias': float(custo_mercadorias),
            'custo_servicos': float(custo_servicos),
            'custos_total': float(custos_total),
            'lucro_bruto': float(lucro_bruto),
            'despesas_vendas': float(despesas_vendas),
            'despesas_administrativas': float(despesas_administrativas),
            'pagamento_salarios': float(pagamento_salarios),
            'despesas_operacionais_total': float(despesas_operacionais_total),
            'despesas_financeiras_liquidas': float(despesas_financeiras_liquidas),
            'outras_receitas_despesas': float(outras_receitas_despesas),
            'resultado_operacional': float(resultado_operacional),
            'provisao_ir_csll': float(provisao_ir_csll),
            'lucro_antes_participacoes': float(lucro_antes_participacoes),
            'participacoes': float(participacoes),
            'lucro_liquido': float(lucro_liquido),
            'margem_liquida': round(margem_liquida, 2),
        }

    def _buscar_valores_categorias(self, inicio, fim):
        """Fetch DRE category values for the period.

        Returns a dict mapping category code to Decimal value.
        """
        valores = {}
        categorias = CategoriaDRE.objects.filter(ativo=True)
        for categoria in categorias:
            if categoria.tipo in ['despesa', 'custo']:
                total = ContaPagar.objects.filter(
                    data_pagamento__gte=inicio,
                    data_pagamento__lte=fim,
                    status='pago',
                    categoria_dre=categoria
                ).aggregate(total=Sum('valor_original'))['total'] or 0
                valores[categoria.codigo] = float(total)
            elif categoria.tipo == 'receita':
                total = ContaReceber.objects.filter(
                    data_recebimento__gte=inicio,
                    data_recebimento__lte=fim,
                    status='recebido',
                    categoria_dre=categoria
                ).aggregate(total=Sum('valor_original'))['total'] or 0
                valores[categoria.codigo] = float(total)
        return valores


class DREExportView(APIView):
    """Export DRE report as PDF or Excel.

    Query parameters are the same as DREBaseView (ano, mes) plus `format` (pdf|xlsx).
    """

    def get(self, request):
        ano = int(request.query_params.get('ano', timezone.now().year))
        mes = request.query_params.get('mes')
        fmt = request.query_params.get('format', 'pdf').lower()
        calculator = DREBaseView()
        if mes:
            data = calculator._calcular_dre_mensal(ano, int(mes))
        else:
            data = calculator._calcular_dre_anual(ano)
        if fmt == 'xlsx':
            # Flatten nested dict for Excel
            flat = {}
            def flatten(prefix, obj):
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        flatten(f"{prefix}{k}_" if prefix else f"{k}_", v)
                else:
                    flat[prefix.rstrip('_')] = obj
            flatten('', data)
            df = pd.DataFrame(list(flat.items()), columns=['Campo', 'Valor'])
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='DRE')
            output.seek(0)
            response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="dre_{ano}_{mes if mes else "annual"}.xlsx"'
            return response
        # PDF generation
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = [Paragraph('Relatório DRE', styles['Title'])]
        rows = []
        def add_rows(prefix, obj):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    add_rows(f"{prefix}{k} ", v)
            else:
                rows.append([prefix.rstrip(' '), str(obj)])
        add_rows('', data)
        table = Table(rows, colWidths=[200, 300])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
        doc.build(elements)
        pdf = buffer.getvalue()
        buffer.close()
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="dre_{ano}_{mes if mes else "annual"}.pdf"'
        return response


# Alias for backward compatibility – many parts of the code import DREView
class DREView(DREBaseView):
    """Compatibility alias for the original DREView name."""
    pass
