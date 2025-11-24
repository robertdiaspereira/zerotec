"""
Signals for CRM automatic updates
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Oportunidade, Atividade, EtapaFunil, Interacao


@receiver(pre_save, sender=Oportunidade)
def registrar_mudanca_etapa(sender, instance, **kwargs):
    """
    Registra mudança de etapa como interação
    """
    if instance.pk:
        try:
            oportunidade_antiga = Oportunidade.objects.get(pk=instance.pk)
            if oportunidade_antiga.etapa != instance.etapa:
                # Criar interação automática
                Interacao.objects.create(
                    oportunidade=instance,
                    cliente=instance.cliente,
                    tipo='nota',
                    assunto=f'Mudança de Etapa',
                    descricao=f'Etapa alterada de "{oportunidade_antiga.etapa.nome}" para "{instance.etapa.nome}"',
                    usuario=None  # Sistema
                )
                
                # Se ganhou, registrar data de fechamento
                if instance.etapa.is_ganho and not instance.data_fechamento:
                    from django.utils import timezone
                    instance.data_fechamento = timezone.now().date()
                
                # Se perdeu, registrar data de fechamento
                if instance.etapa.is_perdido and not instance.data_fechamento:
                    from django.utils import timezone
                    instance.data_fechamento = timezone.now().date()
        except Oportunidade.DoesNotExist:
            pass


@receiver(post_save, sender=Atividade)
def criar_interacao_atividade(sender, instance, created, **kwargs):
    """
    Cria interação quando atividade é concluída
    """
    if instance.status == 'concluida' and instance.resultado:
        # Verificar se já existe interação para esta atividade
        existe = Interacao.objects.filter(
            oportunidade=instance.oportunidade,
            assunto=f'Atividade: {instance.titulo}'
        ).exists()
        
        if not existe:
            Interacao.objects.create(
                oportunidade=instance.oportunidade,
                cliente=instance.oportunidade.cliente,
                tipo=instance.tipo,
                assunto=f'Atividade: {instance.titulo}',
                descricao=instance.resultado,
                usuario=instance.responsavel
            )
