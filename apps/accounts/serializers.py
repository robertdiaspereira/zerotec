"""
Serializers for authentication and user management
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Tenant, Domain

User = get_user_model()


from django.contrib.auth.models import Group

class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Group model"""
    can_manage_os = serializers.BooleanField(source='profile.can_manage_os', required=False)
    can_manage_vendas = serializers.BooleanField(source='profile.can_manage_vendas', required=False)
    can_manage_compras = serializers.BooleanField(source='profile.can_manage_compras', required=False)
    can_manage_financeiro = serializers.BooleanField(source='profile.can_manage_financeiro', required=False)
    can_view_relatorios = serializers.BooleanField(source='profile.can_view_relatorios', required=False)

    class Meta:
        model = Group
        fields = [
            'id', 'name', 
            'can_manage_os', 'can_manage_vendas', 'can_manage_compras',
            'can_manage_financeiro', 'can_view_relatorios'
        ]

    def update(self, instance, validated_data):
        profile_data = {}
        # Extract profile fields
        for field in ['can_manage_os', 'can_manage_vendas', 'can_manage_compras', 'can_manage_financeiro', 'can_view_relatorios']:
            # Check if field is in validated_data (it comes nested in 'profile' because of source='profile.field')
            # But DRF with source='profile.field' puts it in validated_data['profile']['field']
            if 'profile' in validated_data and field in validated_data['profile']:
                profile_data[field] = validated_data['profile'][field]
        
        # Remove profile data from validated_data to avoid errors in super().update
        if 'profile' in validated_data:
            del validated_data['profile']

        instance = super().update(instance, validated_data)
        
        # Update or create profile
        if profile_data:
            from .models import GroupProfile
            GroupProfile.objects.update_or_create(group=instance, defaults=profile_data)
            
        return instance


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        source='groups', 
        queryset=Group.objects.all(), 
        many=True, 
        write_only=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'is_superadmin', 'tenant', 'groups', 'group_ids',
            'can_manage_os', 'can_manage_vendas', 'can_manage_compras',
            'can_manage_financeiro', 'can_view_relatorios', 'is_active',
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
