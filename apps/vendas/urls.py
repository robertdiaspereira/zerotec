"""
URL patterns for Vendas app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'vendas'

router = DefaultRouter()
router.register(r'vendas', views.VendaViewSet, basename='venda')
router.register(r'pdv', views.PDVViewSet, basename='pdv')

urlpatterns = [
    path('', include(router.urls)),
]
