# tests_api.py
"""API tests for PDV and basic CRUD using Django's test runner.
Run with: `python manage.py test apps.vendas`.
"""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123'
    )
    return user

@pytest.fixture
def auth_token(api_client, admin_user):
    url = reverse('token_obtain_pair')
    response = api_client.post(url, {'username': 'admin', 'password': 'adminpass123'}, format='json')
    assert response.status_code == status.HTTP_200_OK
    return response.data['access']

def test_authentication_required(api_client):
    url = reverse('cliente-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_token(auth_token):
    assert isinstance(auth_token, str)

def test_create_cliente(api_client, auth_token, db):
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
    url = reverse('cliente-list')
    payload = {
        'tipo': 'pf',
        'nome_razao_social': 'Cliente Teste',
        'cpf_cnpj': '12345678901',
        'telefone_principal': '11999999999',
        'email': 'cliente@test.com'
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nome_razao_social'] == 'Cliente Teste'

def test_create_produto(api_client, auth_token, db):
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
    url = reverse('produto-list')
    payload = {
        'tipo': 'produto',
        'nome': 'Produto X',
        'codigo_interno': 'PRODX001',
        'preco_custo': '10.00',
        'preco_venda': '15.00',
        'estoque_atual': '100',
        'unidade_medida': 'UN'
    }
    response = api_client.post(url, payload, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['nome'] == 'Produto X'

def test_pdv_buscar_produto(api_client, auth_token, db):
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
    prod_url = reverse('produto-list')
    prod_payload = {
        'tipo': 'produto',
        'nome': 'Produto Barcode',
        'codigo_interno': 'BAR001',
        'codigo_barras': '1234567890123',
        'preco_custo': '5.00',
        'preco_venda': '8.00',
        'estoque_atual': '50',
        'unidade_medida': 'UN'
    }
    prod_resp = api_client.post(prod_url, prod_payload, format='json')
    assert prod_resp.status_code == status.HTTP_201_CREATED
    buscar_url = reverse('pdv-buscar_produto')
    response = api_client.get(buscar_url, {'codigo': '1234567890123'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['codigo_barras'] == '1234567890123'

def test_pdv_finalizar_venda(api_client, auth_token, db):
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {auth_token}')
    prod_url = reverse('produto-list')
    prod_payload = {
        'tipo': 'produto',
        'nome': 'Produto Venda',
        'codigo_interno': 'VENDA001',
        'preco_custo': '20.00',
        'preco_venda': '30.00',
        'estoque_atual': '10',
        'unidade_medida': 'UN'
    }
    prod_resp = api_client.post(prod_url, prod_payload, format='json')
    assert prod_resp.status_code == status.HTTP_201_CREATED
    produto_id = prod_resp.data['id']
    abrir_url = reverse('pdv-abrir')
    abrir_resp = api_client.post(abrir_url, {'valor_inicial': 100, 'numero_caixa': 1}, format='json')
    assert abrir_resp.status_code == status.HTTP_201_CREATED
    pdv_id = abrir_resp.data['id']
    finalizar_url = reverse('pdv-finalizar_venda', args=[pdv_id])
    payload = {
        'itens': [
            {'produto_id': produto_id, 'quantidade': 2, 'preco': '30.00'}
        ],
        'cliente_id': None,
        'forma_pagamento': 'dinheiro',
        'desconto': 0,
        'valor_recebido': 60
    }
    resp = api_client.post(finalizar_url, payload, format='json')
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data['valor_total'] == 60
    prod_detail = api_client.get(reverse('produto-detail', args=[produto_id]))
    assert prod_detail.status_code == status.HTTP_200_OK
    assert float(prod_detail.data['estoque_atual']) == 8.0
