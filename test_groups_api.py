"""
Script para testar a API de grupos diretamente
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_groups_api():
    print("🧪 Testando API de grupos...")
    
    # Pegar usuário admin
    try:
        admin = User.objects.get(username='admin')
        print(f"✅ Usuário admin encontrado (ID: {admin.id})")
        print(f"   - É superuser: {admin.is_superuser}")
        print(f"   - É staff: {admin.is_staff}")
        print(f"   - Grupos: {[g.name for g in admin.groups.all()]}")
    except User.DoesNotExist:
        print("❌ Usuário admin não encontrado")
        return
    
    # Gerar token JWT para o admin
    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    print(f"\n🔑 Token gerado: {access_token[:50]}...")
    
    # Criar cliente API
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    # Testar endpoint de grupos
    print("\n📡 Fazendo requisição para /api/auth/groups/...")
    response = client.get('/api/auth/groups/')
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Sucesso! Grupos retornados:")
        data = response.json()
        if 'results' in data:
            for group in data['results']:
                print(f"      - {group.get('name')} (ID: {group.get('id')})")
        elif isinstance(data, list):
            for group in data:
                print(f"      - {group.get('name')} (ID: {group.get('id')})")
    else:
        print(f"   ❌ Erro! Resposta:")
        print(f"   {response.json()}")
    
    # Listar grupos no banco
    print("\n📋 Grupos no banco de dados:")
    for group in Group.objects.all():
        print(f"   - {group.name} (ID: {group.id})")
        perms = group.permissions.all()
        print(f"     Permissões: {[p.codename for p in perms]}")

if __name__ == '__main__':
    test_groups_api()
