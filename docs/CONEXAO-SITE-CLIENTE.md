# Conexão do Site do Cliente com a API Rootbits

Este guia explica como **criar** e **conectar** o site público da Rootbits (ou o site de um cliente) à API — focado no que o visitante final vê, sem painel administrativo.

---

## 1. O que o site do cliente usa da API

O site do cliente normalmente **não precisa de login** para o visitante. Ele consome:

- **Portfólio / projetos**: listagem e detalhe dos **posts** (projetos) publicados.
- Opcionalmente: alguma página de contato ou formulário que você possa enviar para um endpoint próprio (a API atual não tem “contato”; pode ser um serviço externo ou uma rota futura).

Ou seja: o foco da integração é **só leitura** dos **posts** (projetos) pela API.

---

## 2. URL base da API

Defina em um único lugar no projeto do site:

```js
const API_BASE = 'https://sua-api-rootbits.com/api';  // ou http://localhost:3000/api em dev
```

Use essa base em todas as chamadas abaixo.

---

## 3. Listar projetos (portfólio)

**GET** `/api/posts`

- **Autenticação**: não é obrigatória. A API aceita requisições sem token para listar posts.
- **Query params** (opcionais):
  - `publicado=true` – só publicados (recomendado no site público).
  - `page` – página (default 1).
  - `limit` – itens por página (default 20).

**Exemplo:**
```http
GET /api/posts?publicado=true&page=1&limit=12
```

**Resposta (200):**
```json
{
  "dados": [
    {
      "_id": "...",
      "titulo": "Site Loja X",
      "descricao": "Descrição do projeto...",
      "imagemPrincipal": "data:image/jpeg;base64,/9j/4AAQ...",
      "imagensAdicionais": [
        "data:image/jpeg;base64,/9j/4AAQ..."
      ],
      "autor": { "nome": "João" },
      "publicado": true,
      "ordem": 1,
      "tags": ["ecommerce", "react"],
      "clienteRef": { "nome": "Cliente X", "nomeEmpresa": "Empresa X" },
      "createdAt": "..."
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 12
}
```

Use `dados` para montar a grade ou lista de projetos na home ou na página de portfólio. Os campos `imagemPrincipal` e `imagensAdicionais` vêm como **data URL** (ex.: `data:image/jpeg;base64,...`). Use diretamente em `<img src="{imagemPrincipal}">` — as imagens ficam salvas no MongoDB.

---

## 4. Detalhe de um projeto

**GET** `/api/posts/:id`

- **Autenticação**: não é obrigatória.
- **:id** = `_id` do post.

**Exemplo:**
```http
GET /api/posts/507f1f77bcf86cd799439011
```

**Resposta (200):** um único objeto com a mesma estrutura do item em `dados` (incluindo `imagemPrincipal`, `imagensAdicionais`, `titulo`, `descricao`, `autor`, `tags`, `clienteRef`, etc.).

Use essa rota na página “Projeto X” (detalhe do case/portfólio).

---

## 5. Exemplo de uso no front (JavaScript)

### Listagem na home/portfólio

```js
const API_BASE = 'https://sua-api.com/api';

async function carregarProjetos(page = 1) {
  const res = await fetch(
    `${API_BASE}/posts?publicado=true&page=${page}&limit=12`
  );
  if (!res.ok) throw new Error('Falha ao carregar projetos');
  const { dados, total } = await res.json();
  return { projetos: dados, total };
}
```

### Detalhe do projeto

```js
async function carregarProjeto(id) {
  const res = await fetch(`${API_BASE}/posts/${id}`);
  if (!res.ok) throw new Error('Projeto não encontrado');
  return res.json();
}
```

### Exemplo de exibição (HTML/JS)

```html
<div id="portifolio"></div>

<script>
  (async () => {
    const { projetos } = await carregarProjetos();
    const html = projetos.map(p => `
      <article>
        <a href="/projeto/${p._id}">
          <img src="${p.imagemPrincipal}" alt="${p.titulo}" />
        </a>
        <h2>${p.titulo}</h2>
        <p>${p.descricao}</p>
      </article>
    `).join('');
    document.getElementById('portifolio').innerHTML = html;
  })();
</script>
```

---

## 6. Imagens

- As imagens vêm como **data URL** no JSON (ex.: `data:image/jpeg;base64,...`).
- Use-as diretamente em `<img src="...">` ou em CSS (background, etc.). Tudo fica armazenado no MongoDB; não há URLs de arquivo estático.

---

## 7. Paginação

Para “carregar mais” ou páginas numeradas:

- Use `page` e `limit` em **GET** `/api/posts`.
- A resposta traz `total`, `page` e `limit` para você calcular o número de páginas: `totalPaginas = Math.ceil(total / limit)`.

---

## 8. Ordem e filtros

- A API já ordena os posts por `ordem` (decrescente) e data. No site do cliente não é necessário enviar filtros além de `publicado=true`.
- Se no futuro a API expuser filtros por tag ou cliente, você pode adicionar query params na mesma URL (`/api/posts?publicado=true&tag=ecommerce`).

---

## 9. Site estático (SSG) vs dinâmico (SPA)

- **Site estático (Next.js SSG, Astro, etc.)**: chame a API no build ou em um endpoint server-side para preencher as páginas de portfólio e detalhe. Assim o conteúdo fica no HTML e é bom para SEO.
- **SPA (React, Vue, etc.)**: chame **GET** `/api/posts` e **GET** `/api/posts/:id` no cliente (fetch/axios) ao montar a página ou ao mudar de rota.

Em ambos os casos, a forma de **conectar** é a mesma: URL base + GET em `/api/posts` e `/api/posts/:id`.

---

## 10. Formulário de contato

O visitante pode enviar uma mensagem **sem login**. A mensagem chega no painel admin.

**POST** `/api/contatos` (sem autenticação)

**Body (JSON):**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "mensagem": "Gostaria de um orçamento para um site institucional."
}
```

- **Obrigatórios**: `nome`, `email`, `mensagem`.
- **Opcional**: `telefone`.

**Resposta de sucesso (201):**
```json
{
  "mensagem": "Mensagem enviada com sucesso. Entraremos em contato em breve.",
  "id": "..."
}
```

Exemplo no site do cliente:
```js
const res = await fetch(`${API_BASE}/contatos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: form.nome.value,
    email: form.email.value,
    telefone: form.telefone?.value || '',
    mensagem: form.mensagem.value
  })
});
const data = await res.json();
if (res.ok) alert(data.mensagem);
```

Ao enviar, a API cria o contato no MongoDB e dispara uma **notificação** para todos no painel admin (“Novo contato pelo site”).

---

## 11. Checklist de integração (site do cliente)

- [ ] Definir `API_BASE` (dev e produção).
- [ ] Página de portfólio: GET `/api/posts?publicado=true&page=1&limit=12` e exibir lista/cards.
- [ ] Página de detalhe: GET `/api/posts/:id` e exibir título, descrição, imagens e dados que precisar.
- [ ] Usar as URLs de imagem retornadas pela API diretamente em `<img>` ou CSS.
- [ ] Implementar paginação (page/limit e total) se houver muitos projetos.
- [ ] Formulário de contato: POST `/api/contatos` com nome, email, telefone e mensagem.

Com isso, o site do cliente fica criado e conectado à API Rootbits para exibir os projetos publicados.
