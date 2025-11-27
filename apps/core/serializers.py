from rest_framework import serializers
from .models import Empresa, AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    user_details = UserMinimalSerializer(source='user', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'
