# 💵 meuSaldo

[![Licença: MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)

🚀 **Veja em ação**: [https://meusaldo-finance.vercel.app](https://meusaldo-finance.vercel.app)

📦 **Ambiente de produção**  
O frontend está hospedado na Vercel, o backend na Railway e o banco de dados PostgreSQL é gerenciado pela Neon.

meuSaldo é uma aplicação web para controle financeiro pessoal, permitindo gerenciar receitas, despesas, contas a pagar, orçamentos e metas financeiras de forma simples e organizada.

## 📌 Funcionalidades

- Gerenciamento de contas a pagar

- Controle de transações (receitas e despesas)

- Criação e acompanhamento de orçamentos por categoria

- Definição de metas financeiras

- Categorias personalizadas por usuário

## 📷 Capturas de telas

### Tela de Login
![Tela de Login](public/screenshots/login.png)

### Tela de Dashboard
![Tela de Dashboard](public/screenshots/dashboard.png)

### Tela de Transações
![Tela de Transações](public/screenshots/transacoes.png)

### Tela de Metas
![Tela de Metas](public/screenshots/metas.png)

### Tela de Contas a Pagar
![Tela de Contas a Pagar](public/screenshots/contas-pagar.png)


## 🛠️ Tecnologias Utilizadas
### Frontend

Next.js | React | TypeScript | Context API | CSS Modules | Bootstrap

### Backend

Node.js | Express | Prisma ORM | PostgreSQL (Neon) | JWT | Bcrypt

## Testes

Jest | Supertest

## DevOps / Infra

GitHub Actions (CI) | Vercel (Frontend deploy) | Railway (Backend deploy)

### Outros

Git / GitHub

## ⚙️ Como Rodar o Projeto 
### Pré-requisitos

- Node.js (>= 18)
- PostgreSQL
- Git

###  Clonar o repositório

```bash
git clone https://github.com/DavGomess/meuSaldo.git

cd meuSaldo
```
### Instalar dependências

```bash
npm install
```
### 🔑 Configurar variáveis de ambiente

### Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:

```bash
DATABASE_URL=postgresql://usuario:senha@localhost:5432/seubanco
JWT_SECRET=suachave
JWT_RESET_SECRET=suachave_reset
NEXT_PUBLIC_API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

### Rodar migrations

```bash
npx prisma migrate dev
```
### 🚀 Iniciar a aplicação

```bash
npm run dev
```

### acesse a aplicação em:

```bash
 http://localhost:3000
```

### 🧪 Rodar testes

```bash
npm run test
```

### 🔒 Segurança

● Tokens JWT com expiração

● Prevenção de enumeração de e-mails

● Hash de senha com bcrypt

● Invalidação de token de redefinição após uso

● Rotas protegidas no frontend


## 👤 Autor

Desenvolvido por [David Gomes](https://github.com/DavGomess)  

[![GitHub](https://img.shields.io/badge/GitHub-DavGomess-black?logo=github)](https://github.com/DavGomess) [![LinkedIn](https://img.shields.io/badge/LinkedIn-David%20Gomes-blue?logo=linkedin)](https://www.linkedin.com/in/DavGomess)
