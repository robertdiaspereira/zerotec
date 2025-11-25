"""
Script de Teste da API - ZeroTec ERP
Testa todos os endpoints principais da API
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}[OK] {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}[ERRO] {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}[INFO] {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[AVISO] {msg}{Colors.END}")

def test_endpoint(method, endpoint, data=None, expected_status=200, description=""):
    """Testa um endpoint da API"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        elif method == "DELETE":
            response = requests.delete(url)
        
        if response.status_code == expected_status:
            print_success(f"{method} {endpoint} - {description}")
            return True, response
        else:
            print_error(f"{method} {endpoint} - Status {response.status_code} (esperado {expected_status})")
            return False, response
    except Exception as e:
        print_error(f"{method} {endpoint} - Erro: {str(e)}")
        return False, None

def main():
    print("\n" + "="*80)
    print(f"{Colors.BLUE}TESTE DA API - ZEROTEC ERP{Colors.END}")
    print("="*80 + "\n")
    
    total_tests = 0
    passed_tests = 0
    
    # 1. Teste de Documentação
    print(f"\n{Colors.YELLOW}1. DOCUMENTACAO{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/docs/", expected_status=200, description="Swagger UI")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/schema/", expected_status=200, description="OpenAPI Schema")
    total_tests += 1
    if success: passed_tests += 1
    
    # 2. Teste de Módulo ERP (Cadastros)
    print(f"\n{Colors.YELLOW}2. MODULO ERP - CADASTROS{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/erp/clientes/", description="Listar Clientes")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/erp/fornecedores/", description="Listar Fornecedores")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/erp/produtos/", description="Listar Produtos")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/erp/categorias/", description="Listar Categorias")
    total_tests += 1
    if success: passed_tests += 1
    
    # 3. Teste de Módulo Estoque
    print(f"\n{Colors.YELLOW}3. MODULO ESTOQUE{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/estoque/movimentacoes/", description="Listar Movimentações")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/estoque/lotes/", description="Listar Lotes")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/estoque/inventarios/", description="Listar Inventários")
    total_tests += 1
    if success: passed_tests += 1
    
    # 4. Teste de Módulo Compras
    print(f"\n{Colors.YELLOW}4. MODULO COMPRAS{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/compras/cotacoes/", description="Listar Cotações")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/compras/pedidos/", description="Listar Pedidos de Compra")
    total_tests += 1
    if success: passed_tests += 1
    
    # 5. Teste de Módulo Vendas
    print(f"\n{Colors.YELLOW}5. MODULO VENDAS{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/vendas/vendas/", description="Listar Vendas")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/vendas/caixas/", description="Listar Caixas")
    total_tests += 1
    if success: passed_tests += 1
    
    # 6. Teste de Módulo Assistência Técnica
    print(f"\n{Colors.YELLOW}6. MODULO ASSISTENCIA TECNICA{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/os/ordens-servico/", description="Listar Ordens de Serviço")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/os/orcamentos/", description="Listar Orçamentos")
    total_tests += 1
    if success: passed_tests += 1
    
    # 7. Teste de Módulo Financeiro
    print(f"\n{Colors.YELLOW}7. MODULO FINANCEIRO{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/financeiro/contas-pagar/", description="Listar Contas a Pagar")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/financeiro/contas-receber/", description="Listar Contas a Receber")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/financeiro/fluxo-caixa/", description="Fluxo de Caixa")
    total_tests += 1
    if success: passed_tests += 1
    
    # 8. Teste de Módulo CRM
    print(f"\n{Colors.YELLOW}8. MODULO CRM{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/crm/funis/", description="Listar Funis")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/crm/oportunidades/", description="Listar Oportunidades")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/crm/atividades/", description="Listar Atividades")
    total_tests += 1
    if success: passed_tests += 1
    
    # 9. Teste de Módulo Relatórios
    print(f"\n{Colors.YELLOW}9. MODULO RELATORIOS{Colors.END}")
    print("-" * 80)
    
    success, _ = test_endpoint("GET", "/api/relatorios/dashboard/", description="Dashboard Geral")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/relatorios/vendas/", description="Relatório de Vendas")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/relatorios/estoque/", description="Relatório de Estoque")
    total_tests += 1
    if success: passed_tests += 1
    
    success, _ = test_endpoint("GET", "/api/relatorios/financeiro/", description="Relatório Financeiro")
    total_tests += 1
    if success: passed_tests += 1
    
    # Resumo
    print("\n" + "="*80)
    print(f"{Colors.BLUE}RESUMO DOS TESTES{Colors.END}")
    print("="*80)
    
    percentage = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\nTotal de testes: {total_tests}")
    print(f"Testes aprovados: {Colors.GREEN}{passed_tests}{Colors.END}")
    print(f"Testes falhados: {Colors.RED}{total_tests - passed_tests}{Colors.END}")
    print(f"Taxa de sucesso: {Colors.GREEN if percentage >= 80 else Colors.RED}{percentage:.1f}%{Colors.END}")
    
    if percentage == 100:
        print(f"\n{Colors.GREEN}TODOS OS TESTES PASSARAM!{Colors.END}")
    elif percentage >= 80:
        print(f"\n{Colors.YELLOW}A maioria dos testes passou, mas ha alguns problemas.{Colors.END}")
    else:
        print(f"\n{Colors.RED}Muitos testes falharam. Verifique a API.{Colors.END}")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    main()
