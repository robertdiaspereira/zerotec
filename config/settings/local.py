"""
Local Development Settings (SQLite - Windows)
Use este arquivo para desenvolvimento local sem PostgreSQL/Redis
"""

from .base import *

DEBUG = True

# SQLite Database (sem necessidade de PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Desabilitar multi-tenancy para desenvolvimento local
# (Será habilitado na VPS com PostgreSQL)
INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'django_tenants']
MIDDLEWARE = [m for m in MIDDLEWARE if 'django_tenants' not in m]

# Database Router - remover
DATABASE_ROUTERS = []

# Desabilitar Celery para desenvolvimento local
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Email - Console backend (mostra emails no terminal)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Debug Toolbar
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']

# CORS - Permitir localhost
CORS_ALLOW_ALL_ORIGINS = True

# REST Framework - Desabilitar autenticação para teste local
# REST Framework - Configuração Local
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Internacionalização - PT-BR
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static/Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Logging simplificado
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Customização do Admin - Esconder apps do Celery
# (Eles ainda funcionam em background, só não aparecem no admin)
def hide_celery_models():
    """Esconde models do Celery do admin para interface mais limpa"""
    from django.contrib import admin
    try:
        # Remover models do django-celery-beat
        from django_celery_beat.models import (
            PeriodicTask, IntervalSchedule, CrontabSchedule,
            SolarSchedule, ClockedSchedule
        )
        admin.site.unregister(PeriodicTask)
        admin.site.unregister(IntervalSchedule)
        admin.site.unregister(CrontabSchedule)
        admin.site.unregister(SolarSchedule)
        admin.site.unregister(ClockedSchedule)
    except:
        pass
    
    try:
        # Remover models do django-celery-results
        from django_celery_results.models import TaskResult, GroupResult
        admin.site.unregister(TaskResult)
        admin.site.unregister(GroupResult)
    except:
        pass

# Executar após Django carregar
import django
if django.VERSION >= (3, 2):
    # Django 3.2+ usa AppConfig.ready()
    pass
else:
    hide_celery_models()

print("Usando configuracao LOCAL (SQLite)")
print("Database: SQLite (db.sqlite3)")
print("Multi-tenancy: DESABILITADO")
print("Celery: DESABILITADO")

