# Sistema de Abertura e Fechamento de Caixa - Especificação

## Objetivo
Implementar um sistema completo de controle de caixa para o PDV, onde o usuário deve abrir o caixa (contando o dinheiro inicial) antes de usar o PDV e fechar ao final do dia.

## Funcionalidades Principais

### 1. Abertura de Caixa
- **Pré-requisito para PDV**: Usuário só pode acessar o PDV se houver um caixa aberto
- **Informações necessárias**:
  - Data/hora de abertura
  - Valor inicial em dinheiro (contagem física)
  - Usuário responsável
  - Observações (opcional)

### 2. Fechamento de Caixa
- **Informações necessárias**:
  - Data/hora de fechamento
  - Valor final em dinheiro (contagem física)
  - Valor esperado (baseado nas vendas)
  - Diferença (quebra de caixa)
  - Observações sobre diferenças
  - Usuário que fechou

### 3. Histórico de Caixas
- **Localização**: Página de abertura do caixa (`/caixa` ou `/pdv/caixa`)
- **Permissões**: 
  - Apenas Admin pode ver por padrão
  - Configurável via perfil de usuário
- **Informações exibidas**:
  - Data de abertura e fechamento
  - Usuário responsável
  - Valor inicial
  - Valor final
  - Vendas realizadas
  - Quebra de caixa (diferença)
  - Status (aberto/fechado)

## Estrutura de Dados (Backend)

### Model: `Caixa`
```python
class Caixa(models.Model):
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('fechado', 'Fechado'),
    ]
    
    usuario_abertura = models.ForeignKey(User, on_delete=models.PROTECT, related_name='caixas_abertos')
    usuario_fechamento = models.ForeignKey(User, on_delete=models.PROTECT, related_name='caixas_fechados', null=True, blank=True)
    
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_fechamento = models.DateTimeField(null=True, blank=True)
    
    valor_inicial = models.DecimalField(max_digits=10, decimal_places=2)
    valor_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_esperado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    observacoes_abertura = models.TextField(blank=True)
    observacoes_fechamento = models.TextField(blank=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='aberto')
    
    @property
    def quebra_caixa(self):
        if self.valor_final and self.valor_esperado:
            return self.valor_final - self.valor_esperado
        return None
```

## Fluxo de Uso

### Cenário 1: Abertura do PDV
1. Usuário tenta acessar `/pdv`
2. Sistema verifica se existe caixa aberto para o usuário
3. Se não houver:
   - Redireciona para `/caixa/abrir`
   - Usuário preenche valor inicial
   - Sistema cria registro de caixa com status "aberto"
4. Se houver: permite acesso ao PDV

### Cenário 2: Fechamento do Caixa
1. Usuário acessa `/caixa/fechar`
2. Sistema exibe:
   - Valor inicial
   - Total de vendas do dia
   - Valor esperado
3. Usuário informa:
   - Valor final (contagem física)
   - Observações (se houver diferença)
4. Sistema calcula quebra de caixa
5. Atualiza registro com status "fechado"

### Cenário 3: Visualização de Histórico
1. Admin (ou usuário com permissão) acessa `/caixa`
2. Sistema exibe lista de todos os caixas (abertos e fechados)
3. Filtros disponíveis:
   - Data
   - Usuário
   - Status
4. Detalhes exibidos:
   - Período (abertura - fechamento)
   - Responsável
   - Valores (inicial, final, esperado, quebra)

## Páginas Frontend

### `/caixa` - Página Principal
- Lista de histórico de caixas
- Botão "Abrir Caixa" (se não houver caixa aberto)
- Botão "Fechar Caixa" (se houver caixa aberto)
- Cards com resumo:
  - Caixa atual (se aberto)
  - Total de quebras do mês
  - Média de vendas por caixa

### `/caixa/abrir` - Abertura de Caixa
- Formulário:
  - Valor inicial (input numérico)
  - Observações (textarea)
  - Botão "Abrir Caixa"

### `/caixa/fechar` - Fechamento de Caixa
- Informações do caixa atual:
  - Horário de abertura
  - Valor inicial
  - Total de vendas
  - Valor esperado
- Formulário:
  - Valor final (input numérico)
  - Observações (textarea)
  - Botão "Fechar Caixa"
- Alerta se houver quebra de caixa

### `/pdv` - Modificação
- Adicionar verificação de caixa aberto
- Se não houver caixa aberto:
  - Exibir modal/página informando
  - Botão para abrir caixa

## Permissões

### Perfil de Usuário - Nova Permissão
```
- visualizar_historico_caixa: bool
  - Admin: True (padrão)
  - Técnico: False (padrão)
  - Vendedor: False (padrão)
```

## API Endpoints Necessários

```
GET    /api/caixa/                    # Lista histórico
GET    /api/caixa/atual/              # Caixa aberto do usuário
POST   /api/caixa/abrir/              # Abre novo caixa
POST   /api/caixa/{id}/fechar/        # Fecha caixa específico
GET    /api/caixa/{id}/vendas/        # Vendas do caixa
```

## Próximos Passos de Implementação

1. **Backend**:
   - [ ] Criar model `Caixa`
   - [ ] Criar serializers
   - [ ] Criar viewsets e endpoints
   - [ ] Adicionar permissão ao modelo de perfil
   - [ ] Criar migrations

2. **Frontend**:
   - [ ] Criar página `/caixa` (lista histórico)
   - [ ] Criar página `/caixa/abrir` (formulário abertura)
   - [ ] Criar página `/caixa/fechar` (formulário fechamento)
   - [ ] Adicionar verificação em `/pdv`
   - [ ] Criar componentes de cards e modals

3. **Integrações**:
   - [ ] Vincular vendas ao caixa aberto
   - [ ] Calcular valor esperado automaticamente
   - [ ] Adicionar relatórios de quebra de caixa

## Observações Importantes

- Um usuário só pode ter **um caixa aberto por vez**
- Vendas devem ser vinculadas ao caixa aberto no momento da venda
- Quebra de caixa deve ser destacada visualmente (positiva em verde, negativa em vermelho)
- Histórico deve ser paginado para performance
- Considerar backup automático ao fechar caixa
