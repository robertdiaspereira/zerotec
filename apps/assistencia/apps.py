from django.apps import AppConfig


class AssistenciaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.assistencia'
    verbose_name = 'Assistência Técnica'
    
    def ready(self):
        import apps.assistencia.signals
