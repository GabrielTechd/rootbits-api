# Contatos no painel administrativo

Como **listar**, **ver**, **marcar como lido** e **excluir** as mensagens do formulário de contato do site no painel admin.

---

## 1. Autenticação

Todas as rotas abaixo exigem login. Envie o header em toda requisição:

```http
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

---

## 2. Rotas de contatos

| Ação              | Método | Rota                              |
|-------------------|--------|-----------------------------------|
| Listar            | GET    | `/api/contatos`                   |
| Ver um contato    | GET    | `/api/contatos/:id`               |
| Marcar como lido  | PUT    | `/api/contatos/:id/marcar-lido`   |
| Marcar todos lidos| PUT    | `/api/contatos/marcar-todos-lidos`|
| Atualizar         | PUT    | `/api/contatos/:id`               |
| **Excluir**       | **DELETE** | **`/api/contatos/:id`**       |
| Badge (não lidos) | GET    | `/api/contatos/unread-count`      |

---

## 3. Excluir um contato

**DELETE** `/api/contatos/:id`

- **204**: contato excluído (resposta sem body).
- **404**: contato não encontrado.

**Exemplo no front (React/Next ou fetch):**

```js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // ex.: https://rootbits-api.vercel.app/api
const token = localStorage.getItem('token'); // ou do seu contexto de auth

async function excluirContato(id) {
  if (!confirm('Excluir esta mensagem?')) return;
  const res = await fetch(`${API_BASE}/contatos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (res.status === 204) {
    // Sucesso: remover da lista ou redirecionar (ex.: router.push('/contatos'))
    setContatos((prev) => prev.filter((c) => c._id !== id));
  } else if (res.status === 404) {
    alert('Contato não encontrado.');
  } else {
    const data = await res.json().catch(() => ({}));
    alert(data.erro || 'Erro ao excluir');
  }
}
```

**Uso no botão da tela de detalhe ou da listagem:**

```jsx
<button type="button" onClick={() => excluirContato(contato._id)}>
  Excluir
</button>
```

Ou na listagem, um ícone de lixeira por linha:

```jsx
<button
  type="button"
  aria-label="Excluir"
  onClick={() => excluirContato(item._id)}
>
  🗑
</button>
```

---

## 4. Resumo para implementar no painel

1. **Listagem** — GET `/api/contatos` (opcional: `?lido=false` para só não lidos). Exiba tabela ou cards com nome, email, trecho da mensagem e data.
2. **Detalhe** — GET `/api/contatos/:id`. Mostre nome, email, telefone, mensagem, lido, respondido, observação.
3. **Marcar lido** — PUT `/api/contatos/:id/marcar-lido` (sem body). Atualize o estado/local após sucesso.
4. **Badge** — GET `/api/contatos/unread-count` → `{ count: N }`. Use para exibir “N não lidos” no menu.
5. **Excluir** — DELETE `/api/contatos/:id`. Confirme com o usuário e, após 204, remova o item da lista ou redirecione para `/contatos`.

Com isso, o painel admin consegue listar, ver, marcar como lido e **excluir** contatos.
