"""
Views for Vendas models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Venda, ItemVenda, FormaPagamento, PDV, MovimentoPDV
from .serializers import (
    VendaSerializer, VendaListSerializer, ItemVendaSerializer,
    FormaPagamentoSerializer, PDVSerializer, PDVListSerializer,
    MovimentoPDVSerializer
)
from apps.erp.models import Produto, Cliente
from apps.erp.serializers import ProdutoSerializer
from apps.financeiro.models import ContaReceber, ContaBancaria, FluxoCaixa, CategoriaFinanceira, CategoriaDRE
from apps.estoque.models import MovimentacaoEstoque


class VendaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Venda
    """
    queryset = Venda.objects.select_related('cliente', 'vendedor').prefetch_related('itens', 'pagamentos').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['numero', 'cliente__nome_razao_social', 'observacoes']
    ordering_fields = ['data_venda', 'valor_total']
    filterset_fields = ['tipo', 'status', 'cliente', 'vendedor']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VendaListSerializer
        return VendaSerializer
    
    @action(detail=True, methods=['post'])
    def faturar(self, request, pk=None):
        """Invoice sale"""
        venda = self.get_object()
        
        if venda.status not in ['orcamento', 'aprovado']:
            return Response({
                'error': 'Venda não pode ser faturada neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock availability
        for item in venda.itens.all():
            if item.produto.estoque_atual < item.quantidade:
                return Response({
                    'error': f'Estoque insuficiente para {item.produto.nome}. Disponível: {item.produto.estoque_atual}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        venda.status = 'faturado'
        venda.save()
        
        return Response({
            'message': 'Venda faturada com sucesso',
            'venda': VendaSerializer(venda).data
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancel sale"""
        venda = self.get_object()
        
        if venda.status in ['entregue', 'cancelado']:
            return Response({
                'error': 'Venda não pode ser cancelada neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        venda.status = 'cancelado'
        venda.save()
        
        return Response({
            'message': 'Venda cancelada com sucesso',
            'venda': VendaSerializer(venda).data
        })
    
    @action(detail=True, methods=['get'])
    def imprimir(self, request, pk=None):
        """Generate sale invoice/receipt"""
        venda = self.get_object()
        
        # TODO: Implement PDF generation
        return Response({
            'message': 'Geração de PDF em desenvolvimento',
            'venda': VendaSerializer(venda).data
        }, status=status.HTTP_501_NOT_IMPLEMENTED)


class PDVViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PDV
    """
    queryset = PDV.objects.select_related('operador').prefetch_related('movimentos').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['data_abertura', 'data_fechamento']
    filterset_fields = ['status', 'operador', 'numero_caixa']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PDVListSerializer
        return PDVSerializer
    
    @action(detail=False, methods=['get'])
    def status_caixa(self, request):
        """Get current PDV status"""
        pdv_aberto = PDV.objects.filter(
            operador=request.user,
            status='aberto'
        ).first()
        
        if pdv_aberto:
            return Response({
                'caixa_aberto': True,
                'pdv': PDVSerializer(pdv_aberto).data
            })
        
        return Response({
            'caixa_aberto': False,
            'pdv': None
        })
    
    @action(detail=False, methods=['post'])
    def abrir(self, request):
        """Open PDV"""
        # Check if user already has an open PDV
        pdv_aberto = PDV.objects.filter(
            operador=request.user,
            status='aberto'
        ).exists()
        
        if pdv_aberto:
            return Response({
                'error': 'Você já possui um caixa aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valor_inicial = request.data.get('valor_inicial', 0)
        numero_caixa = request.data.get('numero_caixa', 1)
        
        pdv = PDV.objects.create(
            numero_caixa=numero_caixa,
            operador=request.user,
            valor_inicial=valor_inicial,
            status='aberto'
        )
        
        return Response(PDVSerializer(pdv).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def fechar(self, request, pk=None):
        """Close PDV"""
        pdv = self.get_object()
        
        if pdv.status != 'aberto':
            return Response({
                'error': 'Caixa não está aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if pdv.operador != request.user:
            return Response({
                'error': 'Você não pode fechar este caixa'
            }, status=status.HTTP_403_FORBIDDEN)
        
        valor_final = request.data.get('valor_final', pdv.saldo_calculado)
        
        pdv.valor_final = valor_final
        pdv.data_fechamento = timezone.now()
        pdv.status = 'fechado'
        pdv.save()
        
        diferenca = valor_final - pdv.saldo_calculado
        
        return Response({
            'message': 'Caixa fechado com sucesso',
            'pdv': PDVSerializer(pdv).data,
            'saldo_calculado': pdv.saldo_calculado,
            'valor_final': valor_final,
            'diferenca': diferenca
        })
    
    @action(detail=True, methods=['post'])
    def sangria(self, request, pk=None):
        """Cash withdrawal"""
        pdv = self.get_object()
        
        if pdv.status != 'aberto':
            return Response({
                'error': 'Caixa não está aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valor = request.data.get('valor', 0)
        descricao = request.data.get('descricao', 'Sangria')
        categoria_dre_id = request.data.get('categoria_dre_id')
        
        categoria_dre = None
        if categoria_dre_id:
            categoria_dre = get_object_or_404(CategoriaDRE, pk=categoria_dre_id)
        
        movimento = MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='sangria',
            valor=valor,
            descricao=descricao,
            categoria_dre=categoria_dre
        )
        
        # Atualizar saldo do PDV
        pdv.valor_sangrias += float(valor)
        pdv.save()
        
        return Response(MovimentoPDVSerializer(movimento).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def suprimento(self, request, pk=None):
        """Cash supply"""
        pdv = self.get_object()
        
        if pdv.status != 'aberto':
            return Response({
                'error': 'Caixa não está aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        valor = request.data.get('valor', 0)
        descricao = request.data.get('descricao', 'Suprimento')
        categoria_dre_id = request.data.get('categoria_dre_id')
        
        categoria_dre = None
        if categoria_dre_id:
            categoria_dre = get_object_or_404(CategoriaDRE, pk=categoria_dre_id)
        
        movimento = MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='suprimento',
            valor=valor,
            descricao=descricao,
            categoria_dre=categoria_dre
        )
        
        # Atualizar saldo do PDV
        pdv.valor_suprimentos += float(valor)
        pdv.save()
        
        return Response(MovimentoPDVSerializer(movimento).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def buscar_produto(self, request):
        """
        Busca produto por código de barras ou código interno
        """
        codigo = request.query_params.get('codigo')
        if not codigo:
            return Response(
                {'error': 'Código não informado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Tenta buscar por código de barras
        produto = Produto.objects.filter(
            codigo_barras=codigo, 
            active=True,
            tipo='produto'
        ).first()
        
        # Se não encontrar, tenta por código interno
        if not produto:
            produto = Produto.objects.filter(
                codigo_interno=codigo, 
                active=True,
                tipo='produto'
            ).first()
            
        if not produto:
            return Response(
                {'error': 'Produto não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        return Response(ProdutoSerializer(produto).data)

    @action(detail=True, methods=['post'])
    def finalizar_venda(self, request, pk=None):
        """
        Finaliza uma venda do PDV com baixa de estoque e financeiro
        """
        pdv = self.get_object()
        
        if pdv.status != 'aberto':
            return Response({
                'error': 'Caixa não está aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        dados = request.data
        itens = dados.get('itens', [])
        cliente_id = dados.get('cliente_id')
        forma_pagamento = dados.get('forma_pagamento', 'dinheiro')
        desconto = dados.get('desconto', 0)
        valor_recebido = dados.get('valor_recebido', 0)
        
        if not itens:
            return Response(
                {'error': 'Venda sem itens'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            with transaction.atomic():
                # 1. Identificar Cliente (ou Consumidor Final)
                if cliente_id:
                    cliente = get_object_or_404(Cliente, pk=cliente_id)
                else:
                    # Busca ou cria cliente "Consumidor Final"
                    cliente, _ = Cliente.objects.get_or_create(
                        cpf_cnpj='00000000000',
                        defaults={
                            'nome_razao_social': 'Consumidor Final',
                            'tipo': 'pf',
                            'telefone_principal': '0000000000'
                        }
                    )
                
                # 2. Calcular totais
                valor_produtos = sum(float(item['preco']) * float(item['quantidade']) for item in itens)
                valor_total = float(valor_produtos) - float(desconto)
                
                # 3. Criar Venda
                venda = Venda.objects.create(
                    cliente=cliente,
                    vendedor=request.user,
                    status='finalizada',  # PDV já nasce finalizada
                    data_venda=timezone.now().date(),
                    valor_produtos=valor_produtos,
                    desconto=desconto,
                    valor_total=valor_total,
                    forma_pagamento=forma_pagamento,
                    observacoes=f"Venda PDV Caixa {pdv.numero_caixa} - {timezone.now().strftime('%d/%m/%Y %H:%M')}"
                )
                
                # 4. Processar Itens e Estoque
                for item_data in itens:
                    produto = get_object_or_404(Produto, pk=item_data['produto_id'])
                    quantidade = float(item_data['quantidade'])
                    preco = float(item_data['preco'])
                    
                    # Criar ItemVenda
                    ItemVenda.objects.create(
                        venda=venda,
                        produto=produto,
                        quantidade=quantidade,
                        preco_unitario=preco,
                        subtotal=quantidade * preco
                    )
                    
                    # Baixar Estoque
                    MovimentacaoEstoque.registrar_movimentacao(
                        produto=produto,
                        tipo='saida',
                        quantidade=quantidade,
                        motivo='venda',
                        documento=venda.numero,
                        usuario=request.user
                    )
                
                # 5. Gerar Financeiro (Conta Receber + Fluxo Caixa)
                
                # Categoria padrão para vendas
                categoria_venda = CategoriaFinanceira.objects.filter(
                    tipo='receita', 
                    nome__icontains='Venda'
                ).first()
                
                if not categoria_venda:
                    categoria_venda = CategoriaFinanceira.objects.create(
                        nome='Vendas de Produtos',
                        tipo='receita'
                    )
                
                # Conta Bancária Padrão (Caixa)
                caixa = ContaBancaria.objects.filter(nome__icontains='Caixa').first()
                if not caixa:
                    caixa = ContaBancaria.objects.first()
                
                # Criar Conta a Receber (já recebida)
                conta = ContaReceber.objects.create(
                    cliente=cliente,
                    categoria=categoria_venda,
                    descricao=f"Venda PDV {venda.numero}",
                    valor_original=valor_total,
                    valor_recebido=valor_total,
                    data_emissao=timezone.now().date(),
                    data_vencimento=timezone.now().date(),
                    data_recebimento=timezone.now().date(),
                    status='recebido',
                    forma_recebimento=forma_pagamento,
                    conta_bancaria=caixa,
                    numero_documento=venda.numero
                )
                
                # Registrar Fluxo de Caixa
                if caixa:
                    FluxoCaixa.objects.create(
                        data=timezone.now().date(),
                        tipo='entrada',
                        categoria=categoria_venda,
                        descricao=f"Recebimento Venda PDV {venda.numero}",
                        valor=valor_total,
                        conta_bancaria=caixa,
                        conta_receber=conta
                    )
                    
                    # Atualizar saldo
                    caixa.saldo_atual += valor_total
                    caixa.save()
                
                # 6. Registrar Movimento no PDV
                MovimentoPDV.objects.create(
                    pdv=pdv,
                    tipo='venda',
                    valor=valor_total,
                    descricao=f'Venda {venda.numero}'
                )
                
                return Response({
                    'message': 'Venda realizada com sucesso',
                    'venda_id': venda.id,
                    'numero': venda.numero,
                    'valor_total': valor_total,
                    'troco': float(valor_recebido) - valor_total if valor_recebido else 0,
                    'venda': VendaSerializer(venda).data
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def movimentos(self, request, pk=None):
        """Get PDV movements"""
        pdv = self.get_object()
        movimentos = pdv.movimentos.all()
        
        return Response(MovimentoPDVSerializer(movimentos, many=True).data)
