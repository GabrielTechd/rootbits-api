# Listar e fazer CRUD de postagens (projetos)

Base URL da API: `http://localhost:3030/api` (ou a que estiver no seu `.env`).

Para **criar, editar e excluir** é obrigatório estar logado e ter role **admin, ceo, programador ou designer**.  
**Listar** e **ver um post** podem ser feitos sem login (útil para o site público).

---

## 1. Listar postagens (READ list)

**GET** `/api/posts`

**Autenticação:** opcional (com token ou sem).

**Query (opcional):**
- `publicado=true` — só publicados
- `publicado=false` — só não publicados
- `page=1` — página
- `limit=20` — itens por página (máx. 50)

**Exemplo de resposta (200):**
```json
{
  "dados": [
    {
      "_id": "...",
      "titulo": "Site Loja X",
      "descricao": "Projeto de e-commerce...",
      "imagemPrincipal": "data:image/jpeg;base64,/9j/4AAQ...",
      "imagensAdicionais": ["data:image/jpeg;base64,..."],
      "autor": { "nome": "João" },
      "clienteRef": { "nome": "Cliente X", "nomeEmpresa": "Empresa X" },
      "publicado": true,
      "ordem": 1,
      "tags": ["ecommerce", "react"],
      "createdAt": "2025-02-21T..."
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

**Exemplo em JavaScript:**
```js
const res = await fetch('http://localhost:3030/api/posts?page=1&limit=10');
const { dados, total } = await res.json();
// dados = array de posts para exibir na lista
```

---

## 2. Ver uma postagem (READ one)

**GET** `/api/posts/:id`

**Autenticação:** opcional.

**Exemplo:**
```js
const id = '507f1f77bcf86cd799439011';
const res = await fetch(`http://localhost:3030/api/posts/${id}`);
const post = await res.json();
// post = objeto com titulo, descricao, imagemPrincipal, imagensAdicionais, autor, etc.
```

**Resposta 404:** quando o `id` não existe.

---

## 3. Criar postagem (CREATE)

**POST** `/api/posts`

**Autenticação:** obrigatória (header `Authorization: Bearer SEU_TOKEN`).  
**Quem pode:** admin, ceo, programador, designer.

**Body (JSON):**
- **titulo** (obrigatório) — string
- **descricao** (obrigatório) — string
- **imagemPrincipal** (obrigatório) — data URL ou `{ data: "base64...", contentType: "image/jpeg" }`
- **imagensAdicionais** (opcional) — array com até 10 imagens (data URL ou objeto)
- **publicado** (opcional) — `true` ou `false` (default: true)
- **ordem** (opcional) — número (default: 0)
- **tags** (opcional) — array de strings ou string separada por vírgula
- **clienteRef** (opcional) — ID do cliente (ObjectId)

**Exemplo de body:**
```json
{
  "titulo": "Landing Page Empresa Y",
  "descricao": "Landing page com formulário e integração.",
  "imagemPrincipal": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "imagensAdicionais": [
    "data:image/png;base64,iVBORw0KGgo..."
  ],
  "publicado": true,
  "ordem": 1,
  "tags": ["landing", "react"],
  "clienteRef": "674abc123def456789012345"
}
```

**Exemplo em JavaScript (com File → data URL):**
```js
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const token = localStorage.getItem('token');
const imagemPrincipal = await fileToDataUrl(arquivoPrincipal); // input type="file"
const imagensAdicionais = await Promise.all(
  Array.from(arquivosAdicionais).map(fileToDataUrl)
);

const res = await fetch('http://localhost:3030/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Meu projeto',
    descricao: 'Descrição do projeto',
    imagemPrincipal,
    imagensAdicionais,
    publicado: true,
    tags: ['react', 'tailwind']
  })
});

if (res.status === 201) {
  const post = await res.json();
  console.log('Criado:', post._id);
} else {
  const err = await res.json();
  console.error(err.erro);
}
```

**Resposta 201:** retorna o post criado (com `_id`, imagens em data URL, etc.).

---

## 4. Atualizar postagem (UPDATE)

**PUT** `/api/posts/:id`

**Autenticação:** obrigatória.  
**Quem pode:** admin, ceo, programador, designer.

**Body (JSON):** todos os campos são opcionais; envie só o que for alterar.
- **titulo** — string
- **descricao** — string
- **imagemPrincipal** — nova imagem (data URL ou objeto)
- **imagensAdicionais** — array (substitui as atuais; máx. 10)
- **publicado** — true/false
- **ordem** — número
- **tags** — array ou string separada por vírgula
- **clienteRef** — ID ou `null` para limpar

**Exemplo:**
```js
const res = await fetch(`http://localhost:3030/api/posts/${id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Novo título',
    publicado: false
  })
});
const post = await res.json();
```

Para trocar só a imagem principal, envie apenas `imagemPrincipal` no body. Para trocar as adicionais, envie o array completo em `imagensAdicionais`.

---

## 5. Excluir postagem (DELETE)

**DELETE** `/api/posts/:id`

**Autenticação:** obrigatória.  
**Quem pode:** apenas **admin** ou **ceo**.

**Exemplo:**
```js
const res = await fetch(`http://localhost:3030/api/posts/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

if (res.status === 204) {
  // Excluído com sucesso — remova da lista no front ou recarregue
} else if (res.status === 403) {
  // Sem permissão (precisa ser admin ou ceo)
}
```

**Resposta 204:** sucesso, corpo vazio.  
**Resposta 404:** post não encontrado.

---

## Resumo das rotas

| Ação   | Método | Rota             | Auth   | Quem pode                         |
|--------|--------|------------------|--------|-----------------------------------|
| Listar | GET    | `/api/posts`     | opcional | Todos                             |
| Ver um | GET    | `/api/posts/:id` | opcional | Todos                             |
| Criar  | POST   | `/api/posts`     | sim    | admin, ceo, programador, designer |
| Editar | PUT   | `/api/posts/:id` | sim    | admin, ceo, programador, designer |
| Excluir | DELETE | `/api/posts/:id` | sim    | admin, ceo                        |

---

## Exibir as imagens no front

As imagens vêm em **data URL** (`imagemPrincipal` e cada item de `imagensAdicionais`). Use direto no `<img>`:

```jsx
<img src={post.imagemPrincipal} alt={post.titulo} />

{post.imagensAdicionais?.map((url, i) => (
  <img key={i} src={url} alt={`${post.titulo} - ${i + 1}`} />
))}
```

---

## Exemplo de fluxo no painel (React)

1. **Listar:** ao abrir a página de projetos, `GET /api/posts` e guardar `dados` no state; exibir cards/lista.
2. **Ver detalhe:** ao clicar em um post, `GET /api/posts/:id` e exibir em modal ou página.
3. **Criar:** no formulário, converter arquivos para data URL e `POST /api/posts`; em sucesso (201), adicionar o retorno na lista ou chamar de novo o GET da lista.
4. **Editar:** no formulário de edição, `PUT /api/posts/:id` com os campos alterados; em sucesso, atualizar o item na lista ou recarregar o detalhe.
5. **Excluir:** confirmação e `DELETE /api/posts/:id`; em 204, remover o item da lista ou recarregar a lista.

Sempre envie o **token** no header em POST, PUT e DELETE.
