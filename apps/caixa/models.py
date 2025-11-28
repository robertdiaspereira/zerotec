"""
Models for Caixa (Cash Register) management
"""

from django.db import models
from django.conf import settings
from django.utils import timezone


class Caixa(models.Model):
    """
    Modelo para controle de abertura e fechamento de caixa
    """
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('fechado', 'Fechado'),
    ]
    
    # Usuários responsáveis
    usuario_abertura = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='caixas_abertos',
        verbose_name='Usuário que abriu'
    )
    usuario_fechamento = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='caixas_fechados', 
        null=True, 
        blank=True,
        verbose_name='Usuário que fechou'
    )
    
    # Datas
    data_abertura = models.DateTimeField(
        default=timezone.now,
        verbose_name='Data/Hora de Abertura'
    )
    data_fechamento = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name='Data/Hora de Fechamento'
    )
    
    # Valores
    valor_inicial = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name='Valor Inicial (Contagem Física)',
        help_text='Valor em dinheiro contado na abertura do caixa'
    )
    valor_final = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='Valor Final (Contagem Física)',
        help_text='Valor em dinheiro contado no fechamento do caixa'
    )
    valor_esperado = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name='Valor Esperado',
        help_text='Valor calculado baseado nas vendas'
    )
    
    # Observações
    observacoes_abertura = models.TextField(
        blank=True,
        verbose_name='Observações da Abertura'
    )
    observacoes_fechamento = models.TextField(
        blank=True,
        verbose_name='Observações do Fechamento'
    )
    
    # Status
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='aberto',
        verbose_name='Status'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Caixa'
        verbose_name_plural = 'Caixas'
        ordering = ['-data_abertura']
        indexes = [
            models.Index(fields=['status', 'usuario_abertura']),
            models.Index(fields=['data_abertura']),
        ]
    
    def __str__(self):
        return f"Caixa {self.id} - {self.usuario_abertura.username} - {self.data_abertura.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def quebra_caixa(self):
        """
        Calcula a diferença entre o valor final e o esperado
        Positivo = sobra, Negativo = falta
        """
        if self.valor_final is not None and self.valor_esperado is not None:
            return self.valor_final - self.valor_esperado
        return None
    
    @property
    def total_vendas(self):
        """
        Retorna o total de vendas realizadas neste caixa
        """
        from apps.vendas.models import Venda
        vendas = Venda.objects.filter(caixa=self)
        return sum(v.valor_total for v in vendas)
    
    @property
    def quantidade_vendas(self):
        """
        Retorna a quantidade de vendas realizadas neste caixa
        """
        from apps.vendas.models import Venda
        return Venda.objects.filter(caixa=self).count()
    
    def fechar(self, usuario, valor_final, observacoes=''):
        """
        Fecha o caixa e calcula os valores
        """
        if self.status == 'fechado':
            raise ValueError('Este caixa já está fechado')
        
        self.usuario_fechamento = usuario
        self.data_fechamento = timezone.now()
        self.valor_final = valor_final
        self.valor_esperado = self.valor_inicial + self.total_vendas
        self.observacoes_fechamento = observacoes
        self.status = 'fechado'
        self.save()
        
        return self
    
    @classmethod
    def caixa_aberto_usuario(cls, usuario):
        """
        Retorna o caixa aberto do usuário, se existir
        """
        return cls.objects.filter(
            usuario_abertura=usuario,
            status='aberto'
        ).first()
    
    @classmethod
    def tem_caixa_aberto(cls, usuario):
        """
        Verifica se o usuário tem um caixa aberto
        """
        return cls.objects.filter(
            usuario_abertura=usuario,
            status='aberto'
        ).exists()
