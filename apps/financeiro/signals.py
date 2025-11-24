"""
Signals for automatic financial updates
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import ContaPagar, ContaReceber, FluxoCaixa


@receiver(post_save, sender=ContaPagar)
def criar_fluxo_caixa_pagamento(sender, instance, created, **kwargs):
    """
    Cria movimentação no fluxo de caixa quando conta é paga
    """
    if instance.status == 'pago' and instance.data_pagamento and not created:
        # Verifica se já existe movimentação
        existe = FluxoCaixa.objects.filter(conta_pagar=instance).exists()
        
        if not existe:
            FluxoCaixa.objects.create(
                data=instance.data_pagamento,
                tipo='saida',
                categoria=instance.categoria,
                descricao=f'Pagamento - {instance.descricao}',
                valor=instance.valor_pago,
                conta_bancaria=instance.conta_bancaria,
                conta_pagar=instance
            )
            
            # Atualiza saldo da conta bancária
            if instance.conta_bancaria:
                instance.conta_bancaria.saldo_atual -= instance.valor_pago
                instance.conta_bancaria.save(update_fields=['saldo_atual'])


@receiver(post_save, sender=ContaReceber)
def criar_fluxo_caixa_recebimento(sender, instance, created, **kwargs):
    """
    Cria movimentação no fluxo de caixa quando conta é recebida
    """
    if instance.status == 'recebido' and instance.data_recebimento and not created:
        # Verifica se já existe movimentação
        existe = FluxoCaixa.objects.filter(conta_receber=instance).exists()
        
        if not existe:
            FluxoCaixa.objects.create(
                data=instance.data_recebimento,
                tipo='entrada',
                categoria=instance.categoria,
                descricao=f'Recebimento - {instance.descricao}',
                valor=instance.valor_recebido,
                conta_bancaria=instance.conta_bancaria,
                conta_receber=instance
            )
            
            # Atualiza saldo da conta bancária
            if instance.conta_bancaria:
                instance.conta_bancaria.saldo_atual += instance.valor_recebido
                instance.conta_bancaria.save(update_fields=['saldo_atual'])


@receiver(post_save, sender=ContaPagar)
def verificar_atraso_pagar(sender, instance, **kwargs):
    """
    Verifica e atualiza status de atraso
    """
    if instance.status == 'pendente':
        hoje = timezone.now().date()
        if instance.data_vencimento < hoje:
            instance.status = 'atrasado'
            instance.save(update_fields=['status'])


@receiver(post_save, sender=ContaReceber)
def verificar_atraso_receber(sender, instance, **kwargs):
    """
    Verifica e atualiza status de atraso
    """
    if instance.status == 'pendente':
        hoje = timezone.now().date()
        if instance.data_vencimento < hoje:
            instance.status = 'atrasado'
            instance.save(update_fields=['status'])
