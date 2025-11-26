"""
Serializers for ERP models
"""

from rest_framework import serializers
from .models import Categoria, Cliente, Fornecedor, Produto, Servico


class CategoriaSerializer(serializers.ModelSerializer):
    """Serializer for Categoria"""
    
    total_produtos = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = [
            'id', 'nome', 'tipo', 'descricao', 'active',
            'total_produtos', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_produtos(self, obj):
        return obj.produtos.filter(active=True).count()


class ClienteSerializer(serializers.ModelSerializer):
    """Serializer for Cliente"""
    
    total_vendas = serializers.ReadOnlyField()
    total_os = serializers.ReadOnlyField()
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'tipo', 'tipo_display', 'nome_razao_social', 'nome_fantasia',
            'cpf_cnpj', 'rg_ie', 'telefone_principal', 'telefone_secundario',
            'email', 'data_nascimento', 'cep', 'logradouro', 'numero',
            'complemento', 'bairro', 'cidade', 'estado', 'observacoes',
            'active', 'total_vendas', 'total_os', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_vendas', 'total_os']
    
    def validate_cpf_cnpj(self, value):
        """Remove formatação do CPF/CNPJ"""
        return ''.join(filter(str.isdigit, value))


class ClienteListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing clients"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'tipo', 'tipo_display', 'nome_razao_social',
            'cpf_cnpj', 'telefone_principal', 'email', 'cidade', 'active'
        ]


class FornecedorSerializer(serializers.ModelSerializer):
    """Serializer for Fornecedor"""
    
    total_compras = serializers.ReadOnlyField()
    
    class Meta:
        model = Fornecedor
        fields = [
            'id', 'razao_social', 'nome_fantasia', 'cnpj', 'ie',
            'telefone_principal', 'telefone_secundario', 'email',
            'contato_nome', 'contato_cargo', 'cep', 'logradouro',
            'numero', 'complemento', 'bairro', 'cidade', 'estado',
            'observacoes', 'active', 'total_compras', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_compras']
    
    def validate_cnpj(self, value):
        """Remove formatação do CNPJ"""
        return ''.join(filter(str.isdigit, value))


class FornecedorListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing suppliers"""
    
    class Meta:
        model = Fornecedor
        fields = [
            'id', 'razao_social', 'nome_fantasia', 'cnpj',
            'telefone_principal', 'email', 'cidade', 'active'
        ]


class ProdutoSerializer(serializers.ModelSerializer):
    """Serializer for Produto"""
    
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    unidade_display = serializers.CharField(source='get_unidade_medida_display', read_only=True)
    estoque_baixo = serializers.ReadOnlyField()
    valor_estoque = serializers.ReadOnlyField()
    
    class Meta:
        model = Produto
        fields = [
            'id', 'tipo', 'tipo_display', 'nome', 'descricao', 'categoria',
            'categoria_nome', 'codigo_interno', 'codigo_barras', 'ncm',
            'unidade_medida', 'unidade_display', 'preco_custo', 'preco_venda',
            'margem_lucro', 'estoque_atual', 'estoque_minimo', 'estoque_maximo',
            'localizacao', 'controla_lote', 'controla_validade', 'imagem',
            'active', 'estoque_baixo', 'valor_estoque', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'margem_lucro', 'created_at', 'updated_at', 'estoque_baixo', 'valor_estoque']


class ProdutoListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing products"""
    
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estoque_baixo = serializers.ReadOnlyField()
    
    class Meta:
        model = Produto
        fields = [
            'id', 'tipo', 'tipo_display', 'codigo_interno', 'nome',
            'categoria_nome', 'preco_venda', 'estoque_atual',
            'estoque_minimo', 'estoque_baixo', 'active'
        ]


class ProdutoImportSerializer(serializers.Serializer):
    """Serializer for importing products from CSV/Excel"""
    
    file = serializers.FileField()
    
    def validate_file(self, value):
        """Validate file extension"""
        import os
        ext = os.path.splitext(value.name)[1].lower()
        
        if ext not in ['.csv', '.xlsx', '.xls']:
            raise serializers.ValidationError('Apenas arquivos CSV ou Excel são permitidos')
        
        return value


class ServicoSerializer(serializers.ModelSerializer):
    """Serializer for Servico"""
    
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    
    class Meta:
        model = Servico
        fields = [
            'id', 'nome', 'descricao', 'categoria', 'categoria_nome',
            'codigo_interno', 'preco_custo', 'preco_venda', 'margem_lucro',
            'tempo_estimado', 'active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'margem_lucro', 'created_at', 'updated_at']


class ServicoListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing services"""
    
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    
    class Meta:
        model = Servico
        fields = [
            'id', 'codigo_interno', 'nome', 'categoria_nome',
            'preco_venda', 'tempo_estimado', 'active'
        ]

