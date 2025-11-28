import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

User = get_user_model()
from apps.erp.models import Cliente, Fornecedor, Produto, Categoria, Servico
from apps.vendas.models import Venda, ItemVenda
from apps.compras.models import PedidoCompra, ItemPedidoCompra
from apps.financeiro.models import ContaBancaria, FormaRecebimento, FluxoCaixa, CategoriaFinanceira

def populate():
    print("🚀 Iniciando população do banco de dados...")

    # 1. Grupos e Permissões
    print("\n1️⃣ Configurando Grupos...")
    groups = {
        'Administrador': ['add_user', 'change_user', 'delete_user', 'view_user'],
        'Técnico': ['view_produto', 'change_produto', 'view_ordemservico', 'add_ordemservico', 'change_ordemservico'],
        'Vendedor': ['view_produto', 'view_cliente', 'add_cliente', 'change_cliente', 'view_venda', 'add_venda']
    }

    for name, perms in groups.items():
        group, created = Group.objects.get_or_create(name=name)
        if created:
            print(f"   ✅ Grupo '{name}' criado")
        else:
            print(f"   ℹ️ Grupo '{name}' já existe")

    # 2. Usuários
    print("\n2️⃣ Criando Usuários...")
    users = [
        ('admin', 'admin@zerotec.com', 'Administrador', True),
        ('vendedor', 'vendedor@zerotec.com', 'Vendedor', False),
        ('tecnico', 'tecnico@zerotec.com', 'Técnico', False)
    ]

    for username, email, group_name, is_super in users:
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username, email=email, password='123')
            user.first_name = username.capitalize()
            user.is_superuser = is_super
            user.is_staff = is_super
            user.save()
            
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
            print(f"   ✅ Usuário '{username}' criado (Senha: 123)")
        else:
            print(f"   ℹ️ Usuário '{username}' já existe")

    # 3. Categorias e Produtos
    print("\n3️⃣ Criando Produtos e Categorias...")
    categorias = ['Eletrônicos', 'Periféricos', 'Cabos', 'Serviços']
    cats_objs = []
    for cat in categorias:
        c, _ = Categoria.objects.get_or_create(nome=cat)
        cats_objs.append(c)

    produtos = [
        ('Notebook Dell', 3500.00, 10, 'Eletrônicos'),
        ('Mouse Logitech', 150.00, 50, 'Periféricos'),
        ('Teclado Mecânico', 350.00, 30, 'Periféricos'),
        ('Cabo HDMI 2m', 45.00, 100, 'Cabos'),
        ('Monitor Samsung 24"', 890.00, 15, 'Eletrônicos'),
        ('SSD 480GB', 220.00, 40, 'Eletrônicos'),
    ]

    for nome, preco, est, cat_name in produtos:
        cat = Categoria.objects.get(nome=cat_name)
        if not Produto.objects.filter(nome=nome).exists():
            Produto.objects.create(
                nome=nome,
                codigo_interno=f"PROD-{random.randint(1000, 9999)}",
                preco_venda=preco,
                preco_custo=preco * 0.6,
                estoque_atual=est,
                estoque_minimo=5,
                categoria=cat,
                unidade_medida='UN'
            )
            print(f"   ✅ Produto '{nome}' criado")

    # 4. Clientes e Fornecedores
    print("\n4️⃣ Criando Clientes e Fornecedores...")
    clientes = ['João Silva', 'Maria Oliveira', 'Empresa XYZ', 'Tech Solutions']
    for nome in clientes:
        if not Cliente.objects.filter(nome_razao_social=nome).exists():
            Cliente.objects.create(
                nome_razao_social=nome,
                email=f"{nome.lower().replace(' ', '')}@email.com",
                telefone_principal='11999999999',
                cpf_cnpj=f'{random.randint(10000000000, 99999999999)}'
            )
            print(f"   ✅ Cliente '{nome}' criado")

    fornecedores = ['Distribuidora Tech', 'Atacado Eletrônicos', 'Importadora Global']
    for nome in fornecedores:
        if not Fornecedor.objects.filter(nome_fantasia=nome).exists():
            Fornecedor.objects.create(
                nome_fantasia=nome,
                razao_social=f"{nome} LTDA",
                email=f"contato@{nome.lower().replace(' ', '')}.com",
                cnpj=f'{random.randint(10000000000000, 99999999999999)}',
                telefone_principal='11999999999'
            )
            print(f"   ✅ Fornecedor '{nome}' criado")

    # 5. Financeiro Básico
    print("\n5️⃣ Configurando Financeiro...")
    if not ContaBancaria.objects.exists():
        ContaBancaria.objects.create(
            banco="Banco do Brasil",
            agencia="1234",
            conta="56789-0",
            saldo_inicial=1000,
            saldo_atual=1000
        )
        print("   ✅ Conta 'Banco do Brasil' criada")

    formas = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto']
    for f in formas:
        if not FormaRecebimento.objects.filter(nome=f).exists():
            FormaRecebimento.objects.create(nome=f, ativo=True)
            print(f"   ✅ Forma '{f}' criada")

    # 6. Vendas de Teste
    print("\n6️⃣ Gerando Vendas de Teste...")
    vendedor = User.objects.get(username='vendedor')
    cliente = Cliente.objects.first()
    produto = Produto.objects.first()
    
    if not Venda.objects.exists():
        for i in range(5):
            venda = Venda.objects.create(
                cliente=cliente,
                vendedor=vendedor,
                status=random.choice(['orcamento', 'aprovado', 'faturado']),
                valor_total=0, # Será atualizado
                observacoes=f"Venda de teste {i+1}"
            )
            ItemVenda.objects.create(
                venda=venda,
                produto=produto,
                quantidade=random.randint(1, 3),
                preco_unitario=produto.preco_venda,
                subtotal=produto.preco_venda
            )
            venda.calcular_total()
            print(f"   ✅ Venda #{venda.id} criada ({venda.status})")

    print("\n🎉 População concluída com sucesso!")

if __name__ == '__main__':
    populate()
