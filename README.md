# Rootbits API

API da **Rootbits** para o painel administrativo e site do cliente. MongoDB + Node.js (Express).

## Estrutura (pasta `src/`)

```
src/
├── config/       # Conexão MongoDB
├── models/       # User, Post, Client, Ticket, Notification
├── middleware/   # auth, upload
├── utils/       # notify
├── controllers/
├── routes/
├── scripts/      # seed-admin.js
└── app.js        # Entrada da aplicação
```

## Configuração

1. Instale as dependências: `npm install`
2. Copie `.env.example` para `.env` e ajuste (MONGODB_URI, JWT_SECRET, etc.).
3. Crie o primeiro admin: `npm run seed-admin` ou `node src/scripts/seed-admin.js`  
   Opcional no `.env`: `ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA`.
4. Inicie: `npm run dev` ou `npm start`

## Documentação de conexão

- **[docs/CONEXAO-PAINEL-ADMIN.md](docs/CONEXAO-PAINEL-ADMIN.md)** — Como criar e conectar o **painel administrativo** à API (login, token, CRUD, uploads, notificações, níveis de acesso).
- **[docs/CONEXAO-SITE-CLIENTE.md](docs/CONEXAO-SITE-CLIENTE.md)** — Como criar e conectar o **site do cliente** à API (listagem e detalhe de projetos/portfólio, sem login).

## Endpoints principais

| Recurso | Descrição |
|--------|-----------|
| **Auth** | `POST /api/auth/login` (email, senha) → token. `GET /api/auth/me` (Bearer). |
| **Usuários** | CRUD em `/api/usuarios`. Roles: admin, ceo, programador, designer, vendedor, suporte. |
| **Posts (projetos)** | CRUD em `/api/posts`. 1 imagem principal + até 10 adicionais (multipart). Listagem pública (sem auth). |
| **Clientes** | CRUD em `/api/clientes`. `GET /api/clientes/tipos-site`. |
| **Chamados** | CRUD em `/api/chamados`. Comentários: `POST /api/chamados/:id/comentarios`. Anexos no create/update. |
| **Contatos** | POST `/api/contatos` (público: nome, email, telefone, mensagem). No painel: listar, marcar lido, unread-count. |
| **Notificações** | `GET /api/notificacoes`, `GET /api/notificacoes/unread-count`, marcar lida(s). |

## Níveis de acesso

- **admin / ceo**: acesso total, criar/editar usuários, deletar cliente/post/chamado.
- **programador / designer / vendedor / suporte**: criar/editar clientes, posts (conforme role), abrir/editar chamados, ver notificações.

## Imagens (tudo no MongoDB)

- Imagens são enviadas no **body JSON** em **base64** ou **data URL** e armazenadas no MongoDB (Buffer + contentType).
- Posts: `imagemPrincipal` (obrigatório) e `imagensAdicionais` (até 10). Chamados: `anexos` (até 5). Usuário: `avatar`.
- A API devolve as imagens como data URL nos objetos (ex.: `imagemPrincipal: "data:image/jpeg;base64,..."`).

## Deploy (Vercel + GitHub)

- **[docs/DEPLOY.md](docs/DEPLOY.md)** — Passo a passo para enviar o projeto ao **GitHub** e publicar na **Vercel** (variáveis de ambiente, primeiro admin, CORS).
