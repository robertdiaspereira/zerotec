"""
URL patterns for Assistencia app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'assistencia'

router = DefaultRouter()
router.register(r'os', views.OrdemServicoViewSet, basename='os')

urlpatterns = [
    path('', include(router.urls)),
]
