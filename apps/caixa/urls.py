"""
URL patterns for Caixa app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'caixa'

router = DefaultRouter()
router.register(r'caixa', views.CaixaViewSet, basename='caixa')

urlpatterns = [
    path('', include(router.urls)),
]
