"""
Signals for automatic stock updates
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MovimentacaoEstoque


@receiver(post_save, sender=MovimentacaoEstoque)
def atualizar_estoque_produto(sender, instance, created, **kwargs):
    """
    Atualiza o estoque do produto automaticamente após uma movimentação
    """
    if not created:
        return
    
    produto = instance.produto
    
    # Salva quantidade anterior
    instance.quantidade_anterior = produto.estoque_atual
    
    # Atualiza estoque baseado no tipo de movimentação
    if instance.tipo in ['entrada', 'ajuste']:
        if instance.tipo == 'ajuste':
            # Ajuste pode ser positivo ou negativo
            produto.estoque_atual = instance.quantidade
        else:
            # Entrada sempre adiciona
            produto.estoque_atual += instance.quantidade
    
    elif instance.tipo == 'saida':
        # Saída sempre subtrai
        produto.estoque_atual -= instance.quantidade
        if produto.estoque_atual < 0:
            produto.estoque_atual = 0
    
    elif instance.tipo == 'transferencia':
        # Transferência não altera quantidade total, apenas localização
        pass
    
    elif instance.tipo == 'inventario':
        # Inventário ajusta para a quantidade contada
        produto.estoque_atual = instance.quantidade
    
    # Salva quantidade nova
    instance.quantidade_nova = produto.estoque_atual
    
    # Salva produto e movimentação
    produto.save(update_fields=['estoque_atual'])
    MovimentacaoEstoque.objects.filter(pk=instance.pk).update(
        quantidade_anterior=instance.quantidade_anterior,
        quantidade_nova=instance.quantidade_nova
    )
