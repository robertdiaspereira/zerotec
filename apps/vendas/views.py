"""
Views for Vendas models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Venda, ItemVenda, FormaPagamento, PDV, MovimentoPDV
from .serializers import (
    VendaSerializer, VendaListSerializer, ItemVendaSerializer,
    FormaPagamentoSerializer, PDVSerializer, PDVListSerializer,
    MovimentoPDVSerializer
)


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
        
        movimento = MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='sangria',
            valor=valor,
            descricao=descricao
        )
        
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
        
        movimento = MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='suprimento',
            valor=valor,
            descricao=descricao
        )
        
        return Response(MovimentoPDVSerializer(movimento).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def venda_rapida(self, request, pk=None):
        """Quick sale through PDV"""
        pdv = self.get_object()
        
        if pdv.status != 'aberto':
            return Response({
                'error': 'Caixa não está aberto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create sale
        venda_data = request.data.get('venda', {})
        venda_data['vendedor'] = request.user.id
        venda_data['tipo'] = 'venda'
        venda_data['status'] = 'faturado'
        
        venda_serializer = VendaSerializer(data=venda_data, context={'request': request})
        venda_serializer.is_valid(raise_exception=True)
        venda = venda_serializer.save()
        
        # Register movement in PDV
        MovimentoPDV.objects.create(
            pdv=pdv,
            tipo='venda',
            valor=venda.valor_total,
            descricao=f'Venda {venda.numero}'
        )
        
        return Response({
            'message': 'Venda realizada com sucesso',
            'venda': VendaSerializer(venda).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def movimentos(self, request, pk=None):
        """Get PDV movements"""
        pdv = self.get_object()
        movimentos = pdv.movimentos.all()
        
        return Response(MovimentoPDVSerializer(movimentos, many=True).data)
