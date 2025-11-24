"""
Estoque Models - Movimentações, Lotes e Inventário
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Produto, Fornecedor

User = get_user_model()


class MovimentacaoEstoque(BaseModel):
    """
    Movimentação de Estoque (Entrada, Saída, Ajuste, Transferência, Inventário)
    """
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
        ('ajuste', 'Ajuste'),
        ('transferencia', 'Transferência'),
        ('inventario', 'Inventário'),
    ]
    
    DOCUMENTO_CHOICES = [
        ('nota_fiscal', 'Nota Fiscal'),
        ('pedido', 'Pedido'),
        ('os', 'Ordem de Serviço'),
        ('venda', 'Venda'),
        ('ajuste_manual', 'Ajuste Manual'),
        ('inventario', 'Inventário'),
        ('transferencia', 'Transferência'),
    ]
    
    # Dados básicos
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='movimentacoes',
        verbose_name='Produto'
    )
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    quantidade = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)]
    )
    
    # Histórico de estoque
    quantidade_anterior = models.DecimalField(
        'Quantidade Anterior',
        max_digits=10,
        decimal_places=3,
        default=0
    )
    quantidade_nova = models.DecimalField(
        'Quantidade Nova',
        max_digits=10,
        decimal_places=3,
        default=0
    )
    
    # Valores
    valor_unitario = models.DecimalField(
        'Valor Unitário',
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
    
    # Motivo e documento
    motivo = models.CharField('Motivo', max_length=200, blank=True)
    documento = models.CharField('Tipo de Documento', max_length=20, choices=DOCUMENTO_CHOICES, blank=True)
    documento_numero = models.CharField('Número do Documento', max_length=50, blank=True)
    
    # Lote e validade
    lote = models.CharField('Lote', max_length=50, blank=True)
    data_validade = models.DateField('Data de Validade', null=True, blank=True)
    
    # Localização (para transferências)
    local_origem = models.CharField('Local de Origem', max_length=100, blank=True)
    local_destino = models.CharField('Local de Destino', max_length=100, blank=True)
    
    # Auditoria
    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='movimentacoes_estoque',
        verbose_name='Usuário'
    )
    data_movimentacao = models.DateTimeField('Data da Movimentação', auto_now_add=True)
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'
        ordering = ['-data_movimentacao']
        indexes = [
            models.Index(fields=['produto', '-data_movimentacao']),
            models.Index(fields=['tipo', '-data_movimentacao']),
            models.Index(fields=['-data_movimentacao']),
        ]
    
    def __str__(self):
        return f'{self.get_tipo_display()} - {self.produto.nome} - {self.quantidade}'
    
    def save(self, *args, **kwargs):
        """Calcula valor total"""
        self.valor_total = self.quantidade * self.valor_unitario
        super().save(*args, **kwargs)


class Lote(BaseModel):
    """
    Lote de Produto (para controle de validade e rastreabilidade)
    """
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='lotes',
        verbose_name='Produto'
    )
    numero_lote = models.CharField('Número do Lote', max_length=50)
    data_fabricacao = models.DateField('Data de Fabricação', null=True, blank=True)
    data_validade = models.DateField('Data de Validade', null=True, blank=True)
    quantidade = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        default=0,
        validators=[MinValueValidator(0)]
    )
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL,
        related_name='lotes',
        verbose_name='Fornecedor',
        null=True,
        blank=True
    )
    nota_fiscal = models.CharField('Nota Fiscal', max_length=50, blank=True)
    
    class Meta:
        verbose_name = 'Lote'
        verbose_name_plural = 'Lotes'
        ordering = ['data_validade', 'numero_lote']
        unique_together = ['produto', 'numero_lote']
        indexes = [
            models.Index(fields=['produto', 'data_validade']),
            models.Index(fields=['numero_lote']),
        ]
    
    def __str__(self):
        return f'{self.produto.nome} - Lote {self.numero_lote}'
    
    @property
    def vencido(self):
        """Verifica se o lote está vencido"""
        from django.utils import timezone
        if self.data_validade:
            return self.data_validade < timezone.now().date()
        return False
    
    @property
    def dias_para_vencer(self):
        """Dias até o vencimento"""
        from django.utils import timezone
        if self.data_validade:
            delta = self.data_validade - timezone.now().date()
            return delta.days
        return None


class Inventario(BaseModel):
    """
    Inventário de Estoque (Contagem Física)
    """
    STATUS_CHOICES = [
        ('em_andamento', 'Em Andamento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]
    
    data_inicio = models.DateTimeField('Data de Início', auto_now_add=True)
    data_conclusao = models.DateTimeField('Data de Conclusão', null=True, blank=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='em_andamento')
    responsavel = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='inventarios',
        verbose_name='Responsável'
    )
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Inventário'
        verbose_name_plural = 'Inventários'
        ordering = ['-data_inicio']
    
    def __str__(self):
        return f'Inventário {self.id} - {self.data_inicio.strftime("%d/%m/%Y")} - {self.get_status_display()}'
    
    @property
    def total_itens(self):
        """Total de itens contados"""
        return self.itens.count()
    
    @property
    def total_diferencas(self):
        """Total de itens com diferença"""
        return self.itens.exclude(diferenca=0).count()
    
    @property
    def valor_total_diferenca(self):
        """Valor total das diferenças"""
        return sum(item.valor_diferenca for item in self.itens.all())


class ItemInventario(models.Model):
    """
    Item do Inventário (Produto contado)
    """
    inventario = models.ForeignKey(
        Inventario,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Inventário'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_inventario',
        verbose_name='Produto'
    )
    quantidade_sistema = models.DecimalField(
        'Quantidade no Sistema',
        max_digits=10,
        decimal_places=3,
        default=0
    )
    quantidade_contada = models.DecimalField(
        'Quantidade Contada',
        max_digits=10,
        decimal_places=3,
        default=0
    )
    diferenca = models.DecimalField(
        'Diferença',
        max_digits=10,
        decimal_places=3,
        default=0
    )
    valor_diferenca = models.DecimalField(
        'Valor da Diferença',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    ajustado = models.BooleanField('Ajustado', default=False)
    
    class Meta:
        verbose_name = 'Item de Inventário'
        verbose_name_plural = 'Itens de Inventário'
        unique_together = ['inventario', 'produto']
        ordering = ['produto__nome']
    
    def __str__(self):
        return f'{self.produto.nome} - Dif: {self.diferenca}'
    
    def save(self, *args, **kwargs):
        """Calcula diferença e valor"""
        self.diferenca = self.quantidade_contada - self.quantidade_sistema
        self.valor_diferenca = self.diferenca * self.produto.preco_custo
        super().save(*args, **kwargs)
