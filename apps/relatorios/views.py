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
    """
    # permission_classes = [IsAuthenticated]  # Desabilitado para teste local
    
    def get(self, request):
        hoje = timezone.now().date()
        inicio_mes = hoje.replace(day=1)
        mes_passado = (inicio_mes - timedelta(days=1)).replace(day=1)
        
        # Vendas
        vendas_mes = Venda.objects.filter(
            data_venda__gte=inicio_mes,
            status='finalizada'
        )
        total_vendas_mes = vendas_mes.aggregate(total=Sum('valor_total'))['total'] or 0
        qtd_vendas_mes = vendas_mes.count()
        
        vendas_mes_passado = Venda.objects.filter(
            data_venda__gte=mes_passado,
            data_venda__lt=inicio_mes,
            status='finalizada'
        ).aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Compras
        compras_mes = PedidoCompra.objects.filter(
            data_pedido__gte=inicio_mes
        ).aggregate(total=Sum('valor_total'))['total'] or 0
        
        # Financeiro
        contas_receber_vencidas = ContaReceber.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        contas_pagar_vencidas = ContaPagar.objects.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        saldo_contas_receber = ContaReceber.objects.filter(
            status='pendente'
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        saldo_contas_pagar = ContaPagar.objects.filter(
            status='pendente'
        ).aggregate(total=Sum('valor_original'))['total'] or 0
        
        # OS
        os_abertas = OrdemServico.objects.filter(
            status__in=['aberta', 'em_andamento']
        ).count()
        
        os_mes = OrdemServico.objects.filter(
            data_abertura__gte=inicio_mes
        ).count()
        
        # CRM
        oportunidades_abertas = Oportunidade.objects.exclude(
            etapa__is_ganho=True
        ).exclude(
            etapa__is_perdido=True
        ).count()
        
        valor_pipeline = Oportunidade.objects.exclude(
            etapa__is_ganho=True
        ).exclude(
            etapa__is_perdido=True
        ).aggregate(total=Sum('valor_estimado'))['total'] or 0
        
        # Produtos mais vendidos (top 5)
        produtos_mais_vendidos = ItemVenda.objects.filter(
            venda__data_venda__gte=inicio_mes,
            venda__status='finalizada'
        ).values(
            'produto__nome'
        ).annotate(
            quantidade=Sum('quantidade')
        ).order_by('-quantidade')[:5]
        
        # Clientes que mais compraram (top 5)
        top_clientes = Venda.objects.filter(
            data_venda__gte=inicio_mes,
            status='finalizada'
        ).values(
            'cliente__nome_razao_social'
        ).annotate(
            total=Sum('valor_total'),
            qtd_vendas=Count('id')
        ).order_by('-total')[:5]
        
        data = {
            'vendas': {
                'total_mes': float(total_vendas_mes),
                'quantidade_mes': qtd_vendas_mes,
                'total_mes_passado': float(vendas_mes_passado),
                'crescimento_percentual': (
                    ((total_vendas_mes - vendas_mes_passado) / vendas_mes_passado * 100)
                    if vendas_mes_passado > 0 else 0
                ),
                'ticket_medio': float(total_vendas_mes / qtd_vendas_mes) if qtd_vendas_mes > 0 else 0
            },
            'compras': {
                'total_mes': float(compras_mes)
            },
            'financeiro': {
                'contas_receber_vencidas': float(contas_receber_vencidas),
                'contas_pagar_vencidas': float(contas_pagar_vencidas),
                'saldo_contas_receber': float(saldo_contas_receber),
                'saldo_contas_pagar': float(saldo_contas_pagar),
                'saldo_liquido': float(saldo_contas_receber - saldo_contas_pagar)
            },
            'os': {
                'abertas': os_abertas,
                'mes': os_mes
            },
            'crm': {
                'oportunidades_abertas': oportunidades_abertas,
                'valor_pipeline': float(valor_pipeline)
            },
            'top_produtos': list(produtos_mais_vendidos),
            'top_clientes': list(top_clientes)
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
