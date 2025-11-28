"""
Script para verificar e corrigir permissões do usuário admin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

def check_and_fix_admin():
    print("🔍 Verificando usuário admin...")
    
    try:
        admin_user = User.objects.get(username='admin')
        print(f"   ✅ Usuário 'admin' encontrado (ID: {admin_user.id})")
        
        # Verificar grupos
        user_groups = admin_user.groups.all()
        print(f"   📋 Grupos do admin: {[g.name for g in user_groups]}")
        
        # Verificar se está no grupo Administrador
        admin_group = Group.objects.get(name='Administrador')
        if admin_group not in user_groups:
            print("   ⚠️ Admin NÃO está no grupo Administrador. Adicionando...")
            admin_user.groups.add(admin_group)
            print("   ✅ Admin adicionado ao grupo Administrador")
        else:
            print("   ✅ Admin já está no grupo Administrador")
        
        # Verificar permissões do grupo
        group_perms = admin_group.permissions.all()
        print(f"\n   📋 Permissões do grupo Administrador:")
        for perm in group_perms:
            print(f"      - {perm.codename}")
        
        # Verificar se tem view_group
        group_ct = ContentType.objects.get_for_model(Group)
        view_group = Permission.objects.get(content_type=group_ct, codename='view_group')
        
        if view_group not in group_perms:
            print("\n   ⚠️ Grupo Administrador NÃO tem permissão view_group!")
            admin_group.permissions.add(view_group)
            print("   ✅ Permissão view_group adicionada")
        else:
            print("\n   ✅ Grupo Administrador tem permissão view_group")
        
        # Tornar admin superuser para garantir acesso total
        if not admin_user.is_superuser:
            print("\n   ⚠️ Admin não é superuser. Tornando superuser...")
            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.save()
            print("   ✅ Admin agora é superuser")
        else:
            print("\n   ✅ Admin já é superuser")
        
        print("\n🎉 Verificação concluída!")
        
    except User.DoesNotExist:
        print("   ❌ Usuário 'admin' não encontrado!")
    except Group.DoesNotExist:
        print("   ❌ Grupo 'Administrador' não encontrado!")

if __name__ == '__main__':
    check_and_fix_admin()
