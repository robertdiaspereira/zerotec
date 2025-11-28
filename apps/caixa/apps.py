"""
Caixa App Configuration
"""

from django.apps import AppConfig


class CaixaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.caixa'
    verbose_name = 'Gestão de Caixa'
