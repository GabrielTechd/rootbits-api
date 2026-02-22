# Conexão do Painel Admin com a API Rootbits

Este guia explica como **criar** e **conectar** o painel administrativo da Rootbits à API.

---

## 1. Pré-requisitos da API

- A API está rodando (ex.: `http://localhost:3000`).
- Você tem um usuário com perfil **admin**, **ceo**, **programador**, **designer**, **vendedor** ou **suporte** (criado via seed ou pelo próprio painel).
- CORS está habilitado na API (já configurado no `src/app.js`). Em produção, restrinja a origem do painel na variável de ambiente ou no código.

---

## 2. URL base da API

Defina em um único lugar no front do painel:

```js
const API_BASE = 'http://localhost:3000/api';  // ou a URL do seu servidor
```

---

## 3. Autenticação

### 3.1 Login

Envie **POST** para `/api/auth/login` com email e senha. A API devolve um **token JWT** e os dados do usuário.

**Requisição:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@rootbits.com.br",
  "senha": "sua_senha"
}
```

**Resposta de sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "...",
    "nome": "Administrador",
    "email": "admin@rootbits.com.br",
    "role": "admin",
    "ativo": true
  }
}
```

### 3.2 Guardar o token e usar nas requisições

- Após o login, guarde o `token` (ex.: `localStorage`, cookie ou estado da aplicação).
- Em **todas** as requisições autenticadas, envie o header:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

Exemplo com `fetch`:
```js
const token = localStorage.getItem('token');
fetch(`${API_BASE}/api/usuarios`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3.3 Dados do usuário logado

**GET** `/api/auth/me` (com header `Authorization`) retorna o usuário atual. Use para exibir nome, role e para checagem de permissões no front.

### 3.4 Tratamento de 401/403

- **401**: token inválido ou expirado → redirecionar para a tela de login e limpar o token.
- **403**: usuário sem permissão para a ação → exibir mensagem e não executar a ação.

---

## 4. Recursos e rotas para o painel

Todas as rotas abaixo exigem **Authorization: Bearer &lt;token&gt;** (exceto login).

| Recurso      | Método | Rota | Uso no painel |
|-------------|--------|------|----------------|
| Login       | POST   | `/api/auth/login` | Tela de login |
| Me          | GET    | `/api/auth/me` | Perfil / layout (nome, role) |
| Usuários    | GET    | `/api/usuarios` | Listar equipe (admin/ceo/…) |
| Usuários    | POST   | `/api/usuarios` | Criar usuário (admin/ceo) |
| Usuários    | GET    | `/api/usuarios/:id` | Editar usuário |
| Usuários    | PUT    | `/api/usuarios/:id` | Atualizar usuário (avatar em base64 no JSON) |
| Roles       | GET    | `/api/usuarios/roles` | Select de cargo |
| Posts       | GET    | `/api/posts` | Listar projetos/portfólio |
| Posts       | POST   | `/api/posts` | Criar post (imagens em base64/data URL no JSON) |
| Posts       | GET    | `/api/posts/:id` | Editar post |
| Posts       | PUT    | `/api/posts/:id` | Atualizar post (imagens em base64 no body) |
| Posts       | DELETE | `/api/posts/:id` | Excluir post (admin/ceo) |
| Clientes    | GET    | `/api/clientes` | Listar clientes (filtros: status, tipoSite, busca) |
| Clientes    | GET    | `/api/clientes/tipos-site` | Opções de tipo de site |
| Clientes    | POST   | `/api/clientes` | Cadastrar cliente |
| Clientes    | GET    | `/api/clientes/:id` | Ver/editar cliente |
| Clientes    | PUT    | `/api/clientes/:id` | Atualizar cliente |
| Clientes    | DELETE | `/api/clientes/:id` | Excluir cliente (admin/ceo) |
| Chamados    | GET    | `/api/chamados` | Listar chamados (filtros: status, cliente, responsavel) |
| Chamados    | GET    | `/api/chamados/status` | Opções de status |
| Chamados    | GET    | `/api/chamados/prioridades` | Opções de prioridade |
| Chamados    | POST   | `/api/chamados` | Abrir chamado (cliente + responsável opcional, anexos) |
| Chamados    | GET    | `/api/chamados/:id` | Detalhe do chamado |
| Chamados    | PUT    | `/api/chamados/:id` | Atualizar chamado (status, responsável, anexos) |
| Comentário  | POST   | `/api/chamados/:id/comentarios` | Adicionar comentário |
| Contatos    | GET    | `/api/contatos` | Listar mensagens do site (filtro: lido=true/false) |
| Contatos    | GET    | `/api/contatos/unread-count` | Quantidade de contatos não lidos |
| Contatos    | GET    | `/api/contatos/:id` | Ver mensagem |
| Contatos    | PUT    | `/api/contatos/:id/marcar-lido` | Marcar como lido |
| Contatos    | PUT    | `/api/contatos/marcar-todos-lidos` | Marcar todos como lidos |
| Contatos    | PUT    | `/api/contatos/:id` | Atualizar (lido, respondido, observacao) |
| Notificações| GET    | `/api/notificacoes` | Listar (query: lida=true/false) |
| Notificações| GET    | `/api/notificacoes/unread-count` | Badge de não lidas |
| Notificações| PUT    | `/api/notificacoes/:id/marcar-lida` | Marcar uma como lida |
| Notificações| PUT    | `/api/notificacoes/marcar-todas-lidas` | Marcar todas como lidas |

---

## 5. Níveis de acesso (roles)

Use o campo `usuario.role` retornado no login e no `/api/auth/me` para mostrar/ocultar itens no menu e botões:

- **admin / ceo**: usuários, exclusões, configurações.
- **programador / designer**: posts, clientes, chamados.
- **vendedor**: clientes, chamados (sem excluir cliente).
- **suporte**: clientes (leitura), chamados (abrir, comentar, atualizar).

Se o front chamar uma rota sem permissão, a API responde **403**; trate e exiba uma mensagem adequada.

---

## 6. Imagens em JSON (base64) — tudo salvo no MongoDB

Todas as imagens são enviadas no **body JSON** em base64 ou **data URL** e armazenadas no MongoDB (não há upload em disco).

### Formato aceito

- **Data URL** (recomendado): `"data:image/jpeg;base64,/9j/4AAQ..."` — use diretamente em `<img src="...">` no front.
- **Objeto**: `{ "data": "base64string...", "contentType": "image/jpeg" }`.

### Posts (projetos)

- **Criar post**: `POST /api/posts` com **application/json**.
  - **imagemPrincipal** (obrigatório): data URL ou objeto `{ data, contentType }`.
  - **imagensAdicionais** (opcional): array com até 10 itens (data URL ou objeto).
  - Texto: `titulo`, `descricao`, `publicado`, `ordem`, `tags`, `clienteRef`.

Exemplo (JavaScript):
```js
// Converter File para data URL (ex.: input type="file")
const fileToDataUrl = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const imagemPrincipal = await fileToDataUrl(arquivoPrincipal);
const imagensAdicionais = await Promise.all([arquivo1, arquivo2].map(fileToDataUrl));

fetch(`${API_BASE}/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Meu projeto',
    descricao: 'Descrição',
    imagemPrincipal,
    imagensAdicionais
  })
});
```

### Chamados

- **Criar/editar chamado**: **anexos** no body como array (até 5 itens). Cada item: data URL ou `{ data, contentType, filename }`.

### Avatares de usuário

- **PUT** `/api/usuarios/:id` com **application/json** e campo **avatar**: data URL ou `{ data, contentType }`.

---

## 7. Imagens retornadas pela API

A API devolve as imagens como **data URL** nos objetos JSON (ex.: `imagemPrincipal: "data:image/jpeg;base64,..."`). Use diretamente em `<img src="{imagemPrincipal}">`. Tudo fica salvo no MongoDB; não há URLs de arquivo estático.

---

## 8. Notificações no painel

- **GET** `/api/notificacoes/unread-count` → use para um badge “X não lidas”.
- **GET** `/api/notificacoes?lida=false` → listar não lidas.
- Ao clicar em uma notificação: **PUT** `/api/notificacoes/:id/marcar-lida`.
- O campo `link` na notificação pode ser usado para navegar no painel (ex.: `/chamados/123`).

Você pode fazer polling periódico (ex.: a cada 30s) em `unread-count` e na listagem para atualizar o badge e a lista.

---

## 8.1. Contatos (mensagens do site)

Quando alguém envia o formulário de contato no **site do cliente** (POST `/api/contatos` sem auth), a mensagem é salva e uma **notificação** “Novo contato pelo site” é enviada para todos do painel.

No painel você pode:

- **GET** `/api/contatos` — listar mensagens (query `lido=true` ou `lido=false` para filtrar).
- **GET** `/api/contatos/unread-count` — número de contatos não lidos (para badge).
- **GET** `/api/contatos/:id` — ver nome, email, telefone e mensagem.
- **PUT** `/api/contatos/:id/marcar-lido` — marcar como lido.
- **PUT** `/api/contatos/marcar-todos-lidos` — marcar todos como lidos.
- **PUT** `/api/contatos/:id` — atualizar `lido`, `respondido` ou `observacao` (body JSON).

Cada contato tem: `nome`, `email`, `telefone`, `mensagem`, `lido`, `respondido`, `observacao`, `createdAt`.

---

## 9. Exemplo de fluxo no painel

1. **Login** → POST `/api/auth/login` → guardar `token` e `usuario`.
2. **Layout** → GET `/api/auth/me` (opcional, para refrescar dados) e exibir nome/role.
3. **Menu** → mostrar apenas itens permitidos para `usuario.role`.
4. **Listagens** → GET em `/api/usuarios`, `/api/clientes`, `/api/chamados`, `/api/posts` com paginação (`page`, `limit`) e filtros quando existirem.
5. **Formulários** → POST/PUT com JSON; imagens em base64/data URL no body.
6. **Notificações** → polling em `unread-count` e lista; ao abrir, marcar como lida e usar `link` para navegar.

---

## 10. Checklist de integração

- [ ] Variável `API_BASE` configurada (dev/produção).
- [ ] Tela de login usando POST `/api/auth/login` e armazenamento do token.
- [ ] Envio do header `Authorization: Bearer <token>` em todas as requisições autenticadas.
- [ ] Tratamento de 401 (logout) e 403 (sem permissão).
- [ ] Uso de `usuario.role` para exibir/ocultar funcionalidades.
- [ ] Formulários de post com imagemPrincipal e imagensAdicionais em base64/data URL no JSON.
- [ ] Formulários de chamado com cliente, responsável e anexos em base64 no body quando necessário.
- [ ] Exibição de notificações e uso de `unread-count` e marcar como lida.
- [ ] Tela de contatos: listar mensagens do site (GET `/api/contatos`), ver detalhe, marcar como lido; usar `unread-count` para badge.

Com isso, o painel admin fica criado e conectado à API Rootbits.
