"""
Financeiro Models - Contas a Pagar, Contas a Receber, Fluxo de Caixa
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Cliente, Fornecedor

User = get_user_model()


class CategoriaFinanceira(BaseModel):
    """
    Categoria Financeira (Receitas e Despesas)
    """
    TIPO_CHOICES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]
    
    nome = models.CharField('Nome', max_length=100)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES)
    descricao = models.TextField('Descrição', blank=True)
    
    class Meta:
        verbose_name = 'Categoria Financeira'
        verbose_name_plural = 'Categorias Financeiras'
        ordering = ['tipo', 'nome']
    
    def __str__(self):
        return f'{self.nome} ({self.get_tipo_display()})'


class ContaBancaria(BaseModel):
    """
    Conta Bancária
    """
    banco = models.CharField('Banco', max_length=100)
    agencia = models.CharField('Agência', max_length=20)
    conta = models.CharField('Conta', max_length=20)
    tipo_conta = models.CharField('Tipo de Conta', max_length=50, default='Conta Corrente')
    saldo_inicial = models.DecimalField(
        'Saldo Inicial',
        max_digits=15,
        decimal_places=2,
        default=0
    )
    saldo_atual = models.DecimalField(
        'Saldo Atual',
        max_digits=15,
        decimal_places=2,
        default=0
    )
    
    class Meta:
        verbose_name = 'Conta Bancária'
        verbose_name_plural = 'Contas Bancárias'
        ordering = ['banco', 'agencia']
    
    def __str__(self):
        return f'{self.banco} - Ag: {self.agencia} - Cc: {self.conta}'


class ContaPagar(BaseModel):
    """
    Conta a Pagar
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('pago', 'Pago'),
        ('cancelado', 'Cancelado'),
        ('atrasado', 'Atrasado'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.PROTECT,
        related_name='contas_pagar',
        verbose_name='Fornecedor',
        null=True,
        blank=True
    )
    categoria = models.ForeignKey(
        CategoriaFinanceira,
        on_delete=models.PROTECT,
        related_name='contas_pagar',
        verbose_name='Categoria',
        limit_choices_to={'tipo': 'despesa'}
    )
    descricao = models.CharField('Descrição', max_length=200)
    
    # Valores
    valor_original = models.DecimalField(
        'Valor Original',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    valor_pago = models.DecimalField(
        'Valor Pago',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    juros = models.DecimalField(
        'Juros',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    multa = models.DecimalField(
        'Multa',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    desconto = models.DecimalField(
        'Desconto',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Datas
    data_emissao = models.DateField('Data de Emissão')
    data_vencimento = models.DateField('Data de Vencimento')
    data_pagamento = models.DateField('Data de Pagamento', null=True, blank=True)
    
    # Pagamento
    conta_bancaria = models.ForeignKey(
        ContaBancaria,
        on_delete=models.PROTECT,
        related_name='contas_pagar',
        verbose_name='Conta Bancária',
        null=True,
        blank=True
    )
    forma_pagamento = models.CharField('Forma de Pagamento', max_length=50, blank=True)
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    observacoes = models.TextField('Observações', blank=True)
    
    # Documento
    numero_documento = models.CharField('Número do Documento', max_length=50, blank=True)
    
    class Meta:
        verbose_name = 'Conta a Pagar'
        verbose_name_plural = 'Contas a Pagar'
        ordering = ['-data_vencimento']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['fornecedor', '-data_vencimento']),
            models.Index(fields=['status']),
            models.Index(fields=['-data_vencimento']),
        ]
    
    def __str__(self):
        fornecedor_nome = self.fornecedor.razao_social if self.fornecedor else 'Sem fornecedor'
        return f'{self.numero} - {fornecedor_nome} - R$ {self.valor_total}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = ContaPagar.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'CP{proximo_id:06d}'
        
        super().save(*args, **kwargs)
    
    @property
    def valor_total(self):
        """Valor total com juros e multa"""
        return self.valor_original + self.juros + self.multa - self.desconto
    
    @property
    def saldo_pendente(self):
        """Saldo pendente de pagamento"""
        return self.valor_total - self.valor_pago
    
    @property
    def dias_atraso(self):
        """Dias de atraso"""
        from django.utils import timezone
        if self.status == 'pendente' and self.data_vencimento < timezone.now().date():
            delta = timezone.now().date() - self.data_vencimento
            return delta.days
        return 0


class ContaReceber(BaseModel):
    """
    Conta a Receber
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('recebido', 'Recebido'),
        ('cancelado', 'Cancelado'),
        ('atrasado', 'Atrasado'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='contas_receber',
        verbose_name='Cliente',
        null=True,
        blank=True
    )
    categoria = models.ForeignKey(
        CategoriaFinanceira,
        on_delete=models.PROTECT,
        related_name='contas_receber',
        verbose_name='Categoria',
        limit_choices_to={'tipo': 'receita'}
    )
    descricao = models.CharField('Descrição', max_length=200)
    
    # Valores
    valor_original = models.DecimalField(
        'Valor Original',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    valor_recebido = models.DecimalField(
        'Valor Recebido',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    juros = models.DecimalField(
        'Juros',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    multa = models.DecimalField(
        'Multa',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    desconto = models.DecimalField(
        'Desconto',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Datas
    data_emissao = models.DateField('Data de Emissão')
    data_vencimento = models.DateField('Data de Vencimento')
    data_recebimento = models.DateField('Data de Recebimento', null=True, blank=True)
    
    # Recebimento
    conta_bancaria = models.ForeignKey(
        ContaBancaria,
        on_delete=models.PROTECT,
        related_name='contas_receber',
        verbose_name='Conta Bancária',
        null=True,
        blank=True
    )
    forma_recebimento = models.CharField('Forma de Recebimento', max_length=50, blank=True)
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    observacoes = models.TextField('Observações', blank=True)
    
    # Documento
    numero_documento = models.CharField('Número do Documento', max_length=50, blank=True)
    
    class Meta:
        verbose_name = 'Conta a Receber'
        verbose_name_plural = 'Contas a Receber'
        ordering = ['-data_vencimento']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['cliente', '-data_vencimento']),
            models.Index(fields=['status']),
            models.Index(fields=['-data_vencimento']),
        ]
    
    def __str__(self):
        cliente_nome = self.cliente.nome_razao_social if self.cliente else 'Sem cliente'
        return f'{self.numero} - {cliente_nome} - R$ {self.valor_total}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = ContaReceber.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'CR{proximo_id:06d}'
        
        super().save(*args, **kwargs)
    
    @property
    def valor_total(self):
        """Valor total com juros e multa"""
        return self.valor_original + self.juros + self.multa - self.desconto
    
    @property
    def saldo_pendente(self):
        """Saldo pendente de recebimento"""
        return self.valor_total - self.valor_recebido
    
    @property
    def dias_atraso(self):
        """Dias de atraso"""
        from django.utils import timezone
        if self.status == 'pendente' and self.data_vencimento < timezone.now().date():
            delta = timezone.now().date() - self.data_vencimento
            return delta.days
        return 0


class FluxoCaixa(models.Model):
    """
    Fluxo de Caixa (Movimentações Financeiras)
    """
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]
    
    data = models.DateField('Data')
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES)
    categoria = models.ForeignKey(
        CategoriaFinanceira,
        on_delete=models.PROTECT,
        related_name='fluxo_caixa',
        verbose_name='Categoria'
    )
    descricao = models.CharField('Descrição', max_length=200)
    valor = models.DecimalField(
        'Valor',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    conta_bancaria = models.ForeignKey(
        ContaBancaria,
        on_delete=models.PROTECT,
        related_name='fluxo_caixa',
        verbose_name='Conta Bancária',
        null=True,
        blank=True
    )
    conta_pagar = models.ForeignKey(
        ContaPagar,
        on_delete=models.SET_NULL,
        related_name='fluxo_caixa',
        verbose_name='Conta a Pagar',
        null=True,
        blank=True
    )
    conta_receber = models.ForeignKey(
        ContaReceber,
        on_delete=models.SET_NULL,
        related_name='fluxo_caixa',
        verbose_name='Conta a Receber',
        null=True,
        blank=True
    )
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Fluxo de Caixa'
        verbose_name_plural = 'Fluxo de Caixa'
        ordering = ['-data']
    
    def __str__(self):
        return f'{self.data} - {self.get_tipo_display()} - R$ {self.valor}'


# Import DRE models
from .models_dre import CategoriaDRE

__all__ = [
    'CategoriaFinanceira',
    'ContaBancaria',
    'ContaPagar',
    'ContaReceber',
    'FluxoCaixa',
    'CategoriaDRE',
]

