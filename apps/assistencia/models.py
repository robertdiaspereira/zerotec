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
    
    # Novos campos
    checklist = models.JSONField('Checklist', default=dict, blank=True)
    obs_recebimento = models.TextField('Obs. Recebimento', blank=True)
    laudo_tecnico = models.TextField('Laudo Técnico', blank=True)
    valor_frete = models.DecimalField('Valor do Frete', max_digits=10, decimal_places=2, default=0)
    protocolo_entrega = models.BooleanField('Protocolo de Entrega', default=False)
    
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


class CategoriaServico(models.Model):
    """Categorias para organizar os serviços"""
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = 'Categoria de Serviço'
        verbose_name_plural = 'Categorias de Serviços'
    
    def __str__(self):
        return self.nome


class ServicoTemplate(models.Model):
    """Template de serviços pré-cadastrados"""
    codigo = models.CharField(max_length=20, unique=True, editable=False)
    descricao = models.CharField(max_length=200)
    descricao_detalhada = models.TextField(blank=True)
    valor_padrao = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_estimado = models.IntegerField(help_text="Tempo em minutos", null=True, blank=True)
    categoria = models.ForeignKey(
        CategoriaServico,
        on_delete=models.PROTECT,
        related_name='servicos',
        verbose_name='Categoria',
        null=True,
        blank=True
    )
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['descricao']
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
    
    def save(self, *args, **kwargs):
        if not self.codigo:
            # Gerar código automático SR_XXXX
            last_servico = ServicoTemplate.objects.filter(
                codigo__startswith='SR_'
            ).order_by('-codigo').first()
            
            if last_servico and last_servico.codigo:
                try:
                    last_number = int(last_servico.codigo.split('_')[1])
                    new_number = last_number + 1
                except (IndexError, ValueError):
                    new_number = 1
            else:
                new_number = 1
            
            self.codigo = f'SR_{new_number:04d}'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.codigo} - {self.descricao}"



class ChecklistItem(models.Model):
    """Itens customizáveis do checklist"""
    label = models.CharField(max_length=100)
    ordem = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ordem', 'label']
    
    def __str__(self):
        return self.label


class TermoGarantia(models.Model):
    """Termos de garantia para produtos e serviços"""
    TIPO_CHOICES = [
        ('produto', 'Produto'),
        ('servico', 'Serviço'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    conteudo = models.TextField()
    ativo = models.BooleanField(default=True)
    padrao = models.BooleanField(default=False)  # Termo padrão
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Termo de Garantia'
        verbose_name_plural = 'Termos de Garantia'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.titulo}"


class OSAnexo(models.Model):
    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name='anexos')
    arquivo = models.FileField(upload_to='os_anexos/')
    tipo = models.CharField(max_length=50)  # 'foto', 'documento'
    descricao = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Anexo da OS'
        verbose_name_plural = 'Anexos da OS'


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


class RecebimentoOS(models.Model):
    """
    Recebimento da Ordem de Serviço
    Registra como o cliente pagou e as taxas aplicadas
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('recebido', 'Recebido'),
        ('cancelado', 'Cancelado'),
    ]
    
    os = models.ForeignKey(
        OrdemServico,
        on_delete=models.CASCADE,
        related_name='recebimentos',
        verbose_name='Ordem de Serviço'
    )
    forma_recebimento = models.ForeignKey(
        'financeiro.FormaRecebimento',
        on_delete=models.PROTECT,
        related_name='recebimentos_os',
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
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Recebimento da OS'
        verbose_name_plural = 'Recebimentos das OS'
        ordering = ['-data_vencimento']
    
    def __str__(self):
        return f'OS {self.os.numero} - {self.forma_recebimento.nome} - R$ {self.valor_bruto} (Líquido: R$ {self.valor_liquido})'
    
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
