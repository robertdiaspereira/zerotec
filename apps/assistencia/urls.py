"""
URL patterns for Assistencia app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'assistencia'

router = DefaultRouter()
router.register(r'os', views.OrdemServicoViewSet, basename='os')
router.register(r'ordens-servico', views.OrdemServicoViewSet, basename='ordem-servico')
router.register(r'categorias-servico', views.CategoriaServicoViewSet)
router.register(r'servicos-template', views.ServicoTemplateViewSet)
router.register(r'checklist-items', views.ChecklistItemViewSet)
router.register(r'termos-garantia', views.TermoGarantiaViewSet)
router.register(r'os-anexos', views.OSAnexoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
