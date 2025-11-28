import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth.models import Group

groups = ['Administrador', 'Técnico', 'Vendedor']

for group_name in groups:
    group, created = Group.objects.get_or_create(name=group_name)
    if created:
        print(f'Grupo "{group_name}" criado com sucesso.')
    else:
        print(f'Grupo "{group_name}" já existe.')
