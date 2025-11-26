"""
Views for ERP models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categoria, Cliente, Fornecedor, Produto
from .serializers import (
    CategoriaSerializer,
    ClienteSerializer,
    ClienteListSerializer,
    FornecedorSerializer,
    FornecedorListSerializer,
    ProdutoSerializer,
    ProdutoListSerializer,
    ProdutoImportSerializer,
)


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Categoria
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'tipo', 'created_at']
    filterset_fields = ['tipo', 'active']


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cliente
    """
    queryset = Cliente.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome_razao_social', 'nome_fantasia', 'cpf_cnpj', 'email', 'telefone_principal']
    ordering_fields = ['nome_razao_social', 'created_at']
    filterset_fields = ['tipo', 'active', 'cidade', 'estado']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ClienteListSerializer
        return ClienteSerializer
    
    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """
        Get customer history (sales + service orders)
        """
        cliente = self.get_object()
        
        # Imports locais para evitar ciclo
        from apps.vendas.models import Venda
        from apps.assistencia.models import OrdemServico
        from apps.vendas.serializers import VendaListSerializer
        from apps.assistencia.serializers import OrdemServicoListSerializer
        
        # Buscar vendas
        vendas = Venda.objects.filter(cliente=cliente).order_by('-data_venda')
        total_vendas = vendas.count()
        valor_total_vendas = sum(v.valor_total for v in vendas)
        
        # Buscar OS
        os_list = OrdemServico.objects.filter(cliente=cliente).order_by('-data_abertura')
        total_os = os_list.count()
        valor_total_os = sum(os.valor_total for os in os_list)
        
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'resumo': {
                'total_vendas_qtd': total_vendas,
                'total_vendas_valor': valor_total_vendas,
                'total_os_qtd': total_os,
                'total_os_valor': valor_total_os,
                'total_geral': valor_total_vendas + valor_total_os
            },
            'vendas': VendaListSerializer(vendas, many=True).data,
            'ordens_servico': OrdemServicoListSerializer(os_list, many=True).data,
        })
    
    @action(detail=True, methods=['get'])
    def contas_receber(self, request, pk=None):
        """
        Get customer receivables
        """
        cliente = self.get_object()
        
        # Import local
        from apps.financeiro.models import ContaReceber
        from apps.financeiro.serializers import ContaReceberSerializer
        from django.db.models import Sum
        from django.utils import timezone
        
        contas = ContaReceber.objects.filter(cliente=cliente).order_by('data_vencimento')
        
        # Calcular totais
        hoje = timezone.now().date()
        
        total_pendente = contas.filter(status='pendente').aggregate(
            total=Sum('valor_original')
        )['total'] or 0
        
        total_vencido = contas.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(
            total=Sum('valor_original')
        )['total'] or 0
        
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'resumo': {
                'total_pendente': total_pendente,
                'total_vencido': total_vencido
            },
            'contas': ContaReceberSerializer(contas, many=True).data,
        })


class FornecedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Fornecedor
    """
    queryset = Fornecedor.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['razao_social', 'nome_fantasia', 'cnpj', 'email', 'telefone_principal']
    ordering_fields = ['razao_social', 'created_at']
    filterset_fields = ['active', 'cidade', 'estado']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FornecedorListSerializer
        return FornecedorSerializer
    
    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """
        Get supplier purchase history
        """
        fornecedor = self.get_object()
        
        # Import local
        from apps.compras.models import PedidoCompra
        from apps.compras.serializers import PedidoCompraListSerializer
        
        pedidos = PedidoCompra.objects.filter(fornecedor=fornecedor).order_by('-data_pedido')
        total_compras = pedidos.count()
        valor_total = sum(p.valor_total for p in pedidos)
        
        return Response({
            'fornecedor': FornecedorSerializer(fornecedor).data,
            'resumo': {
                'total_pedidos': total_compras,
                'valor_total': valor_total
            },
            'pedidos': PedidoCompraListSerializer(pedidos, many=True).data,
        })
    
    @action(detail=True, methods=['get'])
    def contas_pagar(self, request, pk=None):
        """
        Get supplier payables
        """
        fornecedor = self.get_object()
        
        # Import local
        from apps.financeiro.models import ContaPagar
        from apps.financeiro.serializers import ContaPagarSerializer
        from django.db.models import Sum
        from django.utils import timezone
        
        contas = ContaPagar.objects.filter(fornecedor=fornecedor).order_by('data_vencimento')
        
        # Calcular totais
        hoje = timezone.now().date()
        
        total_pendente = contas.filter(status='pendente').aggregate(
            total=Sum('valor_original')
        )['total'] or 0
        
        total_vencido = contas.filter(
            status='pendente',
            data_vencimento__lt=hoje
        ).aggregate(
            total=Sum('valor_original')
        )['total'] or 0
        
        return Response({
            'fornecedor': FornecedorSerializer(fornecedor).data,
            'resumo': {
                'total_pendente': total_pendente,
                'total_vencido': total_vencido
            },
            'contas': ContaPagarSerializer(contas, many=True).data,
        })


class ProdutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Produto
    """
    queryset = Produto.objects.select_related('categoria').all()
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'descricao', 'codigo_interno', 'codigo_barras']
    ordering_fields = ['nome', 'preco_venda', 'estoque_atual', 'created_at']
    filterset_fields = ['tipo', 'categoria', 'active']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProdutoListSerializer
        return ProdutoSerializer
    
    @action(detail=False, methods=['get'])
    def baixo_estoque(self, request):
        """
        Get products with low stock
        """
        produtos = self.queryset.filter(
            tipo='produto',
            active=True,
            estoque_atual__lt=models.F('estoque_minimo')
        )
        
        serializer = ProdutoListSerializer(produtos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def movimentacoes(self, request, pk=None):
        """
        Get product stock movements
        """
        produto = self.get_object()
        
        # Import local
        from apps.estoque.models import MovimentacaoEstoque
        from apps.estoque.serializers import MovimentacaoEstoqueSerializer
        
        movimentacoes = MovimentacaoEstoque.objects.filter(produto=produto).order_by('-data_movimentacao')
        
        return Response({
            'produto': ProdutoSerializer(produto).data,
            'movimentacoes': MovimentacaoEstoqueSerializer(movimentacoes, many=True).data,
        })
    
    @action(detail=False, methods=['post'])
    def importar(self, request):
        """
        Import products from CSV/Excel
        """
        serializer = ProdutoImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        
        # TODO: Implementar lógica de importação
        # - Ler arquivo CSV/Excel
        # - Validar dados
        # - Criar/atualizar produtos
        
        return Response({
            'message': 'Importação em desenvolvimento',
            'file': file.name
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
