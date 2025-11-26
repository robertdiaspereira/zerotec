"""
Views for Reports Module
Comprehensive business analytics and reporting
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from django.http import HttpResponse
from io import BytesIO

# Models
from apps.vendas.models import Venda, ItemVenda
from apps.compras.models import PedidoCompra
from apps.estoque.models import MovimentacaoEstoque
from apps.financeiro.models import ContaPagar, ContaReceber, FluxoCaixa
from apps.assistencia.models import OrdemServico
from apps.erp.models import Cliente, Fornecedor, Produto
from apps.crm.models import Oportunidade

# Export utilities
from .utils import PDFExporter, ExcelExporter


class DashboardView(APIView):
    """
    Dashboard geral com KPIs principais
    Baseado no sistema PHP existente
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        # Parâmetros
        ano = int(request.query_params.get('ano', timezone.now().year))
        mes = int(request.query_params.get('mes', timezone.now().month))
        
        hoje = timezone.now().date()
        inicio_mes = hoje.replace(day=1, month=mes, year=ano)
        
        # Calcular último dia do mês
        if mes == 12:
            fim_mes = inicio_mes.replace(year=ano+1, month=1, day=1) - timedelta(days=1)
        else:
            fim_mes = inicio_mes.replace(month=mes+1, day=1) - timedelta(days=1)
        
        mes_passado_inicio = (inicio_mes - timedelta(days=1)).replace(day=1)
        mes_passado_fim = inicio_mes - timedelta(days=1)
        
        # ========== VENDAS DO MÊS ==========
        vendas_mes = Venda.objects.filter(
            data_venda__gte=inicio_mes,
            data_venda__lte=fim_mes,
            status='finalizada'
        )
        
        vendas_stats = vendas_mes.aggregate(
            total=Sum('valor_total'),
            descontos=Sum('valor_desconto')
        )
        
        total_vendas_mes = vendas_stats['total'] or 0
        total_descontos = vendas_stats['descontos'] or 0
        qtd_vendas_mes = vendas_mes.count()
        
        # Vendas mês passado para comparação
        vendas_mes_passado = Venda.objects.filter(
            data_venda__gte=mes_passado_inicio,
            data_venda__lte=mes_passado_fim,
            status='finalizada'
        ).aggregate(total=Sum('valor_total'))['total'] or 0
        
        # ========== ORDENS DE SERVIÇO DO MÊS ==========
        os_mes = OrdemServico.objects.filter(
            data_abertura__gte=inicio_mes,
            data_abertura__lte=fim_mes
        )
        
        os_stats = os_mes.aggregate(
            total=Sum('valor_total'),
            servicos=Sum('valor_servico'),
            pecas=Sum('valor_pecas')
        )
        
        total_os = os_stats['total'] or 0
        valor_servicos = os_stats['servicos'] or 0
        valor_pecas_os = os_stats['pecas'] or 0
        qtd_os_mes = os_mes.count()
        
        # ========== CONTAS A RECEBER ==========
        # Hoje
        contas_receber_hoje = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Este mês
        contas_receber_mes = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=fim_mes
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Atrasadas
        contas_receber_atrasadas = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # ========== CONTAS A PAGAR ==========
        # Hoje
        contas_pagar_hoje = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Este mês
        contas_pagar_mes = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=fim_mes
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Atrasadas
        contas_pagar_atrasadas = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # ========== DESPESAS DO MÊS ==========
        despesas_mes = ContaPagar.objects.filter(
            data_pagamento__gte=inicio_mes,
            data_pagamento__lte=fim_mes,
            status='pago'
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # ========== GRÁFICOS ANUAIS ==========
        graficos_anuais = self._get_graficos_anuais(ano)
        
        # ========== ÚLTIMAS MOVIMENTAÇÕES ==========
        ultimas_movimentacoes = self._get_ultimas_movimentacoes()
        
        # ========== RESPOSTA ==========
        data = {
            'kpis': {
                'vendas_mes': {
                    'total': float(total_vendas_mes),
                    'quantidade': qtd_vendas_mes,
                    'ticket_medio': float(total_vendas_mes / qtd_vendas_mes) if qtd_vendas_mes > 0 else 0,
                    'variacao': (
                        ((total_vendas_mes - vendas_mes_passado) / vendas_mes_passado * 100)
                        if vendas_mes_passado > 0 else 0
                    )
                },
                'os_mes': {
                    'total': float(total_os),
                    'quantidade': qtd_os_mes,
                    'abertas': OrdemServico.objects.filter(
                        data_abertura__gte=inicio_mes,
                        data_abertura__lte=fim_mes,
                        status__in=['aberta', 'em_andamento', 'aguardando_pecas']
                    ).count(),
                    'concluidas': OrdemServico.objects.filter(
                        data_abertura__gte=inicio_mes,
                        data_abertura__lte=fim_mes,
                        status='concluida'
                    ).count()
                },
                'financeiro_mes': {
                    'receber': float(contas_receber_mes),
                    'pagar': float(contas_pagar_mes),
                    'saldo': float(contas_receber_mes - contas_pagar_mes)
                },
                'contas_receber': {
                    'hoje': float(contas_receber_hoje),
                    'restante_mes': float(contas_receber_mes - contas_receber_hoje),
                    'atrasadas': float(contas_receber_atrasadas),
                    'total_mes': float(contas_receber_mes)
                },
                'contas_pagar': {
                    'hoje': float(contas_pagar_hoje),
                    'restante_mes': float(contas_pagar_mes - contas_pagar_hoje),
                    'atrasadas': float(contas_pagar_atrasadas),
                    'total_mes': float(contas_pagar_mes)
                }
            },
            'graficos': {
                'vendas_ano': [
                    {'mes': i+1, 'valor': graficos_anuais['vendas_anual'][i]}
                    for i in range(12)
                ],
                'custos_ano': [
                    {'mes': i+1, 'valor': graficos_anuais['custos_vendas_anual'][i]}
                    for i in range(12)
                ],
                'os_ano': [
                    {'mes': i+1, 'quantidade': int(graficos_anuais['os_servicos_anual'][i] + graficos_anuais['os_produtos_anual'][i])}
                    for i in range(12)
                ]
            },
            'ultimas_movimentacoes': self._format_movimentacoes(ultimas_movimentacoes)
        }
        
        # Check if export format is requested
        export_format = request.query_params.get('export')
        
        if export_format == 'pdf':
            pdf_buffer = PDFExporter.generate_dashboard_pdf(data)
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="dashboard_zerotec_{hoje.strftime("%Y%m%d")}.pdf"'
            return response
        
        elif export_format == 'excel':
            excel_buffer = ExcelExporter.generate_dashboard_excel(data)
            response = HttpResponse(
                excel_buffer,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="dashboard_zerotec_{hoje.strftime("%Y%m%d")}.xlsx"'
            return response
        
        return Response(data)
    
    def _get_graficos_anuais(self, ano):
        """
        Gera dados para gráficos anuais (12 meses)
        """
        vendas_mensal = []
        custos_vendas_mensal = []
        os_servicos_mensal = []
        os_produtos_mensal = []
        os_custos_mensal = []
        
        for mes in range(1, 13):
            # Calcular início e fim do mês
            inicio = timezone.datetime(ano, mes, 1).date()
            if mes == 12:
                fim = timezone.datetime(ano + 1, 1, 1).date() - timedelta(days=1)
            else:
                fim = timezone.datetime(ano, mes + 1, 1).date() - timedelta(days=1)
            
            # Vendas
            vendas = Venda.objects.filter(
                data_venda__gte=inicio,
                data_venda__lte=fim,
                status='faturado'  # Mudado de 'finalizada' para 'faturado'
            ).aggregate(
                total=Sum('valor_total')
            )
            
            vendas_mensal.append(float(vendas['total'] or 0))
            custos_vendas_mensal.append(0)  # Venda não tem custo_total
            
            # OS
            os = OrdemServico.objects.filter(
                data_abertura__gte=inicio,
                data_abertura__lte=fim
            ).aggregate(
                servicos=Sum('valor_servico'),
                pecas=Sum('valor_pecas')
            )
            
            os_servicos_mensal.append(float(os['servicos'] or 0))
            os_produtos_mensal.append(float(os['pecas'] or 0))
            os_custos_mensal.append(0)  # OS não tem custo_total
        
        return {
            'vendas_anual': vendas_mensal,
            'custos_vendas_anual': custos_vendas_mensal,
            'os_servicos_anual': os_servicos_mensal,
            'os_produtos_anual': os_produtos_mensal,
            'os_custos_anual': os_custos_mensal,
            'meses': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        }
    
    def _get_ultimas_movimentacoes(self):
        """
        Retorna as últimas movimentações do sistema
        """
        # Últimas 10 vendas
        ultimas_vendas = Venda.objects.select_related('cliente').filter(
            status='finalizada'
        ).values(
            'id',
            'numero',
            'data_venda',
            'cliente__nome_razao_social',
            'valor_total',
            'status'
        ).order_by('-data_venda')[:10]
        
        # Últimas 10 OS
        ultimas_os = OrdemServico.objects.select_related('cliente').values(
            'id',
            'numero',
            'data_abertura',
            'cliente__nome_razao_social',
            'valor_total',
            'status'
        ).order_by('-data_abertura')[:10]
        
        # Últimas 10 compras
        ultimas_compras = PedidoCompra.objects.select_related('fornecedor').values(
            'id',
            'numero',
            'data_pedido',
            'fornecedor__razao_social',
            'valor_total',
            'status'
        ).order_by('-data_pedido')[:10]
        
        return {
            'vendas': list(ultimas_vendas),
            'os': list(ultimas_os),
            'compras': list(ultimas_compras)
        }
    
    def _format_movimentacoes(self, movimentacoes):
        """
        Formata as movimentações para o formato esperado pelo frontend
        """
        resultado = []
        
        # Formatar vendas
        for venda in movimentacoes['vendas']:
            resultado.append({
                'id': venda['id'],
                'tipo': 'venda',
                'descricao': f"Venda {venda['numero']} - {venda['cliente__nome_razao_social']}",
                'valor': float(venda['valor_total']),
                'data': venda['data_venda'].isoformat() if hasattr(venda['data_venda'], 'isoformat') else str(venda['data_venda'])
            })
        
        # Formatar OS
        for os in movimentacoes['os']:
            resultado.append({
                'id': os['id'],
                'tipo': 'os',
                'descricao': f"OS {os['numero']} - {os['cliente__nome_razao_social']}",
                'valor': float(os['valor_total']),
                'data': os['data_abertura'].isoformat() if hasattr(os['data_abertura'], 'isoformat') else str(os['data_abertura'])
            })
        
        # Formatar compras
        for compra in movimentacoes['compras']:
            resultado.append({
                'id': compra['id'],
                'tipo': 'compra',
                'descricao': f"Compra {compra['numero']} - {compra['fornecedor__razao_social']}",
                'valor': float(compra['valor_total']),
                'data': compra['data_pedido'].isoformat() if hasattr(compra['data_pedido'], 'isoformat') else str(compra['data_pedido'])
            })
        
        # Ordenar por data (mais recente primeiro) e pegar apenas as 10 primeiras
        resultado.sort(key=lambda x: x['data'], reverse=True)
        return resultado[:10]



class RelatorioVendasView(APIView):
    """
    Relatório de vendas por período
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        # Parâmetros
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        cliente_id = request.query_params.get('cliente_id')
        produto_id = request.query_params.get('produto_id')
        
        # Query base
        vendas = Venda.objects.filter(status='finalizada')
        
        # Filtros
        if data_inicio:
            vendas = vendas.filter(data_venda__gte=data_inicio)
        if data_fim:
            vendas = vendas.filter(data_venda__lte=data_fim)
        if cliente_id:
            vendas = vendas.filter(cliente_id=cliente_id)
        
        # Resumo
        resumo = vendas.aggregate(
            total_vendas=Sum('valor_total'),
            quantidade=Count('id'),
            ticket_medio=Avg('valor_total')
        )
        
        # Vendas por dia
        vendas_por_dia = vendas.extra(
            select={'dia': 'DATE(data_venda)'}
        ).values('dia').annotate(
            total=Sum('valor_total'),
            quantidade=Count('id')
        ).order_by('dia')
        
        # Vendas por produto (se filtrado)
        vendas_por_produto = None
        if produto_id:
            vendas_por_produto = ItemVenda.objects.filter(
                venda__in=vendas,
                produto_id=produto_id
            ).aggregate(
                quantidade_total=Sum('quantidade'),
                valor_total=Sum(F('quantidade') * F('preco_unitario'))
            )
        
        # Lista de vendas
        vendas_lista = vendas.values(
            'numero',
            'data_venda',
            'cliente__nome_razao_social',
            'valor_total',
            'desconto',
            'valor_liquido'
        ).order_by('-data_venda')
        
        return Response({
            'resumo': {
                'total_vendas': float(resumo['total_vendas'] or 0),
                'quantidade': resumo['quantidade'],
                'ticket_medio': float(resumo['ticket_medio'] or 0)
            },
            'vendas_por_dia': list(vendas_por_dia),
            'vendas_por_produto': vendas_por_produto,
            'vendas': list(vendas_lista)
        })


class RelatorioEstoqueView(APIView):
    """
    Relatório de estoque atual e movimentações
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        # Produtos com estoque baixo
        produtos_estoque_baixo = Produto.objects.filter(
            quantidade_estoque__lte=F('estoque_minimo')
        ).values(
            'codigo',
            'nome',
            'quantidade_estoque',
            'estoque_minimo'
        )
        
        # Valor total em estoque
        valor_estoque = Produto.objects.aggregate(
            valor_total=Sum(F('quantidade_estoque') * F('preco_custo'))
        )['valor_total'] or 0
        
        # Movimentações recentes
        movimentacoes = MovimentacaoEstoque.objects.select_related(
            'produto'
        ).values(
            'data_movimentacao',
            'tipo',
            'produto__nome',
            'quantidade',
            'motivo'
        ).order_by('-data_movimentacao')[:50]
        
        # Produtos mais movimentados
        produtos_mais_movimentados = MovimentacaoEstoque.objects.values(
            'produto__nome'
        ).annotate(
            total_movimentacoes=Count('id'),
            quantidade_total=Sum('quantidade')
        ).order_by('-total_movimentacoes')[:10]
        
        return Response({
            'produtos_estoque_baixo': list(produtos_estoque_baixo),
            'valor_total_estoque': float(valor_estoque),
            'movimentacoes_recentes': list(movimentacoes),
            'produtos_mais_movimentados': list(produtos_mais_movimentados)
        })


class RelatorioFinanceiroView(APIView):
    """
    Relatório financeiro - DRE simplificado
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        
        # Receitas
        receitas = ContaReceber.objects.filter(status='recebido')
        if data_inicio:
            receitas = receitas.filter(data_recebimento__gte=data_inicio)
        if data_fim:
            receitas = receitas.filter(data_recebimento__lte=data_fim)
        
        total_receitas = receitas.aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Despesas
        despesas = ContaPagar.objects.filter(status='pago')
        if data_inicio:
            despesas = despesas.filter(data_pagamento__gte=data_inicio)
        if data_fim:
            despesas = despesas.filter(data_pagamento__lte=data_fim)
        
        total_despesas = despesas.aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Lucro
        lucro = total_receitas - total_despesas
        margem = (lucro / total_receitas * 100) if total_receitas > 0 else 0
        
        # Fluxo de caixa
        fluxo = FluxoCaixa.objects.all()
        if data_inicio:
            fluxo = fluxo.filter(data_movimentacao__gte=data_inicio)
        if data_fim:
            fluxo = fluxo.filter(data_movimentacao__lte=data_fim)
        
        fluxo_por_dia = fluxo.extra(
            select={'dia': 'DATE(data_movimentacao)'}
        ).values('dia', 'tipo').annotate(
            total=Sum('valor')
        ).order_by('dia')
        
        # Contas a receber por vencimento
        hoje = timezone.now().date()
        contas_receber_vencidas = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        contas_receber_vencer_7dias = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=hoje + timedelta(days=7)
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # Contas a pagar por vencimento
        contas_pagar_vencidas = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        contas_pagar_vencer_7dias = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento__gte=hoje,
            data_vencimento__lte=hoje + timedelta(days=7)
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        return Response({
            'dre': {
                'receitas': float(total_receitas),
                'despesas': float(total_despesas),
                'lucro': float(lucro),
                'margem_percentual': round(margem, 2)
            },
            'fluxo_caixa': list(fluxo_por_dia),
            'contas_receber': {
                'vencidas': float(contas_receber_vencidas),
                'vencer_7dias': float(contas_receber_vencer_7dias)
            },
            'contas_pagar': {
                'vencidas': float(contas_pagar_vencidas),
                'vencer_7dias': float(contas_pagar_vencer_7dias)
            }
        })


class RelatorioOSView(APIView):
    """
    Relatório de Ordens de Serviço
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        status_filter = request.query_params.get('status')
        
        # Query base
        os_list = OrdemServico.objects.all()
        
        # Filtros
        if data_inicio:
            os_list = os_list.filter(data_abertura__gte=data_inicio)
        if data_fim:
            os_list = os_list.filter(data_abertura__lte=data_fim)
        if status_filter:
            os_list = os_list.filter(status=status_filter)
        
        # Resumo
        resumo = os_list.aggregate(
            total=Count('id'),
            valor_total=Sum('valor_total')
        )
        
        # OS por status
        os_por_status = OrdemServico.objects.values('status').annotate(
            quantidade=Count('id'),
            valor_total=Sum('valor_total')
        )
        
        # OS por técnico
        os_por_tecnico = OrdemServico.objects.filter(
            tecnico__isnull=False
        ).values(
            'tecnico__first_name',
            'tecnico__last_name'
        ).annotate(
            quantidade=Count('id'),
            valor_total=Sum('valor_total')
        ).order_by('-quantidade')
        
        # Tempo médio de conclusão
        os_concluidas = OrdemServico.objects.filter(
            status='concluida',
            data_conclusao__isnull=False
        )
        
        tempo_medio = None
        if os_concluidas.exists():
            tempos = []
            for os in os_concluidas:
                if os.data_conclusao and os.data_abertura:
                    delta = os.data_conclusao - os.data_abertura
                    tempos.append(delta.days)
            
            if tempos:
                tempo_medio = sum(tempos) / len(tempos)
        
        return Response({
            'resumo': {
                'total': resumo['total'],
                'valor_total': float(resumo['valor_total'] or 0)
            },
            'por_status': list(os_por_status),
            'por_tecnico': list(os_por_tecnico),
            'tempo_medio_conclusao_dias': round(tempo_medio, 1) if tempo_medio else None
        })
