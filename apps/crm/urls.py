"""
URL patterns for CRM app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'crm'

router = DefaultRouter()
router.register(r'funis', views.FunilViewSet, basename='funil')
router.register(r'etapas', views.EtapaFunilViewSet, basename='etapa')
router.register(r'oportunidades', views.OportunidadeViewSet, basename='oportunidade')
router.register(r'atividades', views.AtividadeViewSet, basename='atividade')
router.register(r'interacoes', views.InteracaoViewSet, basename='interacao')

urlpatterns = [
    path('', include(router.urls)),
]
