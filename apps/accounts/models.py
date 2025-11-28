"""
Multi-tenancy and User models
"""

from django.db import models
from django.contrib.auth.models import AbstractUser, Group
from django_tenants.models import TenantMixin, DomainMixin
from apps.core.models import TimeStampedModel


class Tenant(TenantMixin, TimeStampedModel):
    """
    Tenant model - Each client has their own schema
    """
    PLANO_CHOICES = [
        ('free', 'Gratuito'),
        ('basic', 'Básico'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise'),
    ]
    
    name = models.CharField('Nome da Empresa', max_length=200)
    cnpj = models.CharField('CNPJ', max_length=18, unique=True, null=True, blank=True)
    phone = models.CharField('Telefone', max_length=20, blank=True)
    email = models.EmailField('E-mail', blank=True)
    
    # Plano e status
    plano = models.CharField('Plano', max_length=20, choices=PLANO_CHOICES, default='free')
    active = models.BooleanField('Ativo', default=True)
    trial_end_date = models.DateField('Fim do Trial', null=True, blank=True)
    
    # Configurações n8n (apenas super admin pode ver)
    n8n_webhook_url = models.URLField('Webhook n8n', blank=True)
    n8n_api_key = models.CharField('API Key n8n', max_length=255, blank=True)
    
    # Auto-created fields by TenantMixin:
    # - schema_name
    # - auto_create_schema
    # - auto_drop_schema
    
    class Meta:
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
    
    def __str__(self):
        return self.name


class Domain(DomainMixin):
    """
    Domain model for tenants
    """
    pass


class User(AbstractUser):
    """
    Custom User model
    """
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='users',
        verbose_name='Tenant',
        null=True,
        blank=True
    )
    
    phone = models.CharField('Telefone', max_length=20, blank=True)
    is_superadmin = models.BooleanField('Super Administrador', default=False)
    
    # Permissões específicas do sistema
    can_manage_os = models.BooleanField('Gerenciar OS', default=True)
    can_manage_vendas = models.BooleanField('Gerenciar Vendas', default=True)
    can_manage_compras = models.BooleanField('Gerenciar Compras', default=False)
    can_manage_financeiro = models.BooleanField('Gerenciar Financeiro', default=False)
    can_view_relatorios = models.BooleanField('Ver Relatórios', default=True)
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return f'{self.get_full_name() or self.username} ({self.tenant})'
    
    @property
    def is_tenant_admin(self):
        """Check if user is admin of their tenant"""
        return self.is_staff or self.is_superadmin


class GroupProfile(models.Model):
    """
    Extensão do modelo Group para incluir permissões customizadas
    """
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name='profile')
    
    # Permissões específicas do sistema (mesmas do User)
    can_manage_os = models.BooleanField('Gerenciar OS', default=False)
    can_manage_vendas = models.BooleanField('Gerenciar Vendas', default=False)
    can_manage_compras = models.BooleanField('Gerenciar Compras', default=False)
    can_manage_financeiro = models.BooleanField('Gerenciar Financeiro', default=False)
    can_view_relatorios = models.BooleanField('Ver Relatórios', default=False)
    
    def __str__(self):
        return f'Profile for {self.group.name}'
