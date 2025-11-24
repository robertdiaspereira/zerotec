"""
URL patterns for Compras app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'compras'

router = DefaultRouter()
router.register(r'cotacoes', views.CotacaoViewSet, basename='cotacao')
router.register(r'pedidos', views.PedidoCompraViewSet, basename='pedido')
router.register(r'recebimentos', views.RecebimentoMercadoriaViewSet, basename='recebimento')

urlpatterns = [
    path('', include(router.urls)),
]
