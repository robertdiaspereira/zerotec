from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import AuditLog
from .middleware import get_current_user
import json
from django.core.serializers.json import DjangoJSONEncoder

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def serialize_instance(instance):
    try:
        # Tenta converter para dict simples
        data = model_to_dict(instance)
        # Remove campos binários ou complexos se necessário
        for key, value in data.items():
            if hasattr(value, 'read'): # File-like
                data[key] = str(value)
        # Serializa para JSON para garantir compatibilidade
        return json.loads(json.dumps(data, cls=DjangoJSONEncoder))
    except Exception:
        return str(instance)

@receiver(post_save)
def log_create_update(sender, instance, created, **kwargs):
    # Ignora o próprio AuditLog e modelos internos do Django que não queremos logar
    if sender._meta.model_name == 'auditlog' or sender._meta.app_label in ['sessions', 'admin', 'contenttypes']:
        return

    user = get_current_user()
    
    # Se não tem usuário (ex: script rodando), pode optar por não logar ou logar como Sistema
    # Vamos logar apenas se tiver usuário para evitar flood de logs de sistema
    if not user:
        return

    action = 'CREATE' if created else 'UPDATE'
    
    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=sender._meta.verbose_name,
            object_id=str(instance.pk),
            object_repr=str(instance),
            details={'data': serialize_instance(instance)}
        )
    except Exception as e:
        print(f"Erro ao criar log de auditoria: {e}")

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender._meta.model_name == 'auditlog' or sender._meta.app_label in ['sessions', 'admin', 'contenttypes']:
        return

    user = get_current_user()
    if not user:
        return

    try:
        AuditLog.objects.create(
            user=user,
            action='DELETE',
            model_name=sender._meta.verbose_name,
            object_id=str(instance.pk),
            object_repr=str(instance),
            details={'data': serialize_instance(instance)}
        )
    except Exception as e:
        print(f"Erro ao criar log de auditoria: {e}")
