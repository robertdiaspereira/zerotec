"""
Script simples para popular dados de teste
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from apps.erp.models import Cliente, Produto
from apps.vendas.models import Venda, ItemVenda
from apps.assistencia.models import OrdemServico
from decimal import Decimal
from datetime import datetime, timedelta
import random

User = get_user_model()

print("=" * 60)
print("POPULANDO BANCO DE DADOS")
print("=" * 60)

# Criar usuario admin
user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@zerotec.com',
        'first_name': 'Admin',
        'last_name': 'ZeroTec',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    user.set_password('admin123')
    user.save()
    print("Usuario admin criado (senha: admin123)")
else:
    print("Usuario admin ja existe")

# Criar clientes
print("\nCriando clientes...")
clientes_data = [
    {'nome_razao_social': 'Joao Silva', 'tipo': 'pf', 'cpf_cnpj': '12345678900', 'telefone_principal': '11987654321', 'email': 'joao@email.com'},
    {'nome_razao_social': 'Maria Santos', 'tipo': 'pf', 'cpf_cnpj': '98765432100', 'telefone_principal': '11912345678', 'email': 'maria@email.com'},
    {'nome_razao_social': 'Tech Solutions LTDA', 'tipo': 'pj', 'cpf_cnpj': '12345678000190', 'telefone_principal': '1134567890', 'email': 'contato@tech.com'},
]

clientes = []
for data in clientes_data:
    cliente, created = Cliente.objects.get_or_create(cpf_cnpj=data['cpf_cnpj'], defaults=data)
    clientes.append(cliente)
    if created:
        print(f"  Cliente criado: {cliente.nome_razao_social}")

# Criar produtos
print("\nCriando produtos...")
produtos_data = [
    {'codigo_interno': 'PROD001', 'nome': 'Notebook Dell', 'preco_custo': Decimal('2500'), 'preco_venda': Decimal('3500'), 'estoque_atual': 10},
    {'codigo_interno': 'PROD002', 'nome': 'Mouse Logitech', 'preco_custo': Decimal('350'), 'preco_venda': Decimal('499'), 'estoque_atual': 25},
    {'codigo_interno': 'PROD003', 'nome': 'Teclado Mecanico', 'preco_custo': Decimal('400'), 'preco_venda': Decimal('599'), 'estoque_atual': 15},
    {'codigo_interno': 'SERV001', 'nome': 'Manutencao Notebook', 'tipo': 'servico', 'preco_custo': Decimal('50'), 'preco_venda': Decimal('150'), 'estoque_atual': 0},
]

produtos = []
for data in produtos_data:
    produto, created = Produto.objects.get_or_create(codigo_interno=data['codigo_interno'], defaults=data)
    produtos.append(produto)
    if created:
        print(f"  Produto criado: {produto.nome}")

# Criar vendas
print("\nCriando vendas...")
hoje = datetime.now()
for mes_offset in range(12):
    for _ in range(random.randint(5, 10)):
        data_venda = hoje - timedelta(days=30 * mes_offset + random.randint(1, 28))
        cliente = random.choice(clientes)
        
        venda = Venda.objects.create(
            cliente=cliente,
            vendedor=user,
            status='faturado',
            data_venda=data_venda
        )
        
        # Adicionar itens
        for _ in range(random.randint(1, 2)):
            produto = random.choice([p for p in produtos if p.tipo == 'produto'])
            ItemVenda.objects.create(
                venda=venda,
                produto=produto,
                quantidade=random.randint(1, 2),
                preco_unitario=produto.preco_venda
            )
        
        venda.valor_produtos = sum(item.preco_total for item in venda.itens.all())
        venda.save()

print(f"  {Venda.objects.count()} vendas criadas")

# Criar OS
print("\nCriando ordens de servico...")
for mes_offset in range(12):
    for _ in range(random.randint(3, 7)):
        data_abertura = hoje - timedelta(days=30 * mes_offset + random.randint(1, 28))
        cliente = random.choice(clientes)
        
        OrdemServico.objects.create(
            cliente=cliente,
            tecnico=user,
            equipamento="Notebook Dell",
            marca="Dell",
            modelo="Inspiron",
            defeito_relatado="Nao liga",
            status=random.choice(['aberta', 'em_andamento', 'concluida']),
            prioridade=random.choice(['baixa', 'media', 'alta']),
            data_abertura=data_abertura,
            valor_servico=Decimal('150'),
            valor_pecas=Decimal('0')
        )

print(f"  {OrdemServico.objects.count()} OS criadas")

print("\n" + "=" * 60)
print("DADOS CRIADOS COM SUCESSO!")
print("=" * 60)
print(f"\nResumo:")
print(f"  Clientes: {Cliente.objects.count()}")
print(f"  Produtos: {Produto.objects.count()}")
print(f"  Vendas: {Venda.objects.count()}")
print(f"  OS: {OrdemServico.objects.count()}")
print(f"\nCredenciais:")
print(f"  Usuario: admin")
print(f"  Senha: admin123")
print(f"\nAcesse: http://localhost:3000")
print("=" * 60)
