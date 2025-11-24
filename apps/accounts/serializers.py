"""
Serializers for authentication and user management
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tenant, Domain

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'is_superadmin', 'tenant',
            'can_manage_os', 'can_manage_vendas', 'can_manage_compras',
            'can_manage_financeiro', 'can_view_relatorios',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_superadmin']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    tenant_name = serializers.CharField(write_only=True, max_length=200)
    tenant_cnpj = serializers.CharField(write_only=True, max_length=18, required=False)
    domain = serializers.CharField(write_only=True, max_length=100)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone',
            'tenant_name', 'tenant_cnpj', 'domain'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem")
        
        # Validate domain format (subdomain)
        domain = data['domain']
        if not domain.replace('-', '').replace('_', '').isalnum():
            raise serializers.ValidationError("Domínio inválido. Use apenas letras, números, - e _")
        
        # Check if domain already exists
        if Domain.objects.filter(domain=f"{domain}.localhost").exists():
            raise serializers.ValidationError("Este domínio já está em uso")
        
        return data
    
    def create(self, validated_data):
        # Extract tenant data
        tenant_name = validated_data.pop('tenant_name')
        tenant_cnpj = validated_data.pop('tenant_cnpj', None)
        domain_name = validated_data.pop('domain')
        password_confirm = validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create tenant
        tenant = Tenant.objects.create(
            schema_name=domain_name,
            name=tenant_name,
            cnpj=tenant_cnpj
        )
        
        # Create domain
        Domain.objects.create(
            domain=f"{domain_name}.localhost",  # In production: {domain_name}.yourdomain.com
            tenant=tenant,
            is_primary=True
        )
        
        # Create user
        user = User.objects.create_user(
            **validated_data,
            password=password,
            tenant=tenant,
            is_staff=True  # First user is admin of their tenant
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem")
        return data
