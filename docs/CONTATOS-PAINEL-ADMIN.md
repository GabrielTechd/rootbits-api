# Contatos no painel administrativo

Como **listar**, **abrir mensagem por mensagem**, **mudar estado** (lido/não lido, respondido), **marcar como lido** e **excluir** as mensagens do formulário de contato do site no painel admin.

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
| **Ver uma mensagem (individual)** | GET | `/api/contatos/:id`        |
| **Mudar estado (lido/respondido)** | PUT | `/api/contatos/:id` (body: `{ lido, respondido }`) |
| Marcar como lido  | PUT    | `/api/contatos/:id/marcar-lido`   |
| Marcar todos lidos| PUT    | `/api/contatos/marcar-todos-lidos`|
| Atualizar         | PUT    | `/api/contatos/:id`               |
| Excluir           | DELETE | `/api/contatos/:id`               |
| Badge (não lidos) | GET    | `/api/contatos/unread-count`      |

---

## 3. Abrir mensagem por mensagem (tela individual)

Cada contato pode ser aberto em uma rota própria, por exemplo `/contatos/[id]`.

**GET** `/api/contatos/:id` — retorna um único contato com todos os campos: `_id`, `nome`, `email`, `telefone`, `mensagem`, `lido`, `respondido`, `observacao`, `createdAt`, `updatedAt`.

**No front (ex.: Next.js App Router):**

```jsx
// app/contatos/[id]/page.jsx (ou pages/contatos/[id].jsx)
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function ContatoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [contato, setContato] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/contatos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setContato)
      .catch(() => setContato(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!contato) return <p>Contato não encontrado.</p>;

  return (
    <div>
      <button type="button" onClick={() => router.push('/contatos')}>← Voltar</button>
      <h1>{contato.nome}</h1>
      <p>{contato.email}</p>
      {contato.telefone && <p>{contato.telefone}</p>}
      <p>{contato.mensagem}</p>
      <p>Lido: {contato.lido ? 'Sim' : 'Não'}</p>
      <p>Respondido: {contato.respondido ? 'Sim' : 'Não'}</p>
      {contato.observacao && <p>Observação: {contato.observacao}</p>}
      {/* Aqui você pode colocar os botões de mudar estado e excluir */}
    </div>
  );
}
```

**Na listagem**, cada linha deve linkar para a mensagem individual:

```jsx
<Link href={`/contatos/${item._id}`}>{item.nome} — {item.email}</Link>
// ou
<button type="button" onClick={() => router.push(`/contatos/${item._id}`)}>
  Abrir
</button>
```

---

## 4. Mudar estado por mensagem (lido / respondido)

Você pode alterar **lido** e **respondido** de **uma mensagem específica** com **PUT** `/api/contatos/:id`.

**Body (envie só o que for alterar):**
```json
{ "lido": true }
{ "lido": false }
{ "respondido": true }
{ "respondido": false }
{ "lido": true, "respondido": true }
```

**Exemplo no front — toggle “Lido” em uma mensagem:**

```js
async function toggleLido(id, valorAtual) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/contatos/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lido: !valorAtual }),
  });
  if (res.ok) {
    const atualizado = await res.json();
    setContato(atualizado); // ou atualizar na lista
  }
}
```

**Exemplo — toggle “Respondido”:**

```js
async function toggleRespondido(id, valorAtual) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/contatos/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ respondido: !valorAtual }),
  });
  if (res.ok) {
    const atualizado = await res.json();
    setContato(atualizado);
  }
}
```

**Na tela da mensagem individual (ou na listagem):**

```jsx
<label>
  <input
    type="checkbox"
    checked={contato.lido}
    onChange={() => toggleLido(contato._id, contato.lido)}
  />
  Lido
</label>
<label>
  <input
    type="checkbox"
    checked={contato.respondido}
    onChange={() => toggleRespondido(contato._id, contato.respondido)}
  />
  Respondido
</label>
```

Assim, cada mensagem pode ter seu estado alterado **individualmente**.

---

## 5. Excluir um contato

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

## 6. Resumo para implementar no painel

1. **Listagem** — GET `/api/contatos` (opcional: `?lido=false` para só não lidos). Tabela ou cards com nome, email, trecho e data; cada linha com link para `/contatos/:id`.
2. **Abrir mensagem individual** — Rota `/contatos/[id]` que chama GET `/api/contatos/:id` e exibe nome, email, telefone, mensagem, lido, respondido, observação.
3. **Mudar estado por mensagem** — PUT `/api/contatos/:id` com body `{ lido: true/false }` e/ou `{ respondido: true/false }`. Use checkboxes ou botões que chamem essa rota e atualizem o estado no front.
4. **Marcar como lido (rápido)** — PUT `/api/contatos/:id/marcar-lido` (sem body) se quiser só “marcar lido” sem enviar body.
5. **Badge** — GET `/api/contatos/unread-count` → `{ count: N }`. Exibir “N não lidos” no menu.
6. **Excluir** — DELETE `/api/contatos/:id`. Confirmar e, após 204, remover da lista ou redirecionar para `/contatos`.

Com isso, o painel consegue listar, **abrir cada mensagem individual** e **mudar estado (lido/respondido) por mensagem**, além de marcar lido e excluir.
