from django.db import models

class Webhook(models.Model):
    EVENT_CHOICES = [
        ('venda_nova', 'Nova Venda'),
        ('os_nova', 'Nova Ordem de Serviço'),
        ('pagamento_recebido', 'Pagamento Recebido'),
    ]
    event = models.CharField('Evento', max_length=30, choices=EVENT_CHOICES)
    url = models.URLField('URL de destino')
    active = models.BooleanField('Ativo', default=True)
    created_at = models.DateTimeField('Criado em', auto_now_add=True)

    class Meta:
        verbose_name = 'Webhook'
        verbose_name_plural = 'Webhooks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_event_display()} -> {self.url}"
