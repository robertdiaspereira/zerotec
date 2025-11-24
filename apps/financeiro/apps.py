from django.apps import AppConfig


class FinanceiroConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.financeiro'
    verbose_name = 'Financeiro'
    
    def ready(self):
        import apps.financeiro.signals
