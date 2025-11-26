"""
Views for Assistencia models
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import (
    OrdemServico, PecaOS, OrcamentoOS, HistoricoOS,
    ServicoTemplate, ChecklistItem, TermoGarantia, OSAnexo, CategoriaServico
)
from .serializers import (
    OrdemServicoSerializer, OrdemServicoListSerializer,
    PecaOSSerializer, OrcamentoOSSerializer, HistoricoOSSerializer,
    ServicoTemplateSerializer, ChecklistItemSerializer,
    TermoGarantiaSerializer, OSAnexoSerializer, CategoriaServicoSerializer
)


class OrdemServicoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for OrdemServico
    """
    queryset = OrdemServico.objects.select_related('cliente', 'tecnico').prefetch_related(
        'pecas', 'orcamentos', 'historico'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = [
        'numero', 'cliente__nome_razao_social', 'equipamento',
        'marca', 'modelo', 'numero_serie', 'defeito_relatado'
    ]
    ordering_fields = ['data_abertura', 'data_previsao', 'valor_total', 'prioridade']
    filterset_fields = ['status', 'prioridade', 'cliente', 'tecnico']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrdemServicoListSerializer
        return OrdemServicoSerializer
    
    @action(detail=True, methods=['post'])
    def iniciar_diagnostico(self, request, pk=None):
        """Start diagnosis"""
        os = self.get_object()
        
        if os.status != 'aberta':
            return Response({
                'error': 'OS não está aberta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        os.status = 'em_diagnostico'
        os.save()
        
        return Response({
            'message': 'Diagnóstico iniciado',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['post'])
    def finalizar_diagnostico(self, request, pk=None):
        """Finish diagnosis and create budget"""
        os = self.get_object()
        
        if os.status != 'em_diagnostico':
            return Response({
                'error': 'OS não está em diagnóstico'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        diagnostico = request.data.get('diagnostico')
        solucao = request.data.get('solucao')
        
        os.diagnostico = diagnostico
        os.solucao = solucao
        os.status = 'orcamento'
        os.save()
        
        return Response({
            'message': 'Diagnóstico finalizado',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['post'])
    def criar_orcamento(self, request, pk=None):
        """Create budget"""
        os = self.get_object()
        
        orcamento_data = request.data
        orcamento_data['os'] = os.id
        
        serializer = OrcamentoOSSerializer(data=orcamento_data)
        serializer.is_valid(raise_exception=True)
        orcamento = serializer.save()
        
        return Response(OrcamentoOSSerializer(orcamento).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def aprovar_orcamento(self, request, pk=None):
        """Approve budget"""
        os = self.get_object()
        orcamento_id = request.data.get('orcamento_id')
        
        try:
            orcamento = os.orcamentos.get(id=orcamento_id)
        except OrcamentoOS.DoesNotExist:
            return Response({
                'error': 'Orçamento não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        orcamento.status = 'aprovado'
        orcamento.data_aprovacao = timezone.now()
        orcamento.save()
        
        return Response({
            'message': 'Orçamento aprovado',
            'orcamento': OrcamentoOSSerializer(orcamento).data
        })
    
    @action(detail=True, methods=['post'])
    def iniciar_execucao(self, request, pk=None):
        """Start service execution"""
        os = self.get_object()
        
        if os.status != 'aprovada':
            return Response({
                'error': 'OS não está aprovada'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        os.status = 'em_execucao'
        os.save()
        
        return Response({
            'message': 'Execução iniciada',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['post'])
    def adicionar_peca(self, request, pk=None):
        """Add part to service order"""
        os = self.get_object()
        
        peca_data = request.data
        peca_data['os'] = os.id
        
        serializer = PecaOSSerializer(data=peca_data)
        serializer.is_valid(raise_exception=True)
        peca = serializer.save()
        
        return Response(PecaOSSerializer(peca).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def aplicar_peca(self, request, pk=None):
        """Mark part as applied"""
        os = self.get_object()
        peca_id = request.data.get('peca_id')
        
        try:
            peca = os.pecas.get(id=peca_id)
        except PecaOS.DoesNotExist:
            return Response({
                'error': 'Peça não encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check stock
        if peca.produto.estoque_atual < peca.quantidade:
            return Response({
                'error': f'Estoque insuficiente. Disponível: {peca.produto.estoque_atual}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        peca.aplicada = True
        peca.save()
        
        return Response({
            'message': 'Peça aplicada com sucesso',
            'peca': PecaOSSerializer(peca).data
        })
    
    @action(detail=True, methods=['post'])
    def concluir(self, request, pk=None):
        """Finish service order"""
        os = self.get_object()
        
        if os.status not in ['em_execucao', 'aguardando_peca']:
            return Response({
                'error': 'OS não pode ser concluída neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        os.status = 'concluida'
        os.data_conclusao = timezone.now()
        os.save()
        
        return Response({
            'message': 'OS concluída com sucesso',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['post'])
    def entregar(self, request, pk=None):
        """Deliver service order to customer"""
        os = self.get_object()
        
        if os.status != 'concluida':
            return Response({
                'error': 'OS não está concluída'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        os.status = 'entregue'
        os.data_entrega = timezone.now()
        os.save()
        
        return Response({
            'message': 'OS entregue ao cliente',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancel service order"""
        os = self.get_object()
        
        if os.status in ['concluida', 'entregue', 'cancelada']:
            return Response({
                'error': 'OS não pode ser cancelada neste status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        motivo = request.data.get('motivo', 'Cancelamento solicitado')
        
        os.status = 'cancelada'
        os.save()
        
        # Register in history
        HistoricoOS.objects.create(
            os=os,
            usuario=request.user,
            acao='OS Cancelada',
            descricao=motivo
        )
        
        return Response({
            'message': 'OS cancelada',
            'os': OrdemServicoSerializer(os).data
        })
    
    @action(detail=True, methods=['get'])
    def imprimir(self, request, pk=None):
        """Generate service order PDF"""
        os = self.get_object()
        
        # TODO: Implement PDF generation
        return Response({
            'message': 'Geração de PDF em desenvolvimento',
            'os': OrdemServicoSerializer(os).data
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    @action(detail=False, methods=['get'])
    def em_aberto(self, request):
        """Get open service orders"""
        os_abertas = self.queryset.exclude(
            status__in=['concluida', 'entregue', 'cancelada']
        )
        
        serializer = OrdemServicoListSerializer(os_abertas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def atrasadas(self, request):
        """Get overdue service orders"""
        hoje = timezone.now().date()
        
        os_atrasadas = self.queryset.filter(
            data_previsao__lt=hoje,
            status__in=['aberta', 'em_diagnostico', 'orcamento', 'aprovada', 'em_execucao', 'aguardando_peca']
        )
        
        serializer = OrdemServicoListSerializer(os_atrasadas, many=True)
        return Response(serializer.data)



class CategoriaServicoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaServico.objects.all()
    serializer_class = CategoriaServicoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome']


class ServicoTemplateViewSet(viewsets.ModelViewSet):
    queryset = ServicoTemplate.objects.select_related('categoria').all()
    serializer_class = ServicoTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['codigo', 'descricao']
    ordering_fields = ['descricao', 'valor_padrao']
    filterset_fields = ['categoria', 'ativo']


class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['ordem', 'label']


class TermoGarantiaViewSet(viewsets.ModelViewSet):
    queryset = TermoGarantia.objects.all()
    serializer_class = TermoGarantiaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['titulo', 'conteudo']
    filterset_fields = ['tipo', 'ativo', 'padrao']


class OSAnexoViewSet(viewsets.ModelViewSet):
    queryset = OSAnexo.objects.all()
    serializer_class = OSAnexoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['descricao']
    filterset_fields = ['ordem_servico', 'tipo']
