"""
CRM Models - Pipeline de Vendas, Oportunidades, Atividades
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel
from apps.erp.models import Cliente, Produto

User = get_user_model()


class Funil(BaseModel):
    """
    Funil de Vendas (Sales Pipeline)
    """
    nome = models.CharField('Nome', max_length=100)
    descricao = models.TextField('Descrição', blank=True)
    ordem = models.IntegerField('Ordem', default=0)
    cor = models.CharField('Cor (Hex)', max_length=7, default='#3B82F6')
    
    class Meta:
        verbose_name = 'Funil de Vendas'
        verbose_name_plural = 'Funis de Vendas'
        ordering = ['ordem']
    
    def __str__(self):
        return self.nome


class EtapaFunil(BaseModel):
    """
    Etapa do Funil (Pipeline Stage)
    """
    funil = models.ForeignKey(
        Funil,
        on_delete=models.CASCADE,
        related_name='etapas',
        verbose_name='Funil'
    )
    nome = models.CharField('Nome', max_length=100)
    descricao = models.TextField('Descrição', blank=True)
    ordem = models.IntegerField('Ordem', default=0)
    cor = models.CharField('Cor (Hex)', max_length=7, default='#10B981')
    probabilidade = models.IntegerField(
        'Probabilidade de Fechamento (%)',
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Etapas especiais
    is_inicial = models.BooleanField('Etapa Inicial', default=False)
    is_ganho = models.BooleanField('Etapa de Ganho', default=False)
    is_perdido = models.BooleanField('Etapa de Perda', default=False)
    
    class Meta:
        verbose_name = 'Etapa do Funil'
        verbose_name_plural = 'Etapas do Funil'
        ordering = ['funil', 'ordem']
        unique_together = ['funil', 'ordem']
    
    def __str__(self):
        return f'{self.funil.nome} - {self.nome}'


class Oportunidade(BaseModel):
    """
    Oportunidade de Venda (Deal/Opportunity)
    """
    ORIGEM_CHOICES = [
        ('website', 'Website'),
        ('indicacao', 'Indicação'),
        ('telefone', 'Telefone'),
        ('email', 'E-mail'),
        ('redes_sociais', 'Redes Sociais'),
        ('evento', 'Evento'),
        ('outro', 'Outro'),
    ]
    
    numero = models.CharField('Número', max_length=20, unique=True)
    titulo = models.CharField('Título', max_length=200)
    descricao = models.TextField('Descrição', blank=True)
    
    # Cliente
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='oportunidades',
        verbose_name='Cliente',
        null=True,
        blank=True
    )
    nome_lead = models.CharField('Nome do Lead', max_length=200, blank=True)
    email_lead = models.EmailField('E-mail do Lead', blank=True)
    telefone_lead = models.CharField('Telefone do Lead', max_length=20, blank=True)
    
    # Funil
    funil = models.ForeignKey(
        Funil,
        on_delete=models.PROTECT,
        related_name='oportunidades',
        verbose_name='Funil'
    )
    etapa = models.ForeignKey(
        EtapaFunil,
        on_delete=models.PROTECT,
        related_name='oportunidades',
        verbose_name='Etapa Atual'
    )
    
    # Valores
    valor_estimado = models.DecimalField(
        'Valor Estimado',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    probabilidade = models.IntegerField(
        'Probabilidade (%)',
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Produto/Serviço
    produto = models.ForeignKey(
        Produto,
        on_delete=models.SET_NULL,
        related_name='oportunidades',
        verbose_name='Produto/Serviço',
        null=True,
        blank=True
    )
    
    # Datas
    data_abertura = models.DateField('Data de Abertura', auto_now_add=True)
    data_fechamento_prevista = models.DateField('Data Prevista de Fechamento', null=True, blank=True)
    data_fechamento = models.DateField('Data de Fechamento', null=True, blank=True)
    
    # Responsável
    responsavel = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='oportunidades',
        verbose_name='Responsável',
        null=True,
        blank=True
    )
    
    # Origem
    origem = models.CharField('Origem', max_length=20, choices=ORIGEM_CHOICES, default='outro')
    
    # Motivo de perda
    motivo_perda = models.TextField('Motivo da Perda', blank=True)
    
    class Meta:
        verbose_name = 'Oportunidade'
        verbose_name_plural = 'Oportunidades'
        ordering = ['-data_abertura']
        indexes = [
            models.Index(fields=['numero']),
            models.Index(fields=['cliente', '-data_abertura']),
            models.Index(fields=['etapa']),
            models.Index(fields=['responsavel', '-data_abertura']),
        ]
    
    def __str__(self):
        cliente_nome = self.cliente.nome_razao_social if self.cliente else self.nome_lead
        return f'{self.numero} - {cliente_nome}'
    
    def save(self, *args, **kwargs):
        if not self.numero:
            # Generate automatic number
            ultimo = Oportunidade.objects.order_by('-id').first()
            proximo_id = (ultimo.id + 1) if ultimo else 1
            self.numero = f'OPP{proximo_id:06d}'
        
        # Atualizar probabilidade baseado na etapa
        if self.etapa:
            self.probabilidade = self.etapa.probabilidade
        
        super().save(*args, **kwargs)
    
    @property
    def valor_ponderado(self):
        """Valor estimado x probabilidade"""
        return self.valor_estimado * (self.probabilidade / 100)
    
    @property
    def dias_em_aberto(self):
        """Dias desde a abertura"""
        from django.utils import timezone
        if self.data_fechamento:
            delta = self.data_fechamento - self.data_abertura
        else:
            delta = timezone.now().date() - self.data_abertura
        return delta.days
    
    @property
    def status_prazo(self):
        """Verifica se está atrasada"""
        from django.utils import timezone
        if self.data_fechamento_prevista and not self.data_fechamento:
            if timezone.now().date() > self.data_fechamento_prevista:
                return 'atrasado'
            elif (self.data_fechamento_prevista - timezone.now().date()).days <= 7:
                return 'proximo'
        return 'normal'


class Atividade(BaseModel):
    """
    Atividade/Tarefa relacionada a uma Oportunidade
    """
    TIPO_CHOICES = [
        ('ligacao', 'Ligação'),
        ('email', 'E-mail'),
        ('reuniao', 'Reunião'),
        ('visita', 'Visita'),
        ('proposta', 'Enviar Proposta'),
        ('follow_up', 'Follow-up'),
        ('outro', 'Outro'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    
    oportunidade = models.ForeignKey(
        Oportunidade,
        on_delete=models.CASCADE,
        related_name='atividades',
        verbose_name='Oportunidade'
    )
    
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField('Título', max_length=200)
    descricao = models.TextField('Descrição', blank=True)
    
    # Datas
    data_prevista = models.DateTimeField('Data Prevista')
    data_conclusao = models.DateTimeField('Data de Conclusão', null=True, blank=True)
    
    # Responsável
    responsavel = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='atividades_crm',
        verbose_name='Responsável',
        null=True,
        blank=True
    )
    
    status = models.CharField('Status', max_length=20, choices=STATUS_CHOICES, default='pendente')
    resultado = models.TextField('Resultado', blank=True)
    
    class Meta:
        verbose_name = 'Atividade'
        verbose_name_plural = 'Atividades'
        ordering = ['data_prevista']
    
    def __str__(self):
        return f'{self.get_tipo_display()} - {self.titulo}'


class Interacao(BaseModel):
    """
    Histórico de Interações com o Cliente
    """
    TIPO_CHOICES = [
        ('ligacao', 'Ligação'),
        ('email', 'E-mail'),
        ('reuniao', 'Reunião'),
        ('visita', 'Visita'),
        ('whatsapp', 'WhatsApp'),
        ('nota', 'Nota'),
        ('outro', 'Outro'),
    ]
    
    oportunidade = models.ForeignKey(
        Oportunidade,
        on_delete=models.CASCADE,
        related_name='interacoes',
        verbose_name='Oportunidade',
        null=True,
        blank=True
    )
    
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='interacoes',
        verbose_name='Cliente',
        null=True,
        blank=True
    )
    
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    assunto = models.CharField('Assunto', max_length=200)
    descricao = models.TextField('Descrição')
    
    data_interacao = models.DateTimeField('Data da Interação', auto_now_add=True)
    
    # Responsável
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='interacoes_crm',
        verbose_name='Usuário',
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = 'Interação'
        verbose_name_plural = 'Interações'
        ordering = ['-data_interacao']
    
    def __str__(self):
        return f'{self.get_tipo_display()} - {self.assunto}'
