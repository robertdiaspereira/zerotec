"""
Script para criar grupos/perfis padrão no sistema
Executa: python create_default_groups.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

def create_default_groups():
    """Cria os 3 grupos padrão: Administrador, Técnico, Vendedor"""
    
    # 1. ADMINISTRADOR - Acesso total
    admin_group, created = Group.objects.get_or_create(name='Administrador')
    if created:
        print("✅ Grupo 'Administrador' criado")
        # Administrador tem todas as permissões
        all_permissions = Permission.objects.all()
        admin_group.permissions.set(all_permissions)
        print(f"   → {all_permissions.count()} permissões atribuídas")
    else:
        print("ℹ️  Grupo 'Administrador' já existe")
    
    # 2. TÉCNICO - Foco em OS e Estoque
    tecnico_group, created = Group.objects.get_or_create(name='Técnico')
    if created:
        print("✅ Grupo 'Técnico' criado")
        
        # Permissões para Técnico
        tecnico_permissions = []
        
        # OS - todas as permissões
        os_ct = ContentType.objects.filter(app_label='assistencia', model='ordemservico')
        if os_ct.exists():
            tecnico_permissions.extend(Permission.objects.filter(content_type=os_ct.first()))
        
        # Produtos - visualizar e editar estoque
        produto_ct = ContentType.objects.filter(app_label='estoque', model='produto')
        if produto_ct.exists():
            tecnico_permissions.extend(Permission.objects.filter(
                content_type=produto_ct.first(),
                codename__in=['view_produto', 'change_produto']
            ))
        
        # Clientes - visualizar e adicionar
        cliente_ct = ContentType.objects.filter(app_label='clientes', model='cliente')
        if cliente_ct.exists():
            tecnico_permissions.extend(Permission.objects.filter(
                content_type=cliente_ct.first(),
                codename__in=['view_cliente', 'add_cliente']
            ))
        
        # Movimentações de estoque
        mov_ct = ContentType.objects.filter(app_label='estoque', model='movimentacaoestoque')
        if mov_ct.exists():
            tecnico_permissions.extend(Permission.objects.filter(content_type=mov_ct.first()))
        
        tecnico_group.permissions.set(tecnico_permissions)
        print(f"   → {len(tecnico_permissions)} permissões atribuídas")
    else:
        print("ℹ️  Grupo 'Técnico' já existe")
    
    # 3. VENDEDOR - Foco em Vendas e Clientes
    vendedor_group, created = Group.objects.get_or_create(name='Vendedor')
    if created:
        print("✅ Grupo 'Vendedor' criado")
        
        # Permissões para Vendedor
        vendedor_permissions = []
        
        # Vendas - todas as permissões
        venda_ct = ContentType.objects.filter(app_label='vendas', model='venda')
        if venda_ct.exists():
            vendedor_permissions.extend(Permission.objects.filter(content_type=venda_ct.first()))
        
        # Clientes - todas as permissões
        cliente_ct = ContentType.objects.filter(app_label='clientes', model='cliente')
        if cliente_ct.exists():
            vendedor_permissions.extend(Permission.objects.filter(content_type=cliente_ct.first()))
        
        # Produtos - apenas visualizar
        produto_ct = ContentType.objects.filter(app_label='estoque', model='produto')
        if produto_ct.exists():
            vendedor_permissions.extend(Permission.objects.filter(
                content_type=produto_ct.first(),
                codename='view_produto'
            ))
        
        # Financeiro - visualizar contas a receber
        financeiro_ct = ContentType.objects.filter(app_label='financeiro', model='fluxocaixa')
        if financeiro_ct.exists():
            vendedor_permissions.extend(Permission.objects.filter(
                content_type=financeiro_ct.first(),
                codename__in=['view_fluxocaixa', 'add_fluxocaixa']
            ))
        
        vendedor_group.permissions.set(vendedor_permissions)
        print(f"   → {len(vendedor_permissions)} permissões atribuídas")
    else:
        print("ℹ️  Grupo 'Vendedor' já existe")
    
    print("\n✅ Grupos padrão configurados com sucesso!")
    print("\nGrupos disponíveis:")
    for group in Group.objects.all():
        print(f"  - {group.name} ({group.permissions.count()} permissões)")

if __name__ == '__main__':
    create_default_groups()
