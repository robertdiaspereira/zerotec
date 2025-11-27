"""
Serializers for Assistencia models
"""

from rest_framework import serializers
from .models import (
    OrdemServico, PecaOS, OrcamentoOS, HistoricoOS, RecebimentoOS,
    ServicoTemplate, ChecklistItem, TermoGarantia, OSAnexo, CategoriaServico
)


class CategoriaServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaServico
        fields = '__all__'


class ServicoTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicoTemplate
        fields = '__all__'


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = '__all__'


class TermoGarantiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TermoGarantia
        fields = '__all__'


class OSAnexoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OSAnexo
        fields = '__all__'


class PecaOSSerializer(serializers.ModelSerializer):
    """Serializer for PecaOS"""
    
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_codigo = serializers.CharField(source='produto.codigo_interno', read_only=True)
    
    class Meta:
        model = PecaOS
        fields = [
            'id', 'os', 'produto', 'produto_nome', 'produto_codigo',
            'quantidade', 'preco_unitario', 'preco_total', 'aplicada'
        ]
        read_only_fields = ['id', 'preco_total']


class OrcamentoOSSerializer(serializers.ModelSerializer):
    """Serializer for OrcamentoOS"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OrcamentoOS
        fields = [
            'id', 'os', 'descricao_servico', 'valor_servico',
            'valor_pecas', 'valor_total', 'prazo_dias', 'validade_dias',
            'status', 'status_display', 'data_aprovacao', 'observacoes',
            'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'valor_total', 'data_aprovacao', 'created_at', 'updated_at']


class HistoricoOSSerializer(serializers.ModelSerializer):
    """Serializer for HistoricoOS"""
    
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = HistoricoOS
        fields = [
            'id', 'os', 'usuario', 'usuario_nome', 'data', 'acao', 'descricao'
        ]
        read_only_fields = ['id', 'data']


class RecebimentoOSSerializer(serializers.ModelSerializer):
    """Serializer for RecebimentoOS"""
    
    forma_recebimento_nome = serializers.CharField(source='forma_recebimento.nome', read_only=True)
    forma_recebimento_tipo = serializers.CharField(source='forma_recebimento.get_tipo_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = RecebimentoOS
        fields = [
            'id', 'os', 'forma_recebimento', 'forma_recebimento_nome', 
            'forma_recebimento_tipo', 'valor_bruto', 'taxa_percentual', 'taxa_fixa',
            'valor_taxa_total', 'valor_liquido', 'parcelas', 'data_vencimento',
            'data_recebimento', 'data_prevista_recebimento', 'status', 
            'status_display', 'observacoes', 'created_at'
        ]
        read_only_fields = [
            'id', 'taxa_percentual', 'taxa_fixa', 'valor_taxa_total', 
            'valor_liquido', 'data_prevista_recebimento', 'created_at'
        ]


class OrdemServicoSerializer(serializers.ModelSerializer):
    """Serializer for OrdemServico"""
    
    pecas = PecaOSSerializer(many=True, read_only=True)
    orcamentos = OrcamentoOSSerializer(many=True, read_only=True)
    historico = HistoricoOSSerializer(many=True, read_only=True)
    recebimentos = RecebimentoOSSerializer(many=True, read_only=True)
    anexos = OSAnexoSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    tecnico_nome = serializers.CharField(source='tecnico.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    total_pecas = serializers.ReadOnlyField()
    em_garantia = serializers.ReadOnlyField()
    dias_aberta = serializers.ReadOnlyField()
    
    class Meta:
        model = OrdemServico
        fields = [
            'id', 'numero', 'cliente', 'cliente_nome', 'equipamento', 'marca',
            'modelo', 'numero_serie', 'acessorios', 'defeito_relatado',
            'observacoes_cliente', 'diagnostico', 'solucao', 'data_abertura',
            'data_previsao', 'data_conclusao', 'data_entrega', 'status',
            'status_display', 'prioridade', 'prioridade_display', 'valor_servico',
            'valor_pecas', 'valor_desconto', 'valor_total', 'garantia_dias',
            'data_fim_garantia', 'tecnico', 'tecnico_nome', 'observacoes_internas',
            'pecas', 'orcamentos', 'historico', 'recebimentos', 'anexos', 
            'total_pecas', 'em_garantia', 'dias_aberta', 'active', 
            'created_at', 'updated_at', 'checklist', 'obs_recebimento', 
            'laudo_tecnico', 'valor_frete', 'protocolo_entrega'
        ]
        read_only_fields = [
            'id', 'numero', 'data_abertura', 'data_conclusao', 'data_entrega',
            'valor_pecas', 'valor_total', 'data_fim_garantia', 'created_at',
            'updated_at', 'total_pecas', 'em_garantia', 'dias_aberta'
        ]
    
    def create(self, validated_data):
        """Add current user as tecnico"""
        # Only set tecnico if not provided
        if 'tecnico' not in validated_data:
            validated_data['tecnico'] = self.context['request'].user
        return super().create(validated_data)


class OrdemServicoListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing service orders"""
    
    cliente_nome = serializers.CharField(source='cliente.nome_razao_social', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    prioridade_display = serializers.CharField(source='get_prioridade_display', read_only=True)
    
    class Meta:
        model = OrdemServico
        fields = [
            'id', 'numero', 'cliente_nome', 'equipamento', 'data_abertura',
            'data_previsao', 'status', 'status_display', 'prioridade',
            'prioridade_display', 'valor_total'
        ]
