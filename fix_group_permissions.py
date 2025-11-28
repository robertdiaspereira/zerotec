"""
Script para adicionar permissões de visualização de grupos aos perfis
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

def add_group_permissions():
    print("🔧 Adicionando permissões de grupos...")
    
    # Pegar permissões de Group
    group_content_type = ContentType.objects.get_for_model(Group)
    view_group_perm = Permission.objects.get(
        content_type=group_content_type,
        codename='view_group'
    )
    change_group_perm = Permission.objects.get(
        content_type=group_content_type,
        codename='change_group'
    )
    add_group_perm = Permission.objects.get(
        content_type=group_content_type,
        codename='add_group'
    )
    
    # Adicionar ao grupo Administrador
    try:
        admin_group = Group.objects.get(name='Administrador')
        admin_group.permissions.add(view_group_perm, change_group_perm, add_group_perm)
        print("   ✅ Permissões de grupos adicionadas ao Administrador")
    except Group.DoesNotExist:
        print("   ⚠️ Grupo 'Administrador' não encontrado")
    
    # Adicionar view_group aos outros grupos também (para que possam ver os perfis disponíveis)
    for group_name in ['Técnico', 'Vendedor']:
        try:
            group = Group.objects.get(name=group_name)
            group.permissions.add(view_group_perm)
            print(f"   ✅ Permissão view_group adicionada ao {group_name}")
        except Group.DoesNotExist:
            print(f"   ⚠️ Grupo '{group_name}' não encontrado")
    
    print("\n🎉 Permissões configuradas com sucesso!")

if __name__ == '__main__':
    add_group_permissions()
