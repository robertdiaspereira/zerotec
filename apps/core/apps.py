from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    
    def ready(self):
        """Executado quando o app está pronto"""
        import apps.core.signals  # noqa
        
        # Esconder models do Celery do admin
        from django.contrib import admin
        
        try:
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
            from django_celery_results.models import TaskResult, GroupResult
            admin.site.unregister(TaskResult)
            admin.site.unregister(GroupResult)
        except:
            pass
    verbose_name = 'Core'
