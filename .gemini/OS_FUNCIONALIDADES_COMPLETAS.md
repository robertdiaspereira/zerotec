# 🔧 OS - Funcionalidades Avançadas Completas

## 📋 Novas Funcionalidades Solicitadas

### 1. Cadastro de Serviços
Criar um CRUD completo para serviços pré-cadastrados

### 2. Cadastro de Itens do Checklist
Permitir customizar os itens do checklist

### 3. Termos de Garantia
Termos separados para produtos e serviços que aparecem na OS

### 4. Sistema de Pagamento Completo
- Formas de pagamento (Dinheiro, Cartão, PIX, etc)
- Taxa da máquina de cartão
- Parcelamento
- Controle de parcelas

---

## 🛠️ 1. Cadastro de Serviços

### Modelo Backend

```python
# apps/assistencia/models.py
class ServicoTemplate(models.Model):
    """Template de serviços pré-cadastrados"""
    codigo = models.CharField(max_length=20, unique=True)
    descricao = models.CharField(max_length=200)
    descricao_detalhada = models.TextField(blank=True)
    valor_padrao = models.DecimalField(max_digits=10, decimal_places=2)
    tempo_estimado = models.IntegerField(help_text="Tempo em minutos", null=True, blank=True)
    categoria = models.CharField(max_length=100, blank=True)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['descricao']
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
    
    def __str__(self):
        return f"{self.codigo} - {self.descricao}"
```

### Interface Frontend

```tsx
// /configuracoes/servicos
<Card>
  <CardHeader>
    <CardTitle>Serviços Cadastrados</CardTitle>
    <Button onClick={() => setShowModal(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Novo Serviço
    </Button>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Valor Padrão</TableHead>
          <TableHead>Tempo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {servicos.map((servico) => (
          <TableRow key={servico.id}>
            <TableCell className="font-mono">{servico.codigo}</TableCell>
            <TableCell>{servico.descricao}</TableCell>
            <TableCell>{servico.categoria}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(servico.valor_padrao)}
            </TableCell>
            <TableCell>{servico.tempo_estimado} min</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

### Modal de Cadastro

```tsx
<Dialog open={showModal} onOpenChange={setShowModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Novo Serviço</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Código</Label>
        <Input placeholder="SRV001" />
      </div>
      
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Input placeholder="Ex: Troca de tela" />
      </div>
      
      <div className="space-y-2">
        <Label>Descrição Detalhada</Label>
        <Textarea placeholder="Detalhes do serviço..." rows={3} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="reparo">Reparo</SelectItem>
              <SelectItem value="instalacao">Instalação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Valor Padrão</Label>
          <Input type="number" step="0.01" placeholder="0,00" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Tempo Estimado (minutos)</Label>
        <Input type="number" placeholder="60" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowModal(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSave}>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Usar na OS

```tsx
// Na tab "Serviços" da OS
<Select onValueChange={handleSelectServico}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione um serviço" />
  </SelectTrigger>
  <SelectContent>
    {servicosTemplate.map((servico) => (
      <SelectItem key={servico.id} value={servico.id.toString()}>
        {servico.codigo} - {servico.descricao} - {formatCurrency(servico.valor_padrao)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## ✅ 2. Cadastro de Itens do Checklist

### Modelo Backend

```python
# apps/assistencia/models.py
class ChecklistItem(models.Model):
    """Itens customizáveis do checklist"""
    label = models.CharField(max_length=100)
    ordem = models.IntegerField(default=0)
    ativo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['ordem', 'label']
    
    def __str__(self):
        return self.label
```

### Interface de Configuração

```tsx
// /configuracoes/checklist
<Card>
  <CardHeader>
    <CardTitle>Itens do Checklist</CardTitle>
    <Button onClick={adicionarItem}>
      <Plus className="mr-2 h-4 w-4" />
      Novo Item
    </Button>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {checklistItems.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <Input
            value={item.label}
            onChange={(e) => updateItem(item.id, e.target.value)}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## 📜 3. Termos de Garantia

### Modelo Backend

```python
# apps/assistencia/models.py
class TermoGarantia(models.Model):
    """Termos de garantia para produtos e serviços"""
    TIPO_CHOICES = [
        ('produto', 'Produto'),
        ('servico', 'Serviço'),
    ]
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    conteudo = models.TextField()
    ativo = models.BooleanField(default=True)
    padrao = models.BooleanField(default=False)  # Termo padrão
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Termo de Garantia'
        verbose_name_plural = 'Termos de Garantia'
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.titulo}"
```

### Interface de Configuração

```tsx
// /configuracoes/termos-garantia
<Tabs defaultValue="produtos">
  <TabsList>
    <TabsTrigger value="produtos">Produtos</TabsTrigger>
    <TabsTrigger value="servicos">Serviços</TabsTrigger>
  </TabsList>
  
  <TabsContent value="produtos">
    <Card>
      <CardHeader>
        <CardTitle>Termos de Garantia - Produtos</CardTitle>
        <Button onClick={() => novoTermo('produto')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Termo
        </Button>
      </CardHeader>
      <CardContent>
        {termosProdutos.map((termo) => (
          <Card key={termo.id} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{termo.titulo}</CardTitle>
                <div className="flex gap-2">
                  {termo.padrao && <Badge>Padrão</Badge>}
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {termo.conteudo}
              </p>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  </TabsContent>
  
  <TabsContent value="servicos">
    {/* Mesma estrutura para serviços */}
  </TabsContent>
</Tabs>
```

### Exibir na OS

```tsx
// Na página de detalhes da OS
{os.termo_garantia_produto && (
  <Card>
    <CardHeader>
      <CardTitle>Termo de Garantia - Produto</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm whitespace-pre-wrap">{os.termo_garantia_produto}</p>
    </CardContent>
  </Card>
)}

{os.termo_garantia_servico && (
  <Card>
    <CardHeader>
      <CardTitle>Termo de Garantia - Serviço</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm whitespace-pre-wrap">{os.termo_garantia_servico}</p>
    </CardContent>
  </Card>
)}
```

---

## 💳 4. Sistema de Pagamento Completo

### Modelo Backend

```python
# apps/financeiro/models.py
class FormaPagamento(models.Model):
    """Formas de pagamento disponíveis"""
    nome = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=[
        ('dinheiro', 'Dinheiro'),
        ('cartao_credito', 'Cartão de Crédito'),
        ('cartao_debito', 'Cartão de Débito'),
        ('pix', 'PIX'),
        ('boleto', 'Boleto'),
        ('transferencia', 'Transferência'),
    ])
    taxa_percentual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    taxa_fixa = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    permite_parcelamento = models.BooleanField(default=False)
    max_parcelas = models.IntegerField(default=1)
    ativo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nome

class Pagamento(models.Model):
    """Pagamento de uma OS"""
    ordem_servico = models.ForeignKey('assistencia.OrdemServico', on_delete=models.CASCADE, related_name='pagamentos')
    forma_pagamento = models.ForeignKey(FormaPagamento, on_delete=models.PROTECT)
    valor_original = models.DecimalField(max_digits=10, decimal_places=2)
    taxa_maquina = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valor_liquido = models.DecimalField(max_digits=10, decimal_places=2)
    numero_parcelas = models.IntegerField(default=1)
    observacoes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Pagamento {self.id} - OS {self.ordem_servico.numero}"

class Parcela(models.Model):
    """Parcelas de um pagamento"""
    pagamento = models.ForeignKey(Pagamento, on_delete=models.CASCADE, related_name='parcelas')
    numero_parcela = models.IntegerField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    data_pagamento = models.DateField(null=True, blank=True)
    recebido = models.BooleanField(default=False)
    observacoes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['numero_parcela']
    
    def __str__(self):
        return f"Parcela {self.numero_parcela}/{self.pagamento.numero_parcelas}"
```

### Interface de Pagamento na OS

```tsx
// Resumo do Pedido - Seção de Pagamento
<Card className="sticky top-6">
  <CardHeader>
    <CardTitle>Resumo do Pedido</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Totais */}
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Total Produtos:</span>
        <span>{formatCurrency(totais.totalProdutos)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Total Serviços:</span>
        <span>{formatCurrency(totais.totalServicos)}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Frete:</span>
        <Input type="number" step="0.01" className="w-24 h-8 text-right" />
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>Desconto:</span>
        <Input type="number" step="0.01" className="w-24 h-8 text-right" />
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total Geral:</span>
        <span>{formatCurrency(totais.totalGeral)}</span>
      </div>
    </div>

    <Separator />

    {/* Pagamento */}
    <div className="space-y-4">
      <h3 className="font-semibold">Pagamento</h3>
      
      <div className="space-y-2">
        <Label>Forma de Pagamento</Label>
        <Select value={pagamento.forma_id} onValueChange={handleFormaPagamento}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
            <SelectItem value="cartao_credito">💳 Cartão de Crédito</SelectItem>
            <SelectItem value="cartao_debito">💳 Cartão de Débito</SelectItem>
            <SelectItem value="pix">📱 PIX</SelectItem>
            <SelectItem value="boleto">📄 Boleto</SelectItem>
            <SelectItem value="transferencia">🏦 Transferência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Taxa da Máquina (se cartão) */}
      {(pagamento.forma_id === 'cartao_credito' || pagamento.forma_id === 'cartao_debito') && (
        <div className="space-y-2">
          <Label>Taxa da Máquina (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={pagamento.taxa_percentual}
            onChange={(e) => calcularTaxa(parseFloat(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Taxa: {formatCurrency(pagamento.valor_taxa)} | 
            Líquido: {formatCurrency(totais.totalGeral - pagamento.valor_taxa)}
          </p>
        </div>
      )}

      {/* Parcelamento (se cartão de crédito) */}
      {pagamento.forma_id === 'cartao_credito' && (
        <div className="space-y-2">
          <Label>Número de Parcelas</Label>
          <Select value={pagamento.num_parcelas.toString()} onValueChange={handleParcelas}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n}x de {formatCurrency(totais.totalGeral / n)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Detalhes das Parcelas */}
      {pagamento.num_parcelas > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Parcelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pagamento.parcelas.map((parcela, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">Parcela {parcela.numero}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <Label className="text-xs">Vencimento</Label>
                        <Input
                          type="date"
                          value={parcela.vencimento}
                          onChange={(e) => updateParcela(index, 'vencimento', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={parcela.valor}
                          onChange={(e) => updateParcela(index, 'valor', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div className="mt-1">
                      <Label className="text-xs">Observação</Label>
                      <Input
                        value={parcela.obs}
                        onChange={(e) => updateParcela(index, 'obs', e.target.value)}
                        placeholder="Obs..."
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox
                        id={`recebido-${index}`}
                        checked={parcela.recebido}
                        onCheckedChange={(checked) => updateParcela(index, 'recebido', checked)}
                      />
                      <label htmlFor={`recebido-${index}`} className="text-xs cursor-pointer">
                        Recebido
                      </label>
                      {parcela.recebido && (
                        <Input
                          type="date"
                          value={parcela.data_pagamento}
                          onChange={(e) => updateParcela(index, 'data_pagamento', e.target.value)}
                          className="h-7 text-xs flex-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações do Pagamento */}
      <div className="space-y-2">
        <Label>Observações do Pagamento</Label>
        <Textarea
          value={pagamento.observacoes}
          onChange={(e) => setPagamento({ ...pagamento, observacoes: e.target.value })}
          placeholder="Observações sobre o pagamento..."
          rows={2}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Modelo `ServicoTemplate`
- [ ] Modelo `ChecklistItem`
- [ ] Modelo `TermoGarantia`
- [ ] Modelo `FormaPagamento`
- [ ] Modelo `Pagamento`
- [ ] Modelo `Parcela`
- [ ] APIs CRUD para todos

### Frontend - Configurações
- [ ] Página `/configuracoes/servicos`
- [ ] Página `/configuracoes/checklist`
- [ ] Página `/configuracoes/termos-garantia`
- [ ] Página `/configuracoes/formas-pagamento`

### Frontend - OS
- [ ] Integrar serviços pré-cadastrados
- [ ] Checklist dinâmico
- [ ] Exibir termos de garantia
- [ ] Sistema de pagamento completo
- [ ] Controle de parcelas

---

## 🎯 Prioridade

**ALTA** - Funcionalidades essenciais para OS profissional

**Estimativa**: 5-7 dias de trabalho

---

**Sistema de OS completo e profissional! 🚀**
