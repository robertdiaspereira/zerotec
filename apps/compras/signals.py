"""
Signals for automatic purchase updates
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ItemRecebimento, ItemPedidoCompra
from apps.estoque.models import MovimentacaoEstoque


@receiver(post_save, sender=ItemRecebimento)
def atualizar_quantidade_recebida(sender, instance, created, **kwargs):
    """
    Atualiza quantidade recebida no item do pedido e cria movimentação de estoque
    """
    if not created:
        return
    
    # Atualiza quantidade recebida no item do pedido
    item_pedido = instance.item_pedido
    item_pedido.quantidade_recebida += instance.quantidade
    item_pedido.save(update_fields=['quantidade_recebida'])
    
    # Cria movimentação de entrada no estoque
    MovimentacaoEstoque.objects.create(
        produto=item_pedido.produto,
        tipo='entrada',
        quantidade=instance.quantidade,
        valor_unitario=item_pedido.preco_unitario,
        lote=instance.lote,
        data_validade=instance.data_validade,
        documento='nota_fiscal',
        documento_numero=instance.recebimento.nota_fiscal,
        motivo=f'Recebimento do pedido {item_pedido.pedido.numero}',
        usuario=instance.recebimento.recebedor
    )
    
    # Verifica se o pedido foi totalmente recebido
    pedido = item_pedido.pedido
    todos_recebidos = all(
        item.quantidade_recebida >= item.quantidade_pedida
        for item in pedido.itens.all()
    )
    
    if todos_recebidos and pedido.status != 'recebido':
        pedido.status = 'recebido'
        pedido.save(update_fields=['status'])
