"""
Main URL Configuration for Sistema OS
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/erp/', include('apps.erp.urls')),
    path('api/estoque/', include('apps.estoque.urls')),
    path('api/compras/', include('apps.compras.urls')),
    path('api/vendas/', include('apps.vendas.urls')),
    path('api/os/', include('apps.assistencia.urls')),
    path('api/financeiro/', include('apps.financeiro.urls')),
    path('api/crm/', include('apps.crm.urls')),
    path('api/relatorios/', include('apps.relatorios.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),  # Fase 2
    path('api/forum/', include('apps.forum.urls')),  # Fase 3
    path('api/webhooks/', include('apps.integrations.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
