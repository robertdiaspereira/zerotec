from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Empresa, AuditLog
from .serializers import EmpresaSerializer, AuditLogSerializer

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        Retorna a primeira empresa encontrada ou vazio.
        Ideal para o frontend que espera um objeto único.
        """
        empresa = Empresa.objects.first()
        if empresa:
            serializer = self.get_serializer(empresa)
            return Response(serializer.data)
        return Response({})

    @action(detail=False, methods=['post'])
    def setup(self, request):
        """
        Endpoint para criar ou atualizar a empresa única
        """
        empresa = Empresa.objects.first()
        if empresa:
            serializer = self.get_serializer(empresa, data=request.data, partial=True)
        else:
            serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualização de logs de auditoria
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'model_name', 'user']
    search_fields = ['object_repr', 'details', 'user__username']
    ordering_fields = ['timestamp']
