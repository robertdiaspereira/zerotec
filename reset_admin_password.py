"""
Script para resetar senha do admin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_admin_password():
    try:
        admin = User.objects.get(username='admin')
        admin.set_password('123')
        admin.save()
        print("✅ Senha do admin resetada para '123'")
    except User.DoesNotExist:
        print("❌ Usuário admin não encontrado")

if __name__ == '__main__':
    reset_admin_password()
