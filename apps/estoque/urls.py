"""
URL patterns for Estoque app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'estoque'

router = DefaultRouter()
router.register(r'movimentacoes', views.MovimentacaoEstoqueViewSet, basename='movimentacao')
router.register(r'lotes', views.LoteViewSet, basename='lote')
router.register(r'inventarios', views.InventarioViewSet, basename='inventario')

urlpatterns = [
    path('', include(router.urls)),
    
    # Stock operations
    path('entrada/', views.EstoqueViewSet.as_view({'post': 'entrada'}), name='entrada'),
    path('saida/', views.EstoqueViewSet.as_view({'post': 'saida'}), name='saida'),
    path('ajuste/', views.EstoqueViewSet.as_view({'post': 'ajuste'}), name='ajuste'),
    path('transferencia/', views.EstoqueViewSet.as_view({'post': 'transferencia'}), name='transferencia'),
    path('posicao/', views.EstoqueViewSet.as_view({'get': 'posicao'}), name='posicao'),
    path('alertas/', views.EstoqueViewSet.as_view({'get': 'alertas'}), name='alertas'),
]
