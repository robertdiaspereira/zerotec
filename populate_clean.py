"""
Script para popular o banco de dados com dados de teste
Execute: python populate_test_data.py
"""

import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth import get_user_model
from apps.erp.models import Cliente, Produto, Fornecedor
from apps.vendas.models import Venda, ItemVenda
from apps.assistencia.models import OrdemServico
from apps.financeiro.models import ContaPagar, ContaReceber, CategoriaDRE
from apps.compras.models import PedidoCompra

User = get_user_model()

def create_user():
    """Cria usurio admin se no existir"""
    print("Criando usurio admin...")
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
        print(" Usurio admin criado (senha: admin123)")
    else:
        print(" Usurio admin j existe")
    return user

def create_clientes():
    """Cria clientes de teste"""
    print("\n Criando clientes...")
    clientes_data = [
        {
            'nome_razao_social': 'Joo Silva',
            'tipo_pessoa': 'fisica',
            'cpf_cnpj': '123.456.789-00',
            'email': 'joao@email.com',
            'telefone': '(11) 98765-4321',
            'celular': '(11) 98765-4321',
            'endereco': 'Rua das Flores',
            'numero': '123',
            'bairro': 'Centro',
            'cidade': 'So Paulo',
            'estado': 'SP',
            'cep': '01234-567'
        },
        {
            'nome_razao_social': 'Maria Santos',
            'tipo_pessoa': 'fisica',
            'cpf_cnpj': '987.654.321-00',
            'email': 'maria@email.com',
            'telefone': '(11) 91234-5678',
            'celular': '(11) 91234-5678',
            'endereco': 'Av. Paulista',
            'numero': '1000',
            'bairro': 'Bela Vista',
            'cidade': 'So Paulo',
            'estado': 'SP',
            'cep': '01310-100'
        },
        {
            'nome_razao_social': 'Tech Solutions LTDA',
            'tipo_pessoa': 'juridica',
            'cpf_cnpj': '12.345.678/0001-90',
            'email': 'contato@techsolutions.com',
            'telefone': '(11) 3456-7890',
            'celular': '(11) 99876-5432',
            'endereco': 'Rua dos Desenvolvedores',
            'numero': '500',
            'bairro': 'Vila Olmpia',
            'cidade': 'So Paulo',
            'estado': 'SP',
            'cep': '04551-060'
        },
        {
            'nome_razao_social': 'Carlos Oliveira',
            'tipo_pessoa': 'fisica',
            'cpf_cnpj': '456.789.123-00',
            'email': 'carlos@email.com',
            'telefone': '(11) 95555-4444',
            'celular': '(11) 95555-4444',
            'endereco': 'Rua Augusta',
            'numero': '2000',
            'bairro': 'Consolao',
            'cidade': 'So Paulo',
            'estado': 'SP',
            'cep': '01304-001'
        },
        {
            'nome_razao_social': 'Ana Costa',
            'tipo_pessoa': 'fisica',
            'cpf_cnpj': '789.123.456-00',
            'email': 'ana@email.com',
            'telefone': '(11) 94444-3333',
            'celular': '(11) 94444-3333',
            'endereco': 'Rua Oscar Freire',
            'numero': '300',
            'bairro': 'Jardins',
            'cidade': 'So Paulo',
            'estado': 'SP',
            'cep': '01426-001'
        }
    ]
    
    clientes = []
    for data in clientes_data:
        cliente, created = Cliente.objects.get_or_create(
            cpf_cnpj=data['cpf_cnpj'],
            defaults=data
        )
        clientes.append(cliente)
        if created:
            print(f"   Cliente criado: {cliente.nome_razao_social}")
    
    return clientes

def create_produtos():
    """Cria produtos de teste"""
    print("\n Criando produtos...")
    produtos_data = [
        {
            'codigo': 'PROD001',
            'nome': 'Notebook Dell Inspiron 15',
            'descricao': 'Notebook Dell Inspiron 15, Intel i5, 8GB RAM, 256GB SSD',
            'categoria': 'Informtica',
            'unidade_medida': 'UN',
            'preco_custo': Decimal('2500.00'),
            'preco_venda': Decimal('3500.00'),
            'quantidade_estoque': 10,
            'estoque_minimo': 2,
            'estoque_maximo': 20
        },
        {
            'codigo': 'PROD002',
            'nome': 'Mouse Logitech MX Master 3',
            'descricao': 'Mouse sem fio Logitech MX Master 3',
            'categoria': 'Perifricos',
            'unidade_medida': 'UN',
            'preco_custo': Decimal('350.00'),
            'preco_venda': Decimal('499.00'),
            'quantidade_estoque': 25,
            'estoque_minimo': 5,
            'estoque_maximo': 50
        },
        {
            'codigo': 'PROD003',
            'nome': 'Teclado Mecnico Keychron K2',
            'descricao': 'Teclado mecnico sem fio Keychron K2',
            'categoria': 'Perifricos',
            'unidade_medida': 'UN',
            'preco_custo': Decimal('400.00'),
            'preco_venda': Decimal('599.00'),
            'quantidade_estoque': 15,
            'estoque_minimo': 3,
            'estoque_maximo': 30
        },
        {
            'codigo': 'PROD004',
            'nome': 'Monitor LG 27" 4K',
            'descricao': 'Monitor LG 27 polegadas 4K UHD',
            'categoria': 'Monitores',
            'unidade_medida': 'UN',
            'preco_custo': Decimal('1200.00'),
            'preco_venda': Decimal('1799.00'),
            'quantidade_estoque': 8,
            'estoque_minimo': 2,
            'estoque_maximo': 15
        },
        {
            'codigo': 'PROD005',
            'nome': 'SSD Samsung 1TB',
            'descricao': 'SSD Samsung 970 EVO Plus 1TB NVMe',
            'categoria': 'Armazenamento',
            'unidade_medida': 'UN',
            'preco_custo': Decimal('450.00'),
            'preco_venda': Decimal('699.00'),
            'quantidade_estoque': 30,
            'estoque_minimo': 10,
            'estoque_maximo': 50
        },
        {
            'codigo': 'SERV001',
            'nome': 'Manuteno de Notebook',
            'descricao': 'Servio de manuteno preventiva de notebook',
            'categoria': 'Servios',
            'unidade_medida': 'HR',
            'preco_custo': Decimal('50.00'),
            'preco_venda': Decimal('150.00'),
            'quantidade_estoque': 0,
            'estoque_minimo': 0,
            'estoque_maximo': 0
        },
        {
            'codigo': 'SERV002',
            'nome': 'Instalao de Software',
            'descricao': 'Servio de instalao e configurao de software',
            'categoria': 'Servios',
            'unidade_medida': 'HR',
            'preco_custo': Decimal('30.00'),
            'preco_venda': Decimal('100.00'),
            'quantidade_estoque': 0,
            'estoque_minimo': 0,
            'estoque_maximo': 0
        }
    ]
    
    produtos = []
    for data in produtos_data:
        produto, created = Produto.objects.get_or_create(
            codigo=data['codigo'],
            defaults=data
        )
        produtos.append(produto)
        if created:
            print(f"   Produto criado: {produto.nome}")
    
    return produtos

def create_vendas(user, clientes, produtos):
    """Cria vendas de teste nos ltimos 12 meses"""
    print("\n Criando vendas...")
    hoje = datetime.now()
    vendas_criadas = 0
    
    # Criar vendas para os ltimos 12 meses
    for mes_offset in range(12):
        # Nmero aleatrio de vendas por ms (entre 5 e 15)
        num_vendas = random.randint(5, 15)
        
        for _ in range(num_vendas):
            # Data aleatria no ms
            data_base = hoje - timedelta(days=30 * mes_offset)
            dia_aleatorio = random.randint(1, 28)
            data_venda = data_base.replace(day=dia_aleatorio)
            
            # Cliente aleatrio
            cliente = random.choice(clientes)
            
            # Criar venda
            venda = Venda.objects.create(
                cliente=cliente,
                vendedor=user,
                status='faturado',
                data_venda=data_venda
            )
            
            # Adicionar itens (1 a 3 produtos por venda)
            num_itens = random.randint(1, 3)
            valor_total = Decimal('0')
            
            for _ in range(num_itens):
                produto = random.choice([p for p in produtos if not p.codigo.startswith('SERV')])
                quantidade = random.randint(1, 3)
                
                ItemVenda.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=produto.preco_venda
                )
                
                valor_total += produto.preco_venda * quantidade
            
            # Aplicar desconto aleatrio (0% a 10%)
            desconto_percentual = random.uniform(0, 10)
            valor_desconto = valor_total * Decimal(str(desconto_percentual / 100))
            
            venda.valor_produtos = valor_total
            venda.valor_desconto = valor_desconto
            venda.save()
            
            vendas_criadas += 1
    
    print(f"   {vendas_criadas} vendas criadas")
    return vendas_criadas

def create_ordens_servico(user, clientes, produtos):
    """Cria ordens de servio de teste"""
    print("\n Criando ordens de servio...")
    hoje = datetime.now()
    os_criadas = 0
    
    status_choices = ['aberta', 'em_andamento', 'aguardando_pecas', 'concluida']
    prioridades = ['baixa', 'media', 'alta']
    
    # Criar OS para os ltimos 12 meses
    for mes_offset in range(12):
        num_os = random.randint(3, 10)
        
        for _ in range(num_os):
            data_base = hoje - timedelta(days=30 * mes_offset)
            dia_aleatorio = random.randint(1, 28)
            data_abertura = data_base.replace(day=dia_aleatorio)
            
            cliente = random.choice(clientes)
            status = random.choice(status_choices)
            
            # Servios
            servicos = [p for p in produtos if p.codigo.startswith('SERV')]
            servico = random.choice(servicos)
            valor_servico = servico.preco_venda * random.randint(1, 3)
            
            # Peas (opcional)
            usar_pecas = random.choice([True, False])
            valor_pecas = Decimal('0')
            if usar_pecas:
                peca = random.choice([p for p in produtos if not p.codigo.startswith('SERV')])
                valor_pecas = peca.preco_venda
            
            os = OrdemServico.objects.create(
                cliente=cliente,
                tecnico=user,
                equipamento=f"Notebook {random.choice(['Dell', 'HP', 'Lenovo', 'Acer'])}",
                marca=random.choice(['Dell', 'HP', 'Lenovo', 'Acer']),
                modelo=f"Model-{random.randint(100, 999)}",
                defeito_relatado="Equipamento no liga",
                diagnostico="Necessrio substituio de componente" if usar_pecas else "Limpeza e manuteno",
                solucao="Componente substitudo" if usar_pecas else "Limpeza realizada",
                status=status,
                prioridade=random.choice(prioridades),
                data_abertura=data_abertura,
                data_previsao=data_abertura + timedelta(days=random.randint(3, 7)),
                valor_servico=valor_servico,
                valor_pecas=valor_pecas
            )
            
            if status == 'concluida':
                os.data_conclusao = data_abertura + timedelta(days=random.randint(1, 5))
                os.save()
            
            os_criadas += 1
    
    print(f"   {os_criadas} ordens de servio criadas")
    return os_criadas

def create_categorias_dre():
    """Cria categorias DRE se no existirem"""
    print("\n Criando categorias DRE...")
    categorias_data = [
        {'codigo': '1', 'nome': 'Vendas de Produtos', 'tipo': 'receita'},
        {'codigo': '2', 'nome': 'Vendas de Mercadorias', 'tipo': 'receita'},
        {'codigo': '3', 'nome': 'Prestao de Servios', 'tipo': 'receita'},
        {'codigo': '11', 'nome': 'Despesas de Vendas', 'tipo': 'despesa'},
        {'codigo': '12', 'nome': 'Despesas Administrativas', 'tipo': 'despesa'},
        {'codigo': '13', 'nome': 'Salrios e Encargos', 'tipo': 'despesa'},
    ]
    
    for data in categorias_data:
        categoria, created = CategoriaDRE.objects.get_or_create(
            codigo=data['codigo'],
            defaults=data
        )
        if created:
            print(f"   Categoria DRE criada: {categoria.nome}")

def create_contas_financeiras():
    """Cria contas a pagar e receber"""
    print("\n Criando contas financeiras...")
    hoje = datetime.now()
    
    # Contas a Receber
    for i in range(20):
        dias_vencimento = random.randint(-30, 60)
        data_vencimento = hoje + timedelta(days=dias_vencimento)
        
        valor = Decimal(str(random.uniform(100, 5000))).quantize(Decimal('0.01'))
        status = 'recebido' if dias_vencimento < -10 else ('pendente' if dias_vencimento > 0 else random.choice(['pendente', 'recebido']))
        
        conta = ContaReceber.objects.create(
            descricao=f"Recebimento de cliente {i+1}",
            valor_original=valor,
            data_vencimento=data_vencimento,
            status=status
        )
        
        if status == 'recebido':
            conta.data_recebimento = data_vencimento - timedelta(days=random.randint(0, 5))
            conta.valor_recebido = valor
            conta.save()
    
    # Contas a Pagar
    for i in range(15):
        dias_vencimento = random.randint(-30, 60)
        data_vencimento = hoje + timedelta(days=dias_vencimento)
        
        valor = Decimal(str(random.uniform(200, 3000))).quantize(Decimal('0.01'))
        status = 'pago' if dias_vencimento < -10 else ('pendente' if dias_vencimento > 0 else random.choice(['pendente', 'pago']))
        
        conta = ContaPagar.objects.create(
            descricao=f"Pagamento fornecedor {i+1}",
            valor_original=valor,
            data_vencimento=data_vencimento,
            status=status
        )
        
        if status == 'pago':
            conta.data_pagamento = data_vencimento - timedelta(days=random.randint(0, 5))
            conta.valor_pago = valor
            conta.save()
    
    print(f"   Contas financeiras criadas")

def main():
    """Funo principal"""
    print("=" * 60)
    print(" POPULANDO BANCO DE DADOS COM DADOS DE TESTE")
    print("=" * 60)
    
    try:
        # Criar usurio
        user = create_user()
        
        # Criar clientes
        clientes = create_clientes()
        
        # Criar produtos
        produtos = create_produtos()
        
        # Criar categorias DRE
        create_categorias_dre()
        
        # Criar vendas
        create_vendas(user, clientes, produtos)
        
        # Criar ordens de servio
        create_ordens_servico(user, clientes, produtos)
        
        # Criar contas financeiras
        create_contas_financeiras()
        
        print("\n" + "=" * 60)
        print(" DADOS DE TESTE CRIADOS COM SUCESSO!")
        print("=" * 60)
        print("\n Resumo:")
        print(f"   Clientes: {Cliente.objects.count()}")
        print(f"   Produtos: {Produto.objects.count()}")
        print(f"   Vendas: {Venda.objects.count()}")
        print(f"   Ordens de Servio: {OrdemServico.objects.count()}")
        print(f"   Contas a Receber: {ContaReceber.objects.count()}")
        print(f"   Contas a Pagar: {ContaPagar.objects.count()}")
        print("\n Credenciais de acesso:")
        print("   Usurio: admin")
        print("   Senha: admin123")
        print("\n Acesse:")
        print("   Frontend: http://localhost:3000")
        print("   Admin: http://127.0.0.1:8000/admin")
        print("   API Docs: http://127.0.0.1:8000/api/docs")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n Erro ao criar dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
