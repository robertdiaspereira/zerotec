"""
Signals for automatic sales updates
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ItemVenda, Venda, MovimentoPDV
from apps.estoque.models import MovimentacaoEstoque


@receiver(post_save, sender=ItemVenda)
@receiver(post_delete, sender=ItemVenda)
def atualizar_valor_venda(sender, instance, **kwargs):
    """
    Atualiza o valor total da venda quando itens são adicionados/removidos
    """
    venda = instance.venda
    
    # Recalcula valor dos produtos
    venda.valor_produtos = sum(item.preco_total for item in venda.itens.all())
    venda.save()


@receiver(post_save, sender=Venda)
def criar_movimentacao_estoque_venda(sender, instance, created, **kwargs):
    """
    Cria movimentação de saída no estoque quando venda é faturada
    """
    # Só cria movimentação se a venda foi faturada
    if instance.status == 'faturado' and not created:
        # Verifica se já existe movimentação para esta venda
        for item in instance.itens.all():
            # Verifica se já criou movimentação para este item
            existe = MovimentacaoEstoque.objects.filter(
                produto=item.produto,
                documento='venda',
                documento_numero=instance.numero
            ).exists()
            
            if not existe:
                # Cria movimentação de saída
                MovimentacaoEstoque.objects.create(
                    produto=item.produto,
                    tipo='saida',
                    quantidade=item.quantidade,
                    valor_unitario=item.preco_unitario,
                    documento='venda',
                    documento_numero=instance.numero,
                    motivo=f'Venda {instance.numero}',
                    usuario=instance.vendedor
                )


@receiver(post_save, sender=MovimentoPDV)
def atualizar_valores_pdv(sender, instance, created, **kwargs):
    """
    Atualiza valores do PDV quando há movimentos
    """
    if not created:
        return
    
    pdv = instance.pdv
    
    if instance.tipo == 'venda':
        pdv.valor_vendas += instance.valor
    elif instance.tipo == 'sangria':
        pdv.valor_sangrias += instance.valor
    elif instance.tipo == 'suprimento':
        pdv.valor_suprimentos += instance.valor
    
    pdv.save(update_fields=['valor_vendas', 'valor_sangrias', 'valor_suprimentos'])
