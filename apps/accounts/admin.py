"""
Admin configuration for accounts app
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Tenant, Domain, User


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'schema_name', 'cnpj', 'plano', 'active', 'created_at']
    list_filter = ['plano', 'active', 'created_at']
    search_fields = ['name', 'cnpj', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'tenant', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['domain', 'tenant__name']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'tenant', 'is_superadmin', 'is_active']
    list_filter = ['is_superadmin', 'is_staff', 'is_active', 'tenant']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Tenant', {'fields': ('tenant', 'is_superadmin')}),
        ('Contato', {'fields': ('phone',)}),
        ('Permissões do Sistema', {
            'fields': (
                'can_manage_os',
                'can_manage_vendas',
                'can_manage_compras',
                'can_manage_financeiro',
                'can_view_relatorios',
            )
        }),
    )
