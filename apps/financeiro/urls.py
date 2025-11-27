"""
URL patterns for Financeiro app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'financeiro'

router = DefaultRouter()
router.register(r'categorias', views.CategoriaFinanceiraViewSet, basename='categoria')
router.register(r'contas-bancarias', views.ContaBancariaViewSet, basename='conta-bancaria')
router.register(r'contas-pagar', views.ContaPagarViewSet, basename='conta-pagar')
router.register(r'contas-receber', views.ContaReceberViewSet, basename='conta-receber')
router.register(r'fluxo-caixa', views.FluxoCaixaViewSet, basename='fluxo-caixa')
router.register(r'formas-recebimento', views.FormaRecebimentoViewSet, basename='forma-recebimento')
router.register(r'formas-pagamento', views.FormaPagamentoViewSet, basename='forma-pagamento')  # Compatibilidade
router.register(r'pagamentos', views.PagamentoViewSet)
router.register(r'parcelas', views.ParcelaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
