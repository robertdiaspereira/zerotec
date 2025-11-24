"""
Assistencia Models - Ordem de Serviço
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Produto, Cliente

User = get_user_model()


class OrdemServico(BaseModel):
    """
    Ordem de Serviço (OS)
    """
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('em_diagnostico', 'Em Diagnóstico'),
        ('orcamento', 'Aguardando Orçamento'),
        ('aprovada', 'Aprovada'),
        ('em_execucao', 'Em Execução'),
        ('aguardando_peca', 'Aguardando Peça'),
        ('concluida', 'Concluída'),
        ('entregue', 'Entregue'),
        ('cancelada', 'Cancelada'),
    ]
    
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('normal', 'Normal'),
        ('alta', 'Alta'),
        ('urgente', 'Urgente'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='ordens_servico',
        verbose_name='Cliente'
    )
    
    # Dados do equipamento
    equipamento = models.CharField('Equipamento', max_length=200)
    marca = models.CharField('Marca', max_length=100, blank=True)
    modelo = models.CharField('Modelo', max_length=100, blank=True)
    numero_serie = models.CharField('Número de Série', max_length=100, blank=True)
    acessorios = models.TextField('Acessórios', blank=True, help_text='Ex: Carregador, capa, etc.')
    
    # Defeito relatado
    defeito_relatado = models.TextField('Defeito Relatado')
    observacoes_cliente = models.TextField('Observações do Cliente', blank=True)
    
    # Diagnóstico técnico
    diagnostico = models.TextField('Diagnóstico Técnico', blank=True)
    solucao = models.TextField('Solução', blank=True)
    
    # Datas
    data_abertura = models.DateTimeField('Data de Abertura', auto_now_add=True)
    data_previsao = models.DateField('Previsão de Entrega', null=True, blank=True)
    data_conclusao = models.DateTimeField('Data de Conclusão', null=True, blank=True)
    data_entrega = models.DateTimeField('Data de Entrega', null=True, blank=True)
    
    # Status e prioridade
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='aberta')
    prioridade = models.CharField('Prioridade', max_length=10, choices=PRIORIDADE_CHOICES, default='normal')
    
    # Valores
    valor_servico = models.DecimalField(
        'Valor do Serviço',
        max_digits=10,
        decimal_places=2,
        default=0
    )
    valor_pecas = models.DecimalField(
        'Valor das Peças',
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
    
    # Garantia
    garantia_dias = models.IntegerField('Garantia (dias)', default=90)
    data_fim_garantia = models.DateField('Fim da Garantia', null=True, blank=True)
    
    # Responsáveis
    tecnico = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ordens_servico',
        verbose_name='Técnico Responsável'
    )
    
    observacoes_internas = models.TextField('Observações Internas', blank=True)
    
    class Meta:
        verbose_name = 'Ordem de Serviço'
        verbose_name_plural = 'Ordens de Serviço'
        ordering = ['-data_abertura']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['cliente', '-data_abertura']),
            models.Index(fields=['status']),
            models.Index(fields=['tecnico', '-data_abertura']),
            models.Index(fields=['-data_abertura']),
        ]
    
    def __str__(self):
        return f'OS {self.numero} - {self.cliente.nome_razao_social} - {self.equipamento}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = OrdemServico.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'OS{proximo_id:06d}'
        
        # Calculate total
        self.valor_total = self.valor_servico + self.valor_pecas - self.valor_desconto
        
        # Calculate warranty end date
        if self.data_conclusao and self.garantia_dias:
            from datetime import timedelta
            self.data_fim_garantia = self.data_conclusao.date() + timedelta(days=self.garantia_dias)
        
        super().save(*args, **kwargs)
    
    @property
    def total_pecas(self):
        """Total de peças utilizadas"""
        return self.pecas.count()
    
    @property
    def em_garantia(self):
        """Verifica se ainda está em garantia"""
        from django.utils import timezone
        if self.data_fim_garantia:
            return self.data_fim_garantia >= timezone.now().date()
        return False
    
    @property
    def dias_aberta(self):
        """Dias desde a abertura"""
        from django.utils import timezone
        if self.status in ['concluida', 'entregue', 'cancelada']:
            if self.data_conclusao:
                delta = self.data_conclusao - self.data_abertura
                return delta.days
        else:
            delta = timezone.now() - self.data_abertura
            return delta.days
        return 0


class PecaOS(models.Model):
    """
    Peça utilizada na Ordem de Serviço
    """
    os = models.ForeignKey(
        OrdemServico,
        on_delete=models.CASCADE,
        related_name='pecas',
        verbose_name='Ordem de Serviço'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT,
        related_name='pecas_os',
        verbose_name='Produto/Peça'
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
    aplicada = models.BooleanField('Aplicada', default=False)
    
    class Meta:
        verbose_name = 'Peça da OS'
        verbose_name_plural = 'Peças da OS'
        ordering = ['produto__nome']
    
    def __str__(self):
        return f'{self.produto.nome} - Qtd: {self.quantidade}'
    
    def save(self, *args, **kwargs):
        """Calcula preço total"""
        self.preco_total = self.quantidade * self.preco_unitario
        super().save(*args, **kwargs)


class OrcamentoOS(BaseModel):
    """
    Orçamento da Ordem de Serviço
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovado', 'Aprovado'),
        ('recusado', 'Recusado'),
    ]
    
    os = models.ForeignKey(
        OrdemServico,
        on_delete=models.CASCADE,
        related_name='orcamentos',
        verbose_name='Ordem de Serviço'
    )
    descricao_servico = models.TextField('Descrição do Serviço')
    valor_servico = models.DecimalField(
        'Valor do Serviço',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    valor_pecas = models.DecimalField(
        'Valor das Peças',
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
    prazo_dias = models.IntegerField('Prazo (dias)', default=7)
    validade_dias = models.IntegerField('Validade do Orçamento (dias)', default=15)
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    data_aprovacao = models.DateTimeField('Data de Aprovação', null=True, blank=True)
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Orçamento da OS'
        verbose_name_plural = 'Orçamentos da OS'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Orçamento OS {self.os.numero} - {self.get_status_display()}'
    
    def save(self, *args, **kwargs):
        """Calcula valor total"""
        self.valor_total = self.valor_servico + self.valor_pecas
        super().save(*args, **kwargs)


class HistoricoOS(models.Model):
    """
    Histórico de alterações da OS
    """
    os = models.ForeignKey(
        OrdemServico,
        on_delete=models.CASCADE,
        related_name='historico',
        verbose_name='Ordem de Serviço'
    )
    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='historico_os',
        verbose_name='Usuário'
    )
    data = models.DateTimeField('Data', auto_now_add=True)
    acao = models.CharField('Ação', max_length=100)
    descricao = models.TextField('Descrição')
    
    class Meta:
        verbose_name = 'Histórico da OS'
        verbose_name_plural = 'Históricos da OS'
        ordering = ['-data']
    
    def __str__(self):
        return f'{self.os.numero} - {self.acao} - {self.data.strftime("%d/%m/%Y %H:%M")}'
