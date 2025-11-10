# 🎓 Portal do Professor

Portal do Professor é uma aplicação web completa para gerenciamento acadêmico, desenvolvida com tecnologias modernas e boas práticas de desenvolvimento.

## 🌐 Acesso à Aplicação

**Aplicação em Produção:** [https://portal-professor-seven.vercel.app](https://portal-professor-seven.vercel.app)

## 📋 Sobre o Projeto

Sistema web voltado para o gerenciamento acadêmico que permite:

- 🔐 Autenticação segura via JWT com refresh tokens
- 👨‍🎓 Gerenciamento completo de alunos e professores
- 📚 Controle de turmas e matrículas
- 📊 Sistema de avaliações com pesos personalizáveis
- 🎨 Interface responsiva e moderna
- ✨ Feedbacks visuais intuitivos
- 🏗️ Arquitetura modular e escalável

## 🛠️ Tecnologias

### Frontend

- **React 18** com TypeScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **React Hook Form + Zod** - Validação de formulários
- **React Router** - Navegação
- **Vitest** - Testes unitários

### Backend

- **NestJS** - Framework Node.js
- **TypeScript** - Tipagem estática
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação
- **Bcrypt** - Hash de senhas
- **Swagger** - Documentação da API

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o Repositório

```bash
git clone https://github.com/pedorooo/PortalProfessor.git
cd PortalProfessor
```

### 2. Configuração do Backend

```bash
cd backend
```

#### 2.1. Instale as Dependências

```bash
npm install
```

#### 2.2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/portal_professor"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui"
JWT_EXPIRES_IN="15m"

# Refresh Token
REFRESH_TOKEN_SECRET="seu-refresh-secret-super-seguro-aqui"
REFRESH_TOKEN_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
```

#### 2.3. Configure o Banco de Dados

```bash
# Executar migrations
npx prisma migrate dev

# (Opcional) Popular o banco com dados de exemplo
npm run seed
```

#### 2.4. Inicie o Servidor Backend

```bash
# Modo desenvolvimento (com hot reload)
npm run start:dev

# Ou modo produção
npm run build
npm run start:prod
```

O backend estará rodando em `http://localhost:3000`

📚 **Documentação da API (Swagger):** `http://localhost:3000/api`

### 3. Configuração do Frontend

Em outro terminal:

```bash
cd frontend
```

#### 3.1. Instale as Dependências

```bash
npm install
```

#### 3.2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:3000
```

#### 3.3. Inicie o Servidor Frontend

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
npm test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

### Frontend

```bash
cd frontend

# Testes unitários
npm test

# Testes com interface
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 📁 Estrutura do Projeto

```
PortalProfessor/
├── backend/                 # API NestJS
│   ├── prisma/             # Schema e migrations do Prisma
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── professors/     # Módulo de professores
│   │   ├── students/       # Módulo de alunos
│   │   ├── classes/        # Módulo de turmas
│   │   ├── enrollments/    # Módulo de matrículas
│   │   ├── evaluations/    # Módulo de avaliações
│   │   └── common/         # Utilitários e decorators
│   └── test/               # Testes e2e
│
└── frontend/               # Aplicação React
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── pages/          # Páginas da aplicação
    │   ├── context/        # Context API
    │   ├── hooks/          # Custom hooks
    │   ├── utils/          # Funções utilitárias
    │   └── types/          # Tipos TypeScript
    └── __tests__/          # Testes unitários
```

## 🔑 Credenciais de Teste

Após executar o seed do banco de dados, você pode usar:

**Professor:**

- Email: `professor@example.com`
- Senha: `password123`

**Aluno:**

- Email: `student@example.com`
- Senha: `password123`

## 👨‍💻 Autor

Desenvolvido por [Pedro Novaes](https://github.com/pedorooo)
