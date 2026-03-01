# Estudos de caso e contato no site do cliente

Este guia explica como exibir os **estudos de caso** (projetos) no site do cliente e integrar a **seção de contato** usando a API Rootbits.

---

## 1. URL base da API

Defina em um único lugar no front do site (ex.: variável de ambiente):

```js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://rootbits-api.vercel.app/api';
```

---

## 2. Listar estudos de caso (portfólio)

**GET** `/api/posts?publicado=true` — não exige autenticação.

**Resposta (200):**
```json
{
  "dados": [
    {
      "_id": "...",
      "titulo": "E-commerce de moda",
      "subtitulo": "Marca de roupas",
      "descricao": "Projeto de reformulação do e-commerce...",
      "tecnologiasUsadas": ["React", "Next.js", "Node.js", "MongoDB"],
      "linkProjeto": "https://loja-exemplo.com.br",
      "imagemPrincipal": "data:image/jpeg;base64,...",
      "imagensAdicionais": ["data:image/..."],
      "tags": ["E-commerce", "UX", "SEO"],
      "desafio": "Aumentar conversão e experiência mobile.",
      "resultado": "+40% em vendas online no primeiro trimestre.",
      "oQueFoiFeito": [
        "Redesign da vitrine e das páginas de produto",
        "Checkout responsivo e simplificado",
        "Otimização de performance (Core Web Vitals)",
        "SEO técnico e estrutura de dados",
        "Integração com analytics e métricas de conversão"
      ],
      "ctaTexto": "Quero um resultado como esse",
      "ctaLinkTexto": "Ver outros projetos",
      "ordem": 0,
      "createdAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

- Use `dados` para montar a listagem (cards na home ou página “Projetos”).
- Ordene por `ordem` (maior primeiro) e `createdAt`; a API já retorna ordenado.
- Paginação: `?page=2&limit=10`.

---

## 3. Detalhe de um estudo de caso

**GET** `/api/posts/:id` — não exige autenticação.

Use para a página interna do projeto (ex.: `/projetos/[id]` ou `/estudos-de-caso/[slug]`). A API não tem slug; use o `_id` do post na URL ou mantenha um mapa id → rota no front.

**Resposta (200):** o mesmo objeto do item em `dados`, com todos os campos (incluindo `imagensAdicionais`).

---

## 4. Estrutura sugerida na página (estudo de caso)

Seguindo o layout de referência:

| Bloco na tela        | Campo da API     | Exemplo |
|----------------------|------------------|---------|
| Label da seção       | fixo             | "Estudo de caso" |
| Título principal     | `titulo`         | "E-commerce de moda" |
| Subtítulo / tipo     | `subtitulo`      | "Marca de roupas" |
| Tags (badges)        | `tags`           | "E-commerce", "UX", "SEO" |
| **Tecnologias usadas**| `tecnologiasUsadas` | "React", "Next.js", "MongoDB" (badges) |
| **Desafio**          | `desafio`        | "Aumentar conversão e experiência mobile." |
| **Resultado**        | `resultado`      | "+40% em vendas online no primeiro trimestre." |
| **Sobre o projeto**  | `descricao`      | Parágrafo longo |
| **O que foi feito**  | `oQueFoiFeito`   | Lista com bullets |
| **Link do projeto**  | `linkProjeto`    | URL para o site em produção (botão "Ver projeto") |
| Imagem principal     | `imagemPrincipal`| `<img src={post.imagemPrincipal} />` |
| Galeria              | `imagensAdicionais` | Um item por imagem |
| Botão CTA            | `ctaTexto`       | "Quero um resultado como esse" |
| Link secundário      | `ctaLinkTexto`   | "Ver outros projetos" (levar para lista de projetos) |

Exemplo em React/Next (estrutura apenas):

```jsx
<article>
  <p className="label">Estudo de caso</p>
  <h1>{post.titulo}</h1>
  {post.subtitulo && <p className="subtitulo">{post.subtitulo}</p>}
  <div className="tags">
    {post.tags?.map((tag) => <span key={tag}>{tag}</span>)}
  </div>
  {post.tecnologiasUsadas?.length > 0 && (
    <div className="tecnologias">
      {post.tecnologiasUsadas.map((tech) => <span key={tech}>{tech}</span>)}
    </div>
  )}

  {post.desafio && (
    <section>
      <h2>Desafio</h2>
      <p>{post.desafio}</p>
    </section>
  )}
  {post.resultado && (
    <section>
      <h2>Resultado</h2>
      <p>{post.resultado}</p>
    </section>
  )}

  <section>
    <h2>Sobre o projeto</h2>
    <p>{post.descricao}</p>
  </section>

  {post.oQueFoiFeito?.length > 0 && (
    <section>
      <h2>O que foi feito</h2>
      <ul>
        {post.oQueFoiFeito.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </section>
  )}

  {post.imagemPrincipal && (
    <img src={post.imagemPrincipal} alt={post.titulo} />
  )}
  {post.imagensAdicionais?.length > 0 && (
    <div className="galeria">
      {post.imagensAdicionais.map((src, i) => (
        <img key={i} src={src} alt={`${post.titulo} ${i + 1}`} />
      ))}
    </div>
  )}

  {post.linkProjeto && (
    <a href={post.linkProjeto} target="_blank" rel="noopener noreferrer" className="link-projeto">Ver projeto</a>
  )}
  <a href="/contato" className="cta">{post.ctaTexto || 'Quero um resultado como esse'}</a>
  <a href="/projetos">{post.ctaLinkTexto || 'Ver outros projetos'}</a>
</article>
```

---

## 5. Formulário de contato

**POST** `/api/contatos` — **sem** autenticação. Body JSON:

```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "mensagem": "Gostaria de um orçamento para um e-commerce."
}
```

**Exemplo no front:**

```js
const res = await fetch(`${API_BASE}/contatos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: form.nome,
    email: form.email,
    telefone: form.telefone,
    mensagem: form.mensagem,
  }),
});

if (res.ok) {
  // Sucesso (201)
} else {
  const data = await res.json().catch(() => ({}));
  // data.erro com mensagem de validação
}
```

- **201**: contato criado.
- **400**: corpo inválido ou campos obrigatórios faltando (`nome`, `email`, `mensagem` são obrigatórios; `telefone` opcional).

Coloque esse formulário na página **Contato** e, se quiser, um CTA “Quero um resultado como esse” nos estudos de caso apontando para `/contato`.

---

## 6. Resumo de endpoints (site do cliente)

| Ação              | Método | Rota                    | Auth |
|-------------------|--------|-------------------------|------|
| Listar projetos   | GET    | `/api/posts?publicado=true` | Não  |
| Detalhe do projeto| GET    | `/api/posts/:id`        | Não  |
| Enviar contato    | POST   | `/api/contatos`         | Não  |

Com isso, o site do cliente exibe os estudos de caso no formato combinado (Desafio, Resultado, Sobre o projeto, O que foi feito) e envia o contato para a API; as mensagens aparecem no painel admin.
