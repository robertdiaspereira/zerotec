"""
Serializers for CRM models
"""

from rest_framework import serializers
from .models import Funil, EtapaFunil, Oportunidade, Atividade, Interacao


class EtapaFunilSerializer(serializers.ModelSerializer):
    """Serializer for EtapaFunil"""
    
    total_oportunidades = serializers.SerializerMethodField()
    valor_total = serializers.SerializerMethodField()
    
    class Meta:
        model = EtapaFunil
        fields = [
            'id', 'funil', 'nome', 'descricao', 'ordem', 'cor',
            'probabilidade', 'is_inicial', 'is_ganho', 'is_perdido',
            'total_oportunidades', 'valor_total', 'active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_oportunidades(self, obj):
        return obj.oportunidades.filter(active=True).count()
    
    def get_valor_total(self, obj):
        from django.db.models import Sum
        return obj.oportunidades.filter(active=True).aggregate(
            total=Sum('valor_estimado')
        )['total'] or 0


class FunilSerializer(serializers.ModelSerializer):
    """Serializer for Funil"""
    
    etapas = EtapaFunilSerializer(many=True, read_only=True)
    total_oportunidades = serializers.SerializerMethodField()
    
    class Meta:
        model = Funil
        fields = [
            'id', 'nome', 'descricao', 'ordem', 'cor', 'etapas',
            'total_oportunidades', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_oportunidades(self, obj):
        return Oportunidade.objects.filter(funil=obj, active=True).count()


class OportunidadeSerializer(serializers.ModelSerializer):
    """Serializer for Oportunidade"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    etapa_nome = serializers.CharField(source='etapa.nome', read_only=True)
    etapa_cor = serializers.CharField(source='etapa.cor', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.get_full_name', read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    origem_display = serializers.CharField(source='get_origem_display', read_only=True)
    
    valor_ponderado = serializers.ReadOnlyField()
    dias_em_aberto = serializers.ReadOnlyField()
    status_prazo = serializers.ReadOnlyField()
    
    class Meta:
        model = Oportunidade
        fields = [
            'id', 'numero', 'titulo', 'descricao', 'cliente', 'cliente_nome',
            'nome_lead', 'email_lead', 'telefone_lead', 'funil', 'etapa',
            'etapa_nome', 'etapa_cor', 'valor_estimado', 'probabilidade',
            'valor_ponderado', 'produto', 'produto_nome', 'data_abertura',
            'data_fechamento_prevista', 'data_fechamento', 'responsavel',
            'responsavel_nome', 'origem', 'origem_display', 'motivo_perda',
            'dias_em_aberto', 'status_prazo', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'numero', 'valor_ponderado', 'dias_em_aberto', 'status_prazo',
            'created_at', 'updated_at'
        ]


class OportunidadeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing opportunities"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    etapa_nome = serializers.CharField(source='etapa.nome', read_only=True)
    etapa_cor = serializers.CharField(source='etapa.cor', read_only=True)
    valor_ponderado = serializers.ReadOnlyField()
    
    class Meta:
        model = Oportunidade
        fields = [
            'id', 'numero', 'titulo', 'cliente_nome', 'nome_lead',
            'etapa_nome', 'etapa_cor', 'valor_estimado', 'probabilidade',
            'valor_ponderado', 'data_fechamento_prevista'
        ]


class AtividadeSerializer(serializers.ModelSerializer):
    """Serializer for Atividade"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.get_full_name', read_only=True)
    oportunidade_titulo = serializers.CharField(source='oportunidade.titulo', read_only=True)
    
    class Meta:
        model = Atividade
        fields = [
            'id', 'oportunidade', 'oportunidade_titulo', 'tipo', 'tipo_display',
            'titulo', 'descricao', 'data_prevista', 'data_conclusao',
            'responsavel', 'responsavel_nome', 'status', 'status_display',
            'resultado', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InteracaoSerializer(serializers.ModelSerializer):
    """Serializer for Interacao"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    oportunidade_titulo = serializers.CharField(source='oportunidade.titulo', read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    
    class Meta:
        model = Interacao
        fields = [
            'id', 'oportunidade', 'oportunidade_titulo', 'cliente', 'cliente_nome',
            'tipo', 'tipo_display', 'assunto', 'descricao', 'data_interacao',
            'usuario', 'usuario_nome', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'data_interacao', 'created_at', 'updated_at']
