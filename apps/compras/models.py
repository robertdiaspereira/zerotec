"""
Compras Models - Cotações, Pedidos de Compra e Recebimento
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Produto, Fornecedor

User = get_user_model()


class Cotacao(BaseModel):
    """
    Cotação de Preços (para comparar fornecedores)
    """
    STATUS_CHOICES = [
        ('em_andamento', 'Em Andamento'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    data_solicitacao = models.DateTimeField('Data de Solicitação', auto_now_add=True)
    data_validade = models.DateField('Data de Validade')
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='em_andamento')
    solicitante = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='cotacoes',
        verbose_name='Solicitante'
    )
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Cotação'
        verbose_name_plural = 'Cotações'
        ordering = ['-data_solicitacao']
    
    def __str__(self):
        return f'Cotação {self.numero} - {self.get_status_display()}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = Cotacao.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'COT{proximo_id:06d}'
        super().save(*args, **kwargs)
    
    @property
    def total_itens(self):
        """Total de itens na cotação"""
        return self.itens.count()
    
    @property
    def melhor_fornecedor(self):
        """Fornecedor com melhor preço total"""
        from django.db.models import Sum, F
        
        fornecedores = self.itens.values('fornecedor').annotate(
            total=Sum(F('preco_unitario') * F('quantidade'))
        ).order_by('total')
        
        if fornecedores:
            return fornecedores[0]
        return None


class ItemCotacao(models.Model):
    """
    Item da Cotação (produto cotado com fornecedor)
    """
    cotacao = models.ForeignKey(
        Cotacao,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Cotação'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_cotacao',
        verbose_name='Produto'
    )
    quantidade = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0.001)]
    )
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.PROTECT,
        related_name='itens_cotacao',
        verbose_name='Fornecedor'
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
    prazo_entrega = models.IntegerField('Prazo de Entrega (dias)', default=0)
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Item de Cotação'
        verbose_name_plural = 'Itens de Cotação'
        ordering = ['produto__nome', 'preco_unitario']
    
    def __str__(self):
        return f'{self.produto.nome} - {self.fornecedor.razao_social}'
    
    def save(self, *args, **kwargs):
        """Calcula preço total"""
        self.preco_total = self.quantidade * self.preco_unitario
        super().save(*args, **kwargs)


class PedidoCompra(BaseModel):
    """
    Pedido de Compra
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('em_transito', 'Em Trânsito'),
        ('recebido', 'Recebido'),
        ('cancelado', 'Cancelado'),
    ]
    
    FORMA_PAGAMENTO_CHOICES = [
        ('dinheiro', 'Dinheiro'),
        ('boleto', 'Boleto'),
        ('transferencia', 'Transferência'),
        ('cartao', 'Cartão'),
        ('cheque', 'Cheque'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.PROTECT,
        related_name='pedidos_compra',
        verbose_name='Fornecedor'
    )
    data_pedido = models.DateTimeField('Data do Pedido', auto_now_add=True)
    data_entrega_prevista = models.DateField('Data de Entrega Prevista')
    data_entrega_real = models.DateField('Data de Entrega Real', null=True, blank=True)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    
    # Valores
    valor_produtos = models.DecimalField(
        'Valor dos Produtos',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_frete = models.DecimalField(
        'Valor do Frete',
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
    valor_total = models.DecimalField(
        'Valor Total',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Pagamento
    forma_pagamento = models.CharField(
        'Forma de Pagamento',
        max_length=20,
        choices=FORMA_PAGAMENTO_CHOICES,
        default='boleto'
    )
    condicao_pagamento = models.CharField('Condição de Pagamento', max_length=100, blank=True)
    
    # Responsável
    comprador = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='pedidos_compra',
        verbose_name='Comprador'
    )
    
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Pedido de Compra'
        verbose_name_plural = 'Pedidos de Compra'
        ordering = ['-data_pedido']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['fornecedor', '-data_pedido']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f'Pedido {self.numero} - {self.fornecedor.razao_social}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = PedidoCompra.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'PC{proximo_id:06d}'
        
        # Calculate total
        self.valor_total = self.valor_produtos + self.valor_frete - self.valor_desconto
        
        super().save(*args, **kwargs)
    
    @property
    def total_itens(self):
        """Total de itens no pedido"""
        return self.itens.count()
    
    @property
    def percentual_recebido(self):
        """Percentual recebido do pedido"""
        if self.total_itens == 0:
            return 0
        
        total_quantidade = sum(item.quantidade_pedida for item in self.itens.all())
        total_recebido = sum(item.quantidade_recebida for item in self.itens.all())
        
        if total_quantidade == 0:
            return 0
        
        return (total_recebido / total_quantidade) * 100


class ItemPedidoCompra(models.Model):
    """
    Item do Pedido de Compra
    """
    pedido = models.ForeignKey(
        PedidoCompra,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Pedido'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='itens_pedido_compra',
        verbose_name='Produto'
    )
    quantidade_pedida = models.DecimalField(
        'Quantidade Pedida',
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0.001)]
    )
    quantidade_recebida = models.DecimalField(
        'Quantidade Recebida',
        max_digits=10,
        decimal_places=3,
        default=0
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
    
    class Meta:
        verbose_name = 'Item do Pedido de Compra'
        verbose_name_plural = 'Itens do Pedido de Compra'
        ordering = ['produto__nome']
    
    def __str__(self):
        return f'{self.produto.nome} - Qtd: {self.quantidade_pedida}'
    
    def save(self, *args, **kwargs):
        """Calcula preço total"""
        self.preco_total = (self.quantidade_pedida * self.preco_unitario) - self.desconto
        super().save(*args, **kwargs)
    
    @property
    def pendente_receber(self):
        """Quantidade pendente de recebimento"""
        return self.quantidade_pedida - self.quantidade_recebida


class RecebimentoMercadoria(BaseModel):
    """
    Recebimento de Mercadoria
    """
    pedido_compra = models.ForeignKey(
        PedidoCompra,
        on_delete=models.PROTECT,
        related_name='recebimentos',
        verbose_name='Pedido de Compra'
    )
    nota_fiscal = models.CharField('Nota Fiscal', max_length=50)
    data_recebimento = models.DateTimeField('Data de Recebimento', auto_now_add=True)
    recebedor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='recebimentos',
        verbose_name='Recebedor'
    )
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Recebimento de Mercadoria'
        verbose_name_plural = 'Recebimentos de Mercadorias'
        ordering = ['-data_recebimento']
    
    def __str__(self):
        return f'Recebimento NF {self.nota_fiscal} - Pedido {self.pedido_compra.numero}'
    
    @property
    def total_itens(self):
        """Total de itens recebidos"""
        return self.itens.count()


class ItemRecebimento(models.Model):
    """
    Item do Recebimento
    """
    recebimento = models.ForeignKey(
        RecebimentoMercadoria,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name='Recebimento'
    )
    item_pedido = models.ForeignKey(
        ItemPedidoCompra,
        on_delete=models.PROTECT,
        related_name='recebimentos',
        verbose_name='Item do Pedido'
    )
    quantidade = models.DecimalField(
        'Quantidade',
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0.001)]
    )
    lote = models.CharField('Lote', max_length=50, blank=True)
    data_validade = models.DateField('Data de Validade', null=True, blank=True)
    conferido = models.BooleanField('Conferido', default=False)
    
    class Meta:
        verbose_name = 'Item do Recebimento'
        verbose_name_plural = 'Itens do Recebimento'
    
    def __str__(self):
        return f'{self.item_pedido.produto.nome} - Qtd: {self.quantidade}'
