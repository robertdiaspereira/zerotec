"""
URL patterns for ERP app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'erp'

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'clientes', views.ClienteViewSet, basename='cliente')
router.register(r'fornecedores', views.FornecedorViewSet, basename='fornecedor')
router.register(r'produtos', views.ProdutoViewSet, basename='produto')
router.register(r'servicos', views.ServicoViewSet, basename='servico')

urlpatterns = [
    path('', include(router.urls)),
]
