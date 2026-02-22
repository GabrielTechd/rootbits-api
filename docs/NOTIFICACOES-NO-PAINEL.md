# Como mostrar as notificações no painel

Todas as requisições abaixo precisam do header **Authorization: Bearer &lt;token&gt;** (usuário logado).

---

## 1. Listar notificações

**GET** `/api/notificacoes`

**Query (opcional):**
- `lida=true` — só as que você já leu
- `lida=false` — só as não lidas
- `page=1` e `limit=30` — paginação

**Resposta (200):**
```json
{
  "dados": [
    {
      "_id": "...",
      "tipo": "contato_novo",
      "titulo": "Novo contato pelo site",
      "mensagem": "João (joao@email.com) enviou uma mensagem.",
      "link": "/contatos/123",
      "lida": false,
      "createdAt": "2025-02-21T...",
      "criadoPor": { "nome": "Sistema" }
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 30
}
```

Use o array **`dados`** para montar a lista na tela. O campo **`lida`** indica se o usuário atual já leu. O **`link`** pode ser usado para navegar ao clicar (ex.: abrir a página do contato).

---

## 2. Número de não lidas (badge)

**GET** `/api/notificacoes/unread-count`

**Resposta (200):**
```json
{ "count": 3 }
```

Use **`count`** no ícone de sino (ex.: badge com o número).

---

## 3. Marcar uma como lida

**PUT** `/api/notificacoes/:id/marcar-lida`

Ao clicar em uma notificação, chame isso com o **`_id`** dela e depois atualize a lista (ou o `unread-count`).

---

## 4. Marcar todas como lidas

**PUT** `/api/notificacoes/marcar-todas-lidas`

Sem parâmetro na URL. Use no botão “Marcar todas como lidas”.

---

## Exemplo em JavaScript (fetch)

```js
const API = 'http://localhost:3030/api';
const token = localStorage.getItem('token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Listar não lidas
async function getNotificacoesNaoLidas() {
  const res = await fetch(`${API}/notificacoes?lida=false&limit=20`, { headers });
  const json = await res.json();
  return json.dados;
}

// Listar todas (para o dropdown/lista)
async function getNotificacoes(page = 1) {
  const res = await fetch(`${API}/notificacoes?page=${page}&limit=20`, { headers });
  return res.json();
}

// Badge: quantidade de não lidas
async function getUnreadCount() {
  const res = await fetch(`${API}/notificacoes/unread-count`, { headers });
  const json = await res.json();
  return json.count;
}

// Marcar uma como lida
async function marcarLida(id) {
  await fetch(`${API}/notificacoes/${id}/marcar-lida`, { method: 'PUT', headers });
}

// Marcar todas como lidas
async function marcarTodasLidas() {
  await fetch(`${API}/notificacoes/marcar-todas-lidas`, { method: 'PUT', headers });
}
```

---

## Exemplo de uso no React

```tsx
// Estado
const [notificacoes, setNotificacoes] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [aberto, setAberto] = useState(false);

// Carregar lista e badge ao montar e quando abrir o dropdown
useEffect(() => {
  if (!token) return;
  getNotificacoes().then((res) => setNotificacoes(res.dados));
  getUnreadCount().then(setUnreadCount);
}, [token, aberto]);

// Ao clicar em uma notificação
async function handleClickNotificacao(notif) {
  if (!notif.lida) await marcarLida(notif._id);
  setUnreadCount((c) => Math.max(0, c - 1));
  if (notif.link) navigate(notif.link); // React Router
  setAberto(false);
}

// Exibir no JSX
<button onClick={() => setAberto(!aberto)}>
  🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</button>
{aberto && (
  <div className="dropdown">
    {notificacoes.map((n) => (
      <div
        key={n._id}
        onClick={() => handleClickNotificacao(n)}
        className={n.lida ? 'lida' : 'nao-lida'}
      >
        <strong>{n.titulo}</strong>
        <p>{n.mensagem}</p>
        <small>{new Date(n.createdAt).toLocaleString()}</small>
      </div>
    ))}
  </div>
)}
```

---

## Resumo

| Ação              | Método | Rota                                      |
|-------------------|--------|-------------------------------------------|
| Listar            | GET    | `/api/notificacoes?lida=false&page=1`     |
| Contagem não lidas| GET    | `/api/notificacoes/unread-count`          |
| Marcar uma lida   | PUT    | `/api/notificacoes/:id/marcar-lida`       |
| Marcar todas lidas| PUT    | `/api/notificacoes/marcar-todas-lidas`     |

Sempre envie o **token** no header. Use **`dados`** para exibir a lista e **`count`** para o badge.
