from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'empresa', EmpresaViewSet, basename='empresa')
router.register(r'logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = [
    path('', include(router.urls)),
]
