"""
URL patterns for Reports app
"""

from django.urls import path
from . import views

app_name = 'relatorios'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # Relatórios específicos
    path('vendas/', views.RelatorioVendasView.as_view(), name='vendas'),
    path('estoque/', views.RelatorioEstoqueView.as_view(), name='estoque'),
    path('financeiro/', views.RelatorioFinanceiroView.as_view(), name='financeiro'),
    path('os/', views.RelatorioOSView.as_view(), name='os'),
]
