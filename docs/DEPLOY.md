# Deploy: Vercel + GitHub

Guia para enviar o projeto ao **GitHub** e publicar a API na **Vercel**.

---

## 1. Preparar para o GitHub

### 1.1 Arquivos ignorados

O `.gitignore` já evita subir no repositório:

- `node_modules/`
- `.env` (nunca commitar senhas e chaves)
- `uploads/`
- `.vercel/`
- logs e arquivos de sistema

### 1.2 Enviar para o GitHub

No terminal, na pasta do projeto:

```bash
git init
git add .
git commit -m "feat: API Rootbits - auth, posts, clientes, chamados, contatos, notificações"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/rootbits-api.git
git push -u origin main
```

Troque `SEU_USUARIO/rootbits-api` pelo seu usuário e nome do repositório. Se o repositório já existir, use a URL que o GitHub mostrar.

### 1.3 Variáveis sensíveis

- **Não** coloque `.env` no Git.
- No GitHub, use **Settings → Secrets and variables → Actions** se for usar CI/CD.
- Para a Vercel, as variáveis são configuradas no painel da Vercel (abaixo).

---

## 2. Deploy na Vercel

### 2.1 Conectar o repositório

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Add New… → Project**.
3. **Import** o repositório do GitHub (ex.: `rootbits-api`).
4. A Vercel detecta que é um projeto Node e usa o `vercel.json` do repositório.
5. Não é necessário alterar **Build Command** nem **Output Directory** (a API roda como serverless).

### 2.2 Variáveis de ambiente

Em **Project → Settings → Environment Variables** adicione:

| Nome | Valor | Observação |
|------|--------|------------|
| `MONGODB_URI` | `mongodb+srv://...` | String de conexão do MongoDB (Atlas) |
| `JWT_SECRET` | uma chave longa e aleatória | Ex.: gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Opcional |
| `CORS_ORIGIN` | `https://painel.seudominio.com,https://seudominio.com` | URLs dos frontends, separadas por vírgula |

Não é obrigatório definir `PORT` nem `VERCEL` (a Vercel define o que precisar).

### 2.3 Deploy

- Clique em **Deploy**.
- Após o build, a API ficará em um domínio do tipo `https://rootbits-api-xxx.vercel.app`.
- Para usar seu próprio domínio: **Settings → Domains**.

### 2.4 URL da API

Use a URL do projeto, por exemplo:

- `https://rootbits-api.vercel.app/api`
- `https://rootbits-api.vercel.app/api/health`

Configure essa **URL base** no painel admin e no site do cliente (ex.: `VITE_API_URL` ou `NEXT_PUBLIC_API_URL`).

---

## 3. Criar o primeiro admin em produção

O seed não roda automaticamente na Vercel. Duas opções:

**Opção A – Script local apontando para o MongoDB de produção**

1. No seu `.env` local, use o mesmo `MONGODB_URI` da Vercel (só para rodar o seed).
2. Rode: `npm run seed-admin`.
3. Depois remova ou altere o `MONGODB_URI` local se não quiser usar produção no dia a dia.

**Opção B – Endpoint temporário (só se você criar)**

- Criar uma rota protegida (ex.: por uma senha de deploy) que chama a mesma lógica do seed e cria o admin. Não deixe essa rota ativa em produção por muito tempo.

---

## 4. Limites e dicas (Vercel)

- **Serverless:** cada request pode ter tempo limite (ex.: 10 s no plano gratuito). Requisições muito pesadas (ex.: muitos base64 de imagens) podem precisar de otimização.
- **Body size:** a Vercel limita o tamanho do body da requisição (ex.: 4,5 MB no plano Hobby). Se precisar enviar imagens grandes, considere comprimir no front ou usar um serviço de upload (ex.: Cloudinary) e enviar só a URL.
- **MongoDB:** use **MongoDB Atlas** com a string de conexão em `MONGODB_URI`.
- **CORS:** em produção, preencha `CORS_ORIGIN` com as URLs reais do painel e do site.
- **Cold start:** a primeira requisição após um tempo sem uso pode ser mais lenta; as seguintes tendem a ser rápidas.

---

## 5. Resumo

| Passo | Ação |
|-------|------|
| 1 | Garantir que `.env` está no `.gitignore` e não será commitado |
| 2 | `git init`, `git add .`, `git commit`, `git remote add origin`, `git push` |
| 3 | Na Vercel: importar o repositório e configurar `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` |
| 4 | Deploy e anotar a URL da API (ex.: `https://rootbits-api.vercel.app`) |
| 5 | Rodar o seed do admin (local com `MONGODB_URI` de produção ou método alternativo) |
| 6 | Configurar os frontends para usar a URL da API em produção |

Com isso, o projeto fica pronto para GitHub e Vercel.
