# CRUD de Clientes (Cadastro de Venda)

O cadastro de cliente é um **cadastro de venda**: contato, empresa, proposta, valores, datas e acompanhamento.

Base URL: `http://localhost:3030/api` (ou a do seu `.env`).  
Todas as rotas exigem **Authorization: Bearer &lt;token&gt;** (usuário logado).

---

## Rotas auxiliares (opções para selects)

Use antes de montar os formulários:

| Rota | Descrição |
|------|-----------|
| **GET** `/api/clientes/tipos-site` | Tipos de site (landing, institucional, ecommerce, etc.) |
| **GET** `/api/clientes/status-venda` | Status da venda (prospect, proposta_enviada, fechado, etc.) |
| **GET** `/api/clientes/formas-pagamento` | Formas de pagamento (a_vista, parcelado_2x, etc.) |
| **GET** `/api/clientes/origens-lead` | Origem do lead (indicacao, google, instagram, etc.) |

Resposta de cada uma: `{ tipos: [...] }` ou `{ status: [...] }` / `{ formas: [...] }` / `{ origens: [...] }`.

---

## 1. Listar clientes (READ list)

**GET** `/api/clientes`

**Query (opcional):**
- `status` — filtrar por status (ex.: prospect, fechado)
- `tipoSite` — filtrar por tipo de site
- `vendedor` — ID do usuário vendedor
- `origemLead` — origem do lead
- `busca` — busca em nome, email, nomeEmpresa, cnpj
- `page=1` e `limit=20` — paginação

**Resposta (200):**
```json
{
  "dados": [
    {
      "_id": "...",
      "nome": "João Silva",
      "email": "joao@empresa.com",
      "telefone": "(11) 3333-3333",
      "celular": "(11) 99999-9999",
      "whatsapp": "(11) 99999-9999",
      "nomeEmpresa": "Empresa XYZ",
      "cnpj": "12.345.678/0001-90",
      "tipoSite": "institucional",
      "preco": 5000,
      "precoPago": null,
      "status": "prospect",
      "origemLead": "indicacao",
      "vendedor": { "nome": "Maria" },
      "responsavel": { "nome": "Pedro" },
      "dataProposta": "2025-02-01",
      "createdAt": "..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

**Exemplo:**
```js
const res = await fetch('http://localhost:3030/api/clientes?status=prospect&page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { dados, total } = await res.json();
```

---

## 2. Ver um cliente (READ one)

**GET** `/api/clientes/:id`

**Resposta (200):** objeto completo do cliente (todos os campos abaixo).  
**404:** cliente não encontrado.

```js
const res = await fetch(`http://localhost:3030/api/clientes/${id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cliente = await res.json();
```

---

## 3. Criar cliente (CREATE)

**POST** `/api/clientes`

**Body (JSON).** Obrigatórios: **nome**, **email**. Demais opcionais.

### Contato
| Campo      | Tipo   | Descrição                    |
|-----------|--------|------------------------------|
| nome      | string | Nome do contato (obrigatório)|
| email     | string | E-mail (obrigatório)          |
| telefone  | string | Telefone fixo                |
| telefone2 | string | Segundo telefone             |
| celular   | string | Celular                      |
| whatsapp  | string | WhatsApp                     |
| cargo     | string | Cargo na empresa             |

### Empresa
| Campo          | Tipo   | Descrição        |
|----------------|--------|------------------|
| nomeEmpresa    | string | Nome fantasia    |
| razaoSocial    | string | Razão social     |
| cnpj           | string | CNPJ             |
| ramoAtividade  | string | Ramo de atuação  |

### Venda / Proposta
| Campo               | Tipo    | Descrição                          |
|---------------------|--------|------------------------------------|
| tipoSite            | string | landing, institucional, ecommerce, blog, sistema, app, outro |
| preco               | number | Valor total do projeto             |
| precoPago           | number | Valor já pago                      |
| valorEntrada        | number | Valor da entrada                   |
| valorParcelas       | number | Valor de cada parcela              |
| formaPagamento      | string | a_vista, parcelado_2x, ..., parcelado_12x, mensalidade, combinado, outro |
| quantidadeParcelas  | number | Número de parcelas                 |
| status              | string | prospect, proposta_enviada, negociacao, fechado, perdido, ativo, encerrado, inativo |
| etapa               | string | Etapa livre (ex.: "Aguardando retorno") |
| probabilidade       | number | 0 a 100 (%)                        |
| origemLead          | string | indicacao, google, instagram, facebook, linkedin, site, whatsapp, telefone, email, evento, outro |
| dataProposta        | string | Data ISO (ex.: 2025-02-01)         |
| dataFechamento      | string | Data do fechamento                 |
| dataEntregaPrevista | string | Previsão de entrega                |
| dataPrimeiroContato | string | Primeiro contato                  |
| dataContrato        | string | Data do contrato                   |

### Projeto / Site
| Campo     | Tipo   | Descrição              |
|----------|--------|------------------------|
| urlSite  | string | URL do site atual      |
| dominio  | string | Domínio desejado       |
| hospedagem | string | Onde vai hospedar    |

### Equipe
| Campo       | Tipo   | Descrição                    |
|------------|--------|-------------------------------|
| vendedor   | string | ID do usuário vendedor        |
| responsavel| string | ID do usuário responsável     |

### Endereço
| Campo       | Tipo   |
|------------|--------|
| endereco   | objeto | `{ logradouro, numero, complemento, bairro, cidade, estado, cep }` |

### Observações
| Campo               | Tipo   |
|---------------------|--------|
| informacoesAdicionais | string |
| observacoes         | string | Visível / para o cliente |
| observacoesInternas | string | Só para a equipe        |

**Exemplo de body (mínimo):**
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com"
}
```

**Exemplo completo:**
```json
{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "(11) 3333-3333",
  "celular": "(11) 99999-9999",
  "whatsapp": "(11) 99999-9999",
  "cargo": "Diretor",
  "nomeEmpresa": "Empresa XYZ",
  "razaoSocial": "XYZ Ltda",
  "cnpj": "12.345.678/0001-90",
  "ramoAtividade": "Tecnologia",
  "tipoSite": "institucional",
  "preco": 8000,
  "valorEntrada": 2000,
  "formaPagamento": "parcelado_3x",
  "quantidadeParcelas": 3,
  "status": "prospect",
  "etapa": "Proposta enviada",
  "probabilidade": 70,
  "origemLead": "indicacao",
  "dataProposta": "2025-02-15",
  "dataEntregaPrevista": "2025-04-01",
  "dominio": "www.empresaxyz.com.br",
  "vendedor": "ID_DO_USUARIO_VENDEDOR",
  "endereco": {
    "logradouro": "Rua das Flores",
    "numero": "100",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "observacoes": "Cliente pediu orçamento até sexta.",
  "observacoesInternas": "Combinar reunião com sócio."
}
```

**Exemplo em JavaScript:**
```js
const res = await fetch('http://localhost:3030/api/clientes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'João Silva',
    email: 'joao@empresa.com',
    telefone: '(11) 3333-3333',
    nomeEmpresa: 'Empresa XYZ',
    tipoSite: 'institucional',
    preco: 5000,
    status: 'prospect',
    origemLead: 'google',
    vendedor: vendedorId
  })
});
if (res.status === 201) {
  const cliente = await res.json();
  console.log('Criado:', cliente._id);
}
```

**Resposta 201:** retorna o cliente criado (com `_id` e todos os campos).

---

## 4. Atualizar cliente (UPDATE)

**PUT** `/api/clientes/:id`

**Body (JSON):** envie apenas os campos que deseja alterar. Mesmos nomes e tipos da tabela acima.

**Exemplo:** alterar status e valor pago
```json
{
  "status": "fechado",
  "precoPago": 2000,
  "dataFechamento": "2025-02-21"
}
```

```js
await fetch(`http://localhost:3030/api/clientes/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'fechado',
    precoPago: 2000,
    dataFechamento: new Date().toISOString().split('T')[0]
  })
});
```

**Resposta 200:** cliente atualizado. **404:** não encontrado.

---

## 5. Excluir cliente (DELETE)

**DELETE** `/api/clientes/:id`

**Quem pode:** apenas **admin** ou **ceo**.

```js
const res = await fetch(`http://localhost:3030/api/clientes/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});
// 204 = sucesso
```

**Resposta 204:** excluído. **404:** não encontrado. **403:** sem permissão.

---

## Resumo das rotas

| Ação    | Método | Rota                          | Quem pode                                    |
|---------|--------|-------------------------------|----------------------------------------------|
| Opções  | GET    | `/api/clientes/tipos-site`    | Qualquer logado                              |
| Opções  | GET    | `/api/clientes/status-venda`  | Qualquer logado                              |
| Opções  | GET    | `/api/clientes/formas-pagamento` | Qualquer logado                           |
| Opções  | GET    | `/api/clientes/origens-lead`  | Qualquer logado                              |
| Listar  | GET    | `/api/clientes`               | admin, ceo, programador, designer, vendedor, suporte |
| Ver um  | GET    | `/api/clientes/:id`           | idem                                         |
| Criar   | POST   | `/api/clientes`               | admin, ceo, programador, vendedor            |
| Atualizar | PUT  | `/api/clientes/:id`           | admin, ceo, programador, vendedor            |
| Excluir | DELETE | `/api/clientes/:id`           | admin, ceo                                   |

---

## Valores dos enums (referência)

- **tipos-site:** landing, institucional, ecommerce, blog, sistema, app, outro  
- **status:** prospect, proposta_enviada, negociacao, fechado, perdido, ativo, encerrado, inativo  
- **forma-pagamento:** a_vista, parcelado_2x, parcelado_3x, parcelado_4x, parcelado_5x, parcelado_6x, parcelado_12x, mensalidade, combinado, outro  
- **origem-lead:** indicacao, google, instagram, facebook, linkedin, site, whatsapp, telefone, email, evento, outro  

Para listas atualizadas, use sempre os endpoints **GET** de opções acima.
