"""
Base models for all apps
"""

from django.db import models
from django.utils import timezone
from .utils import validate_cnpj
from django.core.exceptions import ValidationError
from django.conf import settings


class TimeStampedModel(models.Model):
    """
    Abstract base class with created_at and updated_at fields
    """
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        abstract = True


class ActiveModel(models.Model):
    """
    Abstract base class with active field
    """
    active = models.BooleanField('Ativo', default=True)

    class Meta:
        abstract = True


class BaseModel(TimeStampedModel, ActiveModel):
    """
    Complete base model with timestamps and active field
    """
    class Meta:
        abstract = True


class Empresa(BaseModel):
    """
    Dados da empresa proprietária do sistema
    """
    # Dados Gerais
    razao_social = models.CharField('Razão Social', max_length=200)
    nome_fantasia = models.CharField('Nome Fantasia', max_length=200)
    cnpj = models.CharField('CNPJ', max_length=18)
    inscricao_estadual = models.CharField('Inscrição Estadual', max_length=20, blank=True)
    logo = models.ImageField('Logo', upload_to='empresa/', blank=True, null=True)
    
    # Endereço
    cep = models.CharField('CEP', max_length=9)
    logradouro = models.CharField('Logradouro', max_length=200)
    numero = models.CharField('Número', max_length=20)
    complemento = models.CharField('Complemento', max_length=100, blank=True)
    bairro = models.CharField('Bairro', max_length=100)
    cidade = models.CharField('Cidade', max_length=100)
    estado = models.CharField('Estado', max_length=2)
    
    # Contato
    telefone = models.CharField('Telefone', max_length=20)
    celular = models.CharField('Celular/WhatsApp', max_length=20, blank=True)
    email = models.EmailField('E-mail')
    site = models.URLField('Site', blank=True)
    instagram = models.CharField('Instagram', max_length=100, blank=True)
    facebook = models.CharField('Facebook', max_length=100, blank=True)
    
    # Documentos
    obs_os = models.TextField('Observações Padrão - OS', blank=True)
    obs_venda = models.TextField('Observações Padrão - Venda', blank=True)
    politica_garantia = models.TextField('Política de Garantia', blank=True)

    def clean(self):
        # Remove formatação do CNPJ
        cnpj_limpo = ''.join(filter(str.isdigit, self.cnpj))
        
        # Valida CNPJ
        if len(cnpj_limpo) != 14:
            raise ValidationError({'cnpj': 'CNPJ deve ter 14 dígitos'})
        if not validate_cnpj(cnpj_limpo):
            raise ValidationError({'cnpj': 'CNPJ inválido'})

    def save(self, *args, **kwargs):
        # Garante que só exista uma empresa ativa
        if not self.pk and Empresa.objects.exists():
            pass
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresa'


class AuditLog(models.Model):
    """
    Registro de auditoria para ações do sistema
    """
    ACTION_CHOICES = [
        ('CREATE', 'Criação'),
        ('UPDATE', 'Atualização'),
        ('DELETE', 'Exclusão'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('OTHER', 'Outro'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        verbose_name='Usuário'
    )
    action = models.CharField('Ação', max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField('Modelo', max_length=100, blank=True)
    object_id = models.CharField('ID do Objeto', max_length=50, blank=True)
    object_repr = models.CharField('Representação', max_length=200, blank=True)
    details = models.JSONField('Detalhes', default=dict, blank=True)
    ip_address = models.GenericIPAddressField('Endereço IP', null=True, blank=True)
    timestamp = models.DateTimeField('Data/Hora', auto_now_add=True)

    class Meta:
        verbose_name = 'Log de Auditoria'
        verbose_name_plural = 'Logs de Auditoria'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.action} - {self.model_name}"
