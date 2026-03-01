# Estudos de caso no painel administrativo

Este guia explica como **criar e editar** estudos de caso (projetos) no painel admin, no formato de caso com Desafio, Resultado, Sobre o projeto e O que foi feito.

---

## 1. Rotas (exigem autenticação)

Todas as requisições precisam do header:

```http
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

| Ação           | Método | Rota              |
|----------------|--------|-------------------|
| Listar         | GET    | `/api/posts`      |
| Criar          | POST   | `/api/posts`      |
| Ver / editar   | GET    | `/api/posts/:id`  |
| Atualizar      | PUT    | `/api/posts/:id`  |
| Excluir        | DELETE | `/api/posts/:id`  |

---

## 2. Campos do estudo de caso (API)

O post de projeto segue a estrutura de **estudo de caso**:

| Campo na API       | Obrigatório | Descrição |
|--------------------|-------------|-----------|
| `titulo`           | Sim         | Título principal (ex.: "E-commerce de moda") |
| `subtitulo`        | Não         | Linha abaixo do título (ex.: "Marca de roupas") |
| `descricao`        | Sim         | Texto da seção **Sobre o projeto** |
| `imagemPrincipal`  | Sim         | Imagem em data URL ou base64 no JSON |
| `imagensAdicionais`| Não         | Até 10 imagens (data URL ou base64) |
| `tags`             | Não         | Array ou string separada por vírgula (ex.: "E-commerce, UX, SEO") |
| `desafio`          | Não         | Texto do bloco **Desafio** |
| `resultado`        | Não         | Texto do bloco **Resultado** |
| `oQueFoiFeito`     | Não         | Lista de itens da seção **O que foi feito** (array de strings) |
| `ctaTexto`         | Não         | Texto do botão principal (padrão: "Quero um resultado como esse") |
| `ctaLinkTexto`     | Não         | Texto do link secundário (padrão: "Ver outros projetos") |
| `publicado`        | Não         | `true`/`false` (padrão: true) |
| `ordem`            | Não         | Número para ordenação (maior = primeiro) |
| `clienteRef`       | Não         | ID do cliente (ObjectId) associado ao projeto |

---

## 3. Criar estudo de caso (POST /api/posts)

**Body de exemplo:**

```json
{
  "titulo": "E-commerce de moda",
  "subtitulo": "Marca de roupas",
  "descricao": "Projeto de reformulação do e-commerce com foco em conversão e experiência mobile. O site anterior apresentava alto abandono no carrinho e baixa performance em dispositivos móveis. Desenvolvemos nova estrutura de páginas, fluxo de checkout simplificado e integração com meios de pagamento, além de otimização de imagens e performance.",
  "imagemPrincipal": "data:image/jpeg;base64,/9j/4AAQ...",
  "imagensAdicionais": ["data:image/jpeg;base64,..."],
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
  "publicado": true,
  "ordem": 10
}
```

- **imagemPrincipal**: obrigatório; envie em **data URL** (`data:image/jpeg;base64,...`) ou objeto `{ "data": "base64...", "contentType": "image/jpeg" }`.
- **oQueFoiFeito**: array de strings; no formulário pode ser uma lista (um campo por linha) ou um textarea com uma linha por item, convertendo para array no front antes do PUT/POST.

---

## 4. Atualizar estudo de caso (PUT /api/posts/:id)

Envie no body **apenas os campos que deseja alterar** (ou todos). Mesmos nomes e formatos do POST.

Exemplo só atualizando texto e resultado:

```json
{
  "desafio": "Novo desafio descrito aqui.",
  "resultado": "+50% em vendas no segundo trimestre."
}
```

Para **limpar** um campo opcional, envie `null` ou string vazia (ex.: `"subtitulo": ""`).

---

## 5. Formulário sugerido no painel

Organize a tela de criar/editar projeto em seções:

1. **Cabeçalho do caso**
   - Título (`titulo`) *
   - Subtítulo (`subtitulo`)
   - Tags (`tags`) — input com chips ou texto "E-commerce, UX, SEO"

2. **Desafio e resultado**
   - Desafio (`desafio`) — uma linha ou texto curto
   - Resultado (`resultado`) — uma linha ou texto curto (ex.: "+40% em vendas...")

3. **Sobre o projeto**
   - Descrição (`descricao`) * — textarea (parágrafo longo)

4. **O que foi feito**
   - Lista (`oQueFoiFeito`) — vários inputs de texto ou um textarea (uma linha por item), convertendo para `["item 1", "item 2", ...]`

5. **Imagens**
   - Imagem principal (`imagemPrincipal`) * — input file → converter para data URL (ex.: `FileReader.readAsDataURL`) e enviar no JSON
   - Imagens adicionais (`imagensAdicionais`) — até 10; mesmo processo

6. **CTAs (opcional)**
   - Texto do botão (`ctaTexto`) — padrão "Quero um resultado como esse"
   - Texto do link (`ctaLinkTexto`) — padrão "Ver outros projetos"

7. **Publicação**
   - Publicado (`publicado`) — checkbox
   - Ordem (`ordem`) — número (para ordenar na listagem do site)
   - Cliente relacionado (`clienteRef`) — select opcional com lista de clientes (GET `/api/clientes`)

---

## 6. Converter arquivo de imagem para data URL (front)

Para enviar imagens no JSON (sem upload multipart):

```js
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// No submit do form (ex.: imagem principal)
const file = document.querySelector('input[name="imagemPrincipal"]').files[0];
const imagemPrincipal = await fileToDataUrl(file);
// Enviar no body: { ...outrosCampos, imagemPrincipal }
```

Use o mesmo para cada item de `imagensAdicionais`.

---

## 7. Resposta da API (GET listagem e GET por id)

A API devolve os posts com imagens já em **data URL** (ex.: `imagemPrincipal: "data:image/jpeg;base64,..."`). Use diretamente em `<img src={post.imagemPrincipal} />` no painel para preview, e no site do cliente para exibir os estudos de caso.

Com isso, o painel admin consegue criar e editar estudos de caso no formato combinado (Desafio, Resultado, Sobre o projeto, O que foi feito) e os dados ficam disponíveis para o site do cliente e para a listagem interna.
