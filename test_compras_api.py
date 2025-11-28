"""
Script para testar a API de compras diretamente
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings

User = get_user_model()

def test_compras_api():
    print("🧪 Testando API de compras...")
    print(f"   REST_FRAMEWORK config: {getattr(settings, 'REST_FRAMEWORK', 'NOT FOUND')}")
    
    # Pegar usuário admin
    try:
        admin = User.objects.get(username='admin')
        print(f"✅ Usuário admin encontrado (ID: {admin.id})")
    except User.DoesNotExist:
        print("❌ Usuário admin não encontrado")
        return
    
    # Gerar token JWT
    refresh = RefreshToken.for_user(admin)
    access_token = str(refresh.access_token)
    
    # Criar cliente API
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    # Testar endpoint de pedidos
    print("\n📡 Fazendo requisição para /api/compras/pedidos/...")
    response = client.get('/api/compras/pedidos/')
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Sucesso! Pedidos retornados:")
        data = response.json()
        if 'results' in data:
            print(f"      Total: {data['count']}")
            for pedido in data['results']:
                print(f"      - {pedido.get('numero')} (ID: {pedido.get('id')})")
        elif isinstance(data, list):
            print(f"      Total: {len(data)}")
    else:
        print(f"   ❌ Erro! Resposta:")
        print(f"   {response.json()}")

if __name__ == '__main__':
    test_compras_api()
