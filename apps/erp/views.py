"""
Views for ERP models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'tipo', 'created_at']
    filterset_fields = ['tipo', 'active']


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Cliente
    """
    queryset = Cliente.objects.all()
    permission_classes = [IsAuthenticated]
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
        
        # TODO: Implementar quando os models de Venda e OS estiverem prontos
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'vendas': [],
            'ordens_servico': [],
            'total_vendas': cliente.total_vendas,
            'total_os': cliente.total_os,
        })
    
    @action(detail=True, methods=['get'])
    def contas_receber(self, request, pk=None):
        """
        Get customer receivables
        """
        cliente = self.get_object()
        
        # TODO: Implementar quando o model de ContaReceber estiver pronto
        return Response({
            'cliente': ClienteSerializer(cliente).data,
            'contas': [],
            'total_pendente': 0,
            'total_vencido': 0,
        })


class FornecedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Fornecedor
    """
    queryset = Fornecedor.objects.all()
    permission_classes = [IsAuthenticated]
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
        
        # TODO: Implementar quando o model de PedidoCompra estiver pronto
        return Response({
            'fornecedor': FornecedorSerializer(fornecedor).data,
            'pedidos': [],
            'total_compras': fornecedor.total_compras,
        })
    
    @action(detail=True, methods=['get'])
    def contas_pagar(self, request, pk=None):
        """
        Get supplier payables
        """
        fornecedor = self.get_object()
        
        # TODO: Implementar quando o model de ContaPagar estiver pronto
        return Response({
            'fornecedor': FornecedorSerializer(fornecedor).data,
            'contas': [],
            'total_pendente': 0,
            'total_vencido': 0,
        })


class ProdutoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Produto
    """
    queryset = Produto.objects.select_related('categoria').all()
    permission_classes = [IsAuthenticated]
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
        
        # TODO: Implementar quando o model de MovimentacaoEstoque estiver pronto
        return Response({
            'produto': ProdutoSerializer(produto).data,
            'movimentacoes': [],
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
