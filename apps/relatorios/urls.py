"""
URL patterns for Reports app
"""

from django.urls import path
from . import views
from .views_dre import DREView, DREExportView

app_name = 'relatorios'

urlpatterns = [
    # Dashboard
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # DRE
    path('dre/', DREView.as_view(), name='dre'),
    path('dre/export/', DREExportView.as_view(), name='dre-export'),
    
    # Relatórios específicos
    path('vendas/', views.RelatorioVendasView.as_view(), name='vendas'),
    path('estoque/', views.RelatorioEstoqueView.as_view(), name='estoque'),
    path('financeiro/', views.RelatorioFinanceiroView.as_view(), name='financeiro'),
    path('os/', views.RelatorioOSView.as_view(), name='os'),
]

