"""
Vendas Models - Vendas, PDV e Formas de Pagamento
"""

from django.db import models
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Produto, Cliente

User = get_user_model()


class Venda(BaseModel):
    """
    Venda (Orçamento ou Venda Faturada)
    """
    TIPO_CHOICES = [
        ('orcamento', 'Orçamento'),
        ('venda', 'Venda'),
    ]
    
    STATUS_CHOICES = [
        ('orcamento', 'Orçamento'),
        ('aprovado', 'Aprovado'),
        ('faturado', 'Faturado'),
        ('entregue', 'Entregue'),
        ('cancelado', 'Cancelado'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES, default='venda')
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='vendas',
        verbose_name='Cliente',
        null=True,
        blank=True
    )
    data_venda = models.DateTimeField('Data da Venda', auto_now_add=True)
    data_entrega = models.DateField('Data de Entrega', null=True, blank=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='orcamento')
    
    # Valores
    valor_produtos = models.DecimalField(
        'Valor dos Produtos',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_desconto = models.DecimalField(
        'Valor do Desconto',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_acrescimo = models.DecimalField(
        'Valor do Acréscimo',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_total = models.DecimalField(
        'Valor Total',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Responsável
    vendedor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='vendas',
        verbose_name='Vendedor'
    )
    
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Venda'
        verbose_name_plural = 'Vendas'
        ordering = ['-data_venda']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['cliente', '-data_venda']),
            models.Index(fields=['status']),
            models.Index(fields=['-data_venda']),
        ]
    
    def __str__(self):
        cliente_nome = self.cliente.nome_razao_social if self.cliente else 'Sem cliente'
        return f'Venda {self.numero} - {cliente_nome}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = Venda.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'VD{proximo_id:06d}'
        
        # Calculate total
        self.valor_total = self.valor_produtos - self.valor_desconto + self.valor_acrescimo
        
        super().save(*args, **kwargs)
    
    @property
    def total_itens(self):
        """Total de itens na venda"""
        return self.itens.count()
    
    @property
    def total_recebido(self):
        """Total já recebido"""
        return sum(
            r.valor_bruto for r in self.recebimentos.filter(status='recebido')
        )
    
    @property
    def total_liquido_recebido(self):
        """Total líquido recebido (descontando taxas)"""
        return sum(
            r.valor_liquido for r in self.recebimentos.filter(status='recebido')
        )
    
    @property
    def saldo_pendente(self):
        """Saldo pendente de recebimento"""
        return Decimal(self.valor_total) - self.total_recebido


class ItemVenda(models.Model):
    """
    Item da Venda
    """
    venda = models.ForeignKey(
        Venda,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Venda'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_venda',
        verbose_name='Produto',
        null=True,
        blank=True
    )
    servico = models.ForeignKey(
        'erp.Servico',
        on_delete=models.PROTECT,
        related_name='itens_venda',
        verbose_name='Serviço',
        null=True,
        blank=True
    )
    quantidade = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0.001)]
    )
    preco_unitario = models.DecimalField(
        'Preço Unitário',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    preco_total = models.DecimalField(
        'Preço Total',
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
    acrescimo = models.DecimalField(
        'Acréscimo',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    class Meta:
        verbose_name = 'Item da Venda'
        verbose_name_plural = 'Itens da Venda'
        ordering = ['produto__nome', 'servico__nome']
    
    def __str__(self):
        nome = self.produto.nome if self.produto else (self.servico.nome if self.servico else 'Item desconhecido')
        return f'{nome} - Qtd: {self.quantidade}'
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.produto and not self.servico:
            raise ValidationError('Item deve ter um produto ou serviço vinculado.')
        if self.produto and self.servico:
            raise ValidationError('Item não pode ter produto e serviço simultaneamente.')
            
    def save(self, *args, **kwargs):
        """Calcula preço total"""
        self.preco_total = (self.quantidade * self.preco_unitario) - self.desconto + self.acrescimo
        super().save(*args, **kwargs)


class RecebimentoVenda(models.Model):
    """
    Recebimento da Venda
    Registra como o cliente pagou e as taxas aplicadas
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('recebido', 'Recebido'),
        ('cancelado', 'Cancelado'),
    ]
    
    venda = models.ForeignKey(
        Venda,
        on_delete=models.CASCADE,
        related_name='recebimentos',
        verbose_name='Venda'
    )
    forma_recebimento = models.ForeignKey(
        'financeiro.FormaRecebimento',
        on_delete=models.PROTECT,
        related_name='recebimentos_venda',
        verbose_name='Forma de Recebimento'
    )
    
    # Valores
    valor_bruto = models.DecimalField(
        'Valor Bruto',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Valor antes das taxas'
    )
    taxa_percentual = models.DecimalField(
        'Taxa Percentual (%)',
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text='Taxa aplicada pela operadora'
    )
    taxa_fixa = models.DecimalField(
        'Taxa Fixa (R$)',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_taxa_total = models.DecimalField(
        'Valor Total de Taxas',
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text='Soma de todas as taxas'
    )
    valor_liquido = models.DecimalField(
        'Valor Líquido',
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text='Valor que realmente entra no caixa'
    )
    
    # Parcelamento
    parcelas = models.IntegerField('Parcelas', default=1, validators=[MinValueValidator(1)])
    
    # Datas
    data_vencimento = models.DateField('Data de Vencimento', null=True, blank=True)
    data_recebimento = models.DateField('Data de Recebimento', null=True, blank=True)
    data_prevista_recebimento = models.DateField(
        'Data Prevista de Recebimento',
        null=True,
        blank=True,
        help_text='Calculada com base nos dias de recebimento da forma'
    )
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Recebimento da Venda'
        verbose_name_plural = 'Recebimentos das Vendas'
        ordering = ['-data_vencimento']
    
    def __str__(self):
        return f'{self.forma_recebimento.nome} - R$ {self.valor_bruto} (Líquido: R$ {self.valor_liquido})'
    
    def save(self, *args, **kwargs):
        """Calcula taxas e valor líquido automaticamente"""
        if self.forma_recebimento:
            # Calcular taxas usando o método do FormaRecebimento
            taxa_total, valor_liquido = self.forma_recebimento.calcular_taxa(
                self.valor_bruto,
                self.parcelas
            )
            
            self.valor_taxa_total = taxa_total
            self.valor_liquido = valor_liquido
            
            # Armazenar as taxas aplicadas para histórico
            self.taxa_percentual = self.forma_recebimento.taxa_percentual
            self.taxa_fixa = self.forma_recebimento.taxa_fixa
            
            # Calcular data prevista de recebimento
            if self.data_vencimento and self.forma_recebimento.dias_recebimento:
                from datetime import timedelta
                self.data_prevista_recebimento = self.data_vencimento + timedelta(
                    days=self.forma_recebimento.dias_recebimento
                )
        
        super().save(*args, **kwargs)


# Manter compatibilidade com código antigo
FormaPagamento = RecebimentoVenda


class PDV(BaseModel):
    """
    PDV - Point of Sale (Caixa)
    """
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('fechado', 'Fechado'),
    ]
    
    numero_caixa = models.IntegerField('Número do Caixa', default=1)
    operador = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='caixas',
        verbose_name='Operador'
    )
    data_abertura = models.DateTimeField('Data de Abertura', auto_now_add=True)
    data_fechamento = models.DateTimeField('Data de Fechamento', null=True, blank=True)
    
    # Valores
    valor_inicial = models.DecimalField(
        'Valor Inicial',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_vendas = models.DecimalField(
        'Valor de Vendas',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_sangrias = models.DecimalField(
        'Valor de Sangrias',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_suprimentos = models.DecimalField(
        'Valor de Suprimentos',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_final = models.DecimalField(
        'Valor Final',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='aberto')
    
    class Meta:
        verbose_name = 'PDV'
        verbose_name_plural = 'PDVs'
        ordering = ['-data_abertura']
    
    def __str__(self):
        return f'Caixa {self.numero_caixa} - {self.operador.username} - {self.get_status_display()}'
    
    @property
    def total_movimentos(self):
        """Total de movimentos no caixa"""
        return self.movimentos.count()
    
    @property
    def saldo_calculado(self):
        """Saldo calculado do caixa"""
        return self.valor_inicial + self.valor_vendas + self.valor_suprimentos - self.valor_sangrias


class MovimentoPDV(models.Model):
    """
    Movimento do PDV (Venda, Sangria, Suprimento)
    """
    TIPO_CHOICES = [
        ('venda', 'Venda'),
        ('sangria', 'Sangria'),
        ('suprimento', 'Suprimento'),
    ]
    
    pdv = models.ForeignKey(
        PDV,
        on_delete=models.CASCADE,
        related_name='movimentos',
        verbose_name='PDV'
    )
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    valor = models.DecimalField(
        'Valor',
        max_digits=10,
        decimal_places=2
    )
    descricao = models.CharField('Descrição', max_length=200)
    data = models.DateTimeField('Data', auto_now_add=True)
    categoria_dre = models.ForeignKey(
        'financeiro.CategoriaDRE',
        on_delete=models.SET_NULL,
        related_name='movimentos_pdv',
        verbose_name='Categoria DRE',
        null=True,
        blank=True,
        help_text="Categoria para o relatório DRE"
    )
    
    class Meta:
        verbose_name = 'Movimento do PDV'
        verbose_name_plural = 'Movimentos do PDV'
        ordering = ['-data']
    
    def __str__(self):
        return f'{self.get_tipo_display()} - R$ {self.valor}'
