# CRM Module

## 🎯 Funcionalidades

### Pipeline de Vendas (Kanban)
- Funis personalizáveis
- Etapas com probabilidade de fechamento
- Arrastar e soltar (drag-and-drop) no frontend
- Cores customizáveis

### Oportunidades
- Numeração automática (OPP000001)
- Cliente ou Lead
- Valor estimado e ponderado
- Probabilidade de fechamento
- Data prevista
- Origem (website, indicação, telefone, etc)
- Responsável

### Atividades
- Tipos: Ligação, E-mail, Reunião, Visita, Proposta, Follow-up
- Data prevista e conclusão
- Responsável
- Status: Pendente, Concluída, Cancelada
- Resultado

### Interações
- Histórico completo com cliente
- Timeline de interações
- Tipos: Ligação, E-mail, Reunião, WhatsApp, Nota
- Registro automático de mudanças de etapa

## 📊 Endpoints Principais

### Funis
- `GET /api/crm/funis/` - Listar funis
- `POST /api/crm/funis/` - Criar funil
- `GET /api/crm/funis/{id}/` - Detalhes do funil
- `PUT /api/crm/funis/{id}/` - Atualizar funil
- `DELETE /api/crm/funis/{id}/` - Deletar funil

### Etapas
- `GET /api/crm/etapas/` - Listar etapas
- `POST /api/crm/etapas/` - Criar etapa
- `GET /api/crm/etapas/{id}/` - Detalhes da etapa

### Oportunidades
- `GET /api/crm/oportunidades/` - Listar oportunidades
- `POST /api/crm/oportunidades/` - Criar oportunidade
- `GET /api/crm/oportunidades/{id}/` - Detalhes
- `POST /api/crm/oportunidades/{id}/mudar_etapa/` - Mudar etapa
- `POST /api/crm/oportunidades/{id}/ganhar/` - Marcar como ganha
- `POST /api/crm/oportunidades/{id}/perder/` - Marcar como perdida
- `GET /api/crm/oportunidades/kanban/?funil_id=1` - **Visão Kanban**
- `GET /api/crm/oportunidades/dashboard/` - **Dashboard com métricas**

### Atividades
- `GET /api/crm/atividades/` - Listar atividades
- `POST /api/crm/atividades/` - Criar atividade
- `POST /api/crm/atividades/{id}/concluir/` - Concluir atividade
- `GET /api/crm/atividades/pendentes/` - Atividades pendentes
- `GET /api/crm/atividades/atrasadas/` - Atividades atrasadas

### Interações
- `GET /api/crm/interacoes/` - Listar interações
- `POST /api/crm/interacoes/` - Criar interação
- `GET /api/crm/interacoes/timeline/?cliente_id=1` - Timeline do cliente
- `GET /api/crm/interacoes/timeline/?oportunidade_id=1` - Timeline da oportunidade

## 🎨 Visão Kanban

Endpoint especial para visualização Kanban:

```json
GET /api/crm/oportunidades/kanban/?funil_id=1

Response:
{
  "funil": {
    "id": 1,
    "nome": "Vendas",
    "etapas": [...]
  },
  "kanban": [
    {
      "etapa": {
        "id": 1,
        "nome": "Lead",
        "cor": "#3B82F6",
        "probabilidade": 10
      },
      "oportunidades": [...],
      "total_oportunidades": 5,
      "valor_total": 25000.00
    },
    ...
  ]
}
```

## 📈 Dashboard

Métricas do CRM:

```json
GET /api/crm/oportunidades/dashboard/

Response:
{
  "total_oportunidades": 50,
  "valor_pipeline": 250000.00,
  "oportunidades_ganhas_mes": 10,
  "valor_ganho_mes": 50000.00,
  "taxa_conversao": 66.67,
  "por_etapa": [
    {
      "etapa": "Lead",
      "quantidade": 15,
      "valor": 75000.00
    },
    ...
  ]
}
```

## 🔄 Automações

### Signals Automáticos
1. **Mudança de Etapa** → Cria interação automática
2. **Etapa de Ganho** → Define data de fechamento
3. **Etapa de Perda** → Define data de fechamento
4. **Atividade Concluída** → Cria interação com resultado
5. **Probabilidade** → Atualiza automaticamente baseado na etapa

## 💡 Uso Recomendado

### 1. Configurar Funil
```python
# Criar funil
POST /api/crm/funis/
{
  "nome": "Vendas",
  "descricao": "Funil principal"
}

# Criar etapas
POST /api/crm/etapas/
{
  "funil": 1,
  "nome": "Lead",
  "ordem": 1,
  "probabilidade": 10,
  "is_inicial": true
}
```

### 2. Criar Oportunidade
```python
POST /api/crm/oportunidades/
{
  "titulo": "Venda de Sistema ERP",
  "cliente": 1,
  "funil": 1,
  "etapa": 1,
  "valor_estimado": 10000.00,
  "data_fechamento_prevista": "2025-12-31",
  "responsavel": 1,
  "origem": "website"
}
```

### 3. Acompanhar no Kanban
```python
GET /api/crm/oportunidades/kanban/?funil_id=1
```

### 4. Criar Atividades
```python
POST /api/crm/atividades/
{
  "oportunidade": 1,
  "tipo": "ligacao",
  "titulo": "Ligar para apresentar proposta",
  "data_prevista": "2025-11-25T10:00:00Z",
  "responsavel": 1
}
```

## 🎯 Integração com ERP

- **Lead → Cliente**: Quando oportunidade é ganha, pode criar cliente automaticamente
- **Oportunidade → Venda**: Integração com módulo de vendas
- **Timeline**: Histórico completo de interações com cliente

## 📱 Frontend (Next.js)

No frontend, você pode criar:
- **Kanban Board** com drag-and-drop (react-beautiful-dnd)
- **Dashboard** com gráficos (Chart.js ou Recharts)
- **Timeline** de interações
- **Calendário** de atividades
- **Formulários** de criação rápida

---

**Módulo CRM completo e funcional!** 🎉
