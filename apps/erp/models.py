"""
ERP Models - Clientes, Fornecedores, Produtos e Categorias
"""

from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models import BaseModel
from apps.core.utils import validate_cpf, validate_cnpj


class Categoria(BaseModel):
    """
    Categoria de produtos ou serviços
    """
    TIPO_CHOICES = [
        ('produto', 'Produto'),
        ('servico', 'Serviço'),
    ]
    
    nome = models.CharField('Nome', max_length=100)
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES, default='produto')
    descricao = models.TextField('Descrição', blank=True)
    
    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['nome']
    
    def __str__(self):
        return f'{self.nome} ({self.get_tipo_display()})'


class Cliente(BaseModel):
    """
    Cliente - Pessoa Física ou Jurídica
    """
    TIPO_CHOICES = [
        ('pf', 'Pessoa Física'),
        ('pj', 'Pessoa Jurídica'),
    ]
    
    # Dados básicos
    tipo = models.CharField('Tipo', max_length=2, choices=TIPO_CHOICES, default='pf')
    nome_razao_social = models.CharField('Nome/Razão Social', max_length=200)
    nome_fantasia = models.CharField('Nome Fantasia', max_length=200, blank=True)
    cpf_cnpj = models.CharField('CPF/CNPJ', max_length=18, unique=True)
    rg_ie = models.CharField('RG/IE', max_length=20, blank=True)
    
    # Contato
    telefone_principal = models.CharField('Telefone Principal', max_length=20)
    telefone_secundario = models.CharField('Telefone Secundário', max_length=20, blank=True)
    email = models.EmailField('E-mail', blank=True)
    
    # Dados pessoais (PF)
    data_nascimento = models.DateField('Data de Nascimento', null=True, blank=True)
    
    # Endereço
    cep = models.CharField('CEP', max_length=9, blank=True)
    logradouro = models.CharField('Logradouro', max_length=200, blank=True)
    numero = models.CharField('Número', max_length=20, blank=True)
    complemento = models.CharField('Complemento', max_length=100, blank=True)
    bairro = models.CharField('Bairro', max_length=100, blank=True)
    cidade = models.CharField('Cidade', max_length=100, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    
    # Observações
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome_razao_social']
        indexes = [
            models.Index(fields=['cpf_cnpj']),
            models.Index(fields=['nome_razao_social']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return self.nome_razao_social
    
    def clean(self):
        """Validação customizada"""
        from django.core.exceptions import ValidationError
        
        # Remove formatação do CPF/CNPJ
        cpf_cnpj = ''.join(filter(str.isdigit, self.cpf_cnpj))
        
        # Valida CPF ou CNPJ
        if self.tipo == 'pf':
            if len(cpf_cnpj) != 11:
                raise ValidationError({'cpf_cnpj': 'CPF deve ter 11 dígitos'})
            if not validate_cpf(cpf_cnpj):
                raise ValidationError({'cpf_cnpj': 'CPF inválido'})
        else:  # PJ
            if len(cpf_cnpj) != 14:
                raise ValidationError({'cpf_cnpj': 'CNPJ deve ter 14 dígitos'})
            if not validate_cnpj(cpf_cnpj):
                raise ValidationError({'cpf_cnpj': 'CNPJ inválido'})
    
    @property
    def total_vendas(self):
        """Total de vendas do cliente"""
        return self.vendas.filter(status='faturado').aggregate(
            total=models.Sum('valor_total')
        )['total'] or 0
    
    @property
    def total_os(self):
        """Total de OS do cliente"""
        return self.ordens_servico.count()


class Fornecedor(BaseModel):
    """
    Fornecedor - Sempre Pessoa Jurídica
    """
    # Dados básicos
    razao_social = models.CharField('Razão Social', max_length=200)
    nome_fantasia = models.CharField('Nome Fantasia', max_length=200, blank=True)
    cnpj = models.CharField('CNPJ', max_length=18, unique=True)
    ie = models.CharField('Inscrição Estadual', max_length=20, blank=True)
    
    # Contato
    telefone_principal = models.CharField('Telefone Principal', max_length=20)
    telefone_secundario = models.CharField('Telefone Secundário', max_length=20, blank=True)
    email = models.EmailField('E-mail', blank=True)
    contato_nome = models.CharField('Nome do Contato', max_length=100, blank=True)
    contato_cargo = models.CharField('Cargo do Contato', max_length=100, blank=True)
    
    # Endereço
    cep = models.CharField('CEP', max_length=9, blank=True)
    logradouro = models.CharField('Logradouro', max_length=200, blank=True)
    numero = models.CharField('Número', max_length=20, blank=True)
    complemento = models.CharField('Complemento', max_length=100, blank=True)
    bairro = models.CharField('Bairro', max_length=100, blank=True)
    cidade = models.CharField('Cidade', max_length=100, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    
    # Observações
    observacoes = models.TextField('Observações', blank=True)
    
    class Meta:
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'
        ordering = ['razao_social']
        indexes = [
            models.Index(fields=['cnpj']),
            models.Index(fields=['razao_social']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return self.nome_fantasia or self.razao_social
    
    def clean(self):
        """Validação customizada"""
        from django.core.exceptions import ValidationError
        
        # Remove formatação do CNPJ
        cnpj = ''.join(filter(str.isdigit, self.cnpj))
        
        # Valida CNPJ
        if len(cnpj) != 14:
            raise ValidationError({'cnpj': 'CNPJ deve ter 14 dígitos'})
        if not validate_cnpj(cnpj):
            raise ValidationError({'cnpj': 'CNPJ inválido'})
    
    @property
    def total_compras(self):
        """Total de compras do fornecedor"""
        return self.pedidos_compra.filter(status='recebido').aggregate(
            total=models.Sum('valor_total')
        )['total'] or 0


class Produto(BaseModel):
    """
    Produto ou Serviço
    """
    TIPO_CHOICES = [
        ('produto', 'Produto'),
        ('servico', 'Serviço'),
    ]
    
    UNIDADE_CHOICES = [
        ('UN', 'Unidade'),
        ('KG', 'Quilograma'),
        ('M', 'Metro'),
        ('M2', 'Metro Quadrado'),
        ('M3', 'Metro Cúbico'),
        ('L', 'Litro'),
        ('CX', 'Caixa'),
        ('PC', 'Peça'),
        ('PAR', 'Par'),
        ('CONJ', 'Conjunto'),
    ]
    
    # Dados básicos
    tipo = models.CharField('Tipo', max_length=10, choices=TIPO_CHOICES, default='produto')
    nome = models.CharField('Nome', max_length=200)
    descricao = models.TextField('Descrição', blank=True)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='produtos',
        verbose_name='Categoria',
        null=True,
        blank=True
    )
    
    # Códigos
    codigo_interno = models.CharField('Código Interno', max_length=50, unique=True)
    codigo_barras = models.CharField('Código de Barras', max_length=50, blank=True)
    ncm = models.CharField('NCM', max_length=10, blank=True, help_text='Nomenclatura Comum do Mercosul')
    
    # Unidade
    unidade_medida = models.CharField('Unidade de Medida', max_length=10, choices=UNIDADE_CHOICES, default='UN')
    
    # Preços
    preco_custo = models.DecimalField(
        'Preço de Custo',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    preco_venda = models.DecimalField(
        'Preço de Venda',
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    margem_lucro = models.DecimalField(
        'Margem de Lucro (%)',
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Estoque (apenas para produtos)
    estoque_atual = models.DecimalField(
        'Estoque Atual',
        max_digits=10,
        decimal_places=3,
        default=0,
        validators=[MinValueValidator(0)]
    )
    estoque_minimo = models.DecimalField(
        'Estoque Mínimo',
        max_digits=10,
        decimal_places=3,
        default=0,
        validators=[MinValueValidator(0)]
    )
    estoque_maximo = models.DecimalField(
        'Estoque Máximo',
        max_digits=10,
        decimal_places=3,
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # Localização
    localizacao = models.CharField('Localização', max_length=100, blank=True, help_text='Ex: Prateleira A1')
    
    # Controles
    controla_lote = models.BooleanField('Controla Lote', default=False)
    controla_validade = models.BooleanField('Controla Validade', default=False)
    
    # Imagem
    imagem = models.ImageField('Imagem', upload_to='produtos/', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['nome']
        indexes = [
            models.Index(fields=['codigo_interno']),
            models.Index(fields=['codigo_barras']),
            models.Index(fields=['nome']),
            models.Index(fields=['tipo']),
            models.Index(fields=['active']),
        ]
    
    def __str__(self):
        return f'{self.codigo_interno} - {self.nome}'
    
    def save(self, *args, **kwargs):
        """Calcula margem de lucro automaticamente"""
        if self.preco_custo > 0 and self.preco_venda > 0:
            self.margem_lucro = ((self.preco_venda - self.preco_custo) / self.preco_custo) * 100
        super().save(*args, **kwargs)
    
    @property
    def estoque_baixo(self):
        """Verifica se o estoque está abaixo do mínimo"""
        return self.estoque_atual < self.estoque_minimo
    
    @property
    def valor_estoque(self):
        """Valor total do estoque (custo)"""
        return self.estoque_atual * self.preco_custo
