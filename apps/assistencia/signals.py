"""
Signals for automatic service order updates
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import PecaOS, OrdemServico, OrcamentoOS, HistoricoOS
from apps.estoque.models import MovimentacaoEstoque


@receiver(post_save, sender=PecaOS)
@receiver(post_delete, sender=PecaOS)
def atualizar_valor_pecas_os(sender, instance, **kwargs):
    """
    Atualiza o valor das peças na OS quando peças são adicionadas/removidas
    """
    os = instance.os
    
    # Recalcula valor das peças
    os.valor_pecas = sum(peca.preco_total for peca in os.pecas.all())
    os.save()


@receiver(post_save, sender=PecaOS)
def criar_movimentacao_peca_aplicada(sender, instance, created, **kwargs):
    """
    Cria movimentação de saída quando peça é aplicada
    """
    if instance.aplicada and created:
        # Cria movimentação de saída no estoque
        MovimentacaoEstoque.objects.create(
            produto=instance.produto,
            tipo='saida',
            quantidade=instance.quantidade,
            valor_unitario=instance.preco_unitario,
            documento='os',
            documento_numero=instance.os.numero,
            motivo=f'Peça aplicada na OS {instance.os.numero}',
            usuario=instance.os.tecnico
        )


@receiver(post_save, sender=OrcamentoOS)
def atualizar_os_orcamento_aprovado(sender, instance, created, **kwargs):
    """
    Atualiza OS quando orçamento é aprovado
    """
    if instance.status == 'aprovado' and not created:
        os = instance.os
        
        # Atualiza valores da OS
        os.valor_servico = instance.valor_servico
        os.valor_pecas = instance.valor_pecas
        os.status = 'aprovada'
        os.data_aprovacao = timezone.now()
        os.save()
        
        # Registra no histórico
        HistoricoOS.objects.create(
            os=os,
            usuario=os.tecnico,
            acao='Orçamento Aprovado',
            descricao=f'Orçamento de R$ {instance.valor_total} aprovado'
        )


@receiver(post_save, sender=OrdemServico)
def registrar_mudanca_status(sender, instance, created, **kwargs):
    """
    Registra mudanças de status no histórico
    """
    if not created:
        # Verifica se houve mudança de status
        try:
            os_anterior = OrdemServico.objects.get(pk=instance.pk)
            if os_anterior.status != instance.status:
                HistoricoOS.objects.create(
                    os=instance,
                    usuario=instance.tecnico,
                    acao='Mudança de Status',
                    descricao=f'Status alterado de {os_anterior.get_status_display()} para {instance.get_status_display()}'
                )
        except OrdemServico.DoesNotExist:
            pass
    else:
        # Registra abertura da OS
        HistoricoOS.objects.create(
            os=instance,
            usuario=instance.tecnico,
            acao='OS Aberta',
            descricao=f'Ordem de serviço aberta para {instance.equipamento}'
        )
