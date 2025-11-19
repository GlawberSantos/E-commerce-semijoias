# 💎 Gabrielly Semijoias - E-Commerce Completo

<div align="center">

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Plataforma de e-commerce de semijoias com painel administrativo, carrinho inteligente e integração de pagamentos.**

[🌐 Website](#) • [📚 Documentação](#-documentação) • [🐛 Issues](#-problemas) • [🤝 Contribuir](#-contribuições)

</div>

---

## 🎯 Sobre o Projeto

Gabrielly Semijoias é um e-commerce **production-ready** para venda de semijoias, desenvolvido com as mais modernas tecnologias de segurança, performance e user experience.

### ✨ Destaques

- 🔐 **Segurança em primeiro lugar:** Bcrypt, CSRF, Rate Limiting, Headers OWASP
- 🎨 **UI/UX Moderna:** React com Context API, CSS responsivo, Dark Mode
- 💳 **Pagamentos Integrados:** MercadoPago com webhook
- 📦 **Frete Automático:** Integração Melhor Envio com cálculo em tempo real
- 🤖 **Chatbot IA:** Assistente virtual com Google Generative AI
- 📊 **Dashboard Admin:** Estatísticas, gráficos, gestão completa
- 🔍 **SEO Otimizado:** Meta tags dinâmicas, sitemap, Open Graph
- 📧 **Email Marketing:** Newsletter com Nodemailer
- ⚡ **Performance:** Cache com Redis, compressão GZIP, CDN ready
- 🐳 **Docker:** Containerizado para fácil deploy

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ (ou use Docker)
- PostgreSQL 15+ (ou use Docker Compose)
- npm ou yarn

### Instalação Local

#### 1. Clone o repositório

```bash
git clone https://github.com/GlawberSantos/E-commerce-semijoias.git
cd site_GSJ
```

#### 2. Backend Setup

```bash
cd gabrielly-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com seus valores

# Iniciar com Docker Compose
docker-compose up -d

# Ou rodar localmente (com banco já rodando)
npm start
# Servidor rodará em http://localhost:5001
```

#### 3. Frontend Setup

```bash
cd ../gabrielly-frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
# App abrir em http://localhost:3000
```

### Instalação com Docker (Recomendado)

```bash
# Na pasta gabrielly-backend
docker-compose up -d

# Isso inicia:
# - PostgreSQL em localhost:5432
# - Node.js Backend em localhost:5001
```

---

## 📚 Documentação

### 📖 Guias Principais

| Documento | Descrição |
|-----------|-----------|
| [**FUNCIONALIDADES.md**](./FUNCIONALIDADES.md) | Status completo de todas as features |
| [**SEGURANCA_GUIA.md**](./SEGURANCA_GUIA.md) | Guia de segurança e implementações |
| [**AUDITORIA_SEGURANCA.md**](./AUDITORIA_SEGURANCA.md) | Checklist e auditoria de segurança |

### 🔧 Configuração Detalhada

#### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# ========== DATABASE ==========
DB_HOST=localhost
DB_PORT=5432
DB_USER=gabrielly
DB_PASSWORD=gabrielly123
DB_NAME=gabrielly_semijoias

# ========== JWT ==========
JWT_SECRET=sua_chave_super_segura_aqui_min_32_chars

# ========== PAGAMENTO ==========
MERCADOPAGO_TOKEN=seu_token_mp

# ========== EMAIL ==========
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# ========== IA ==========
OPENAI_API_KEY=sua_chave_openai
# ou
OPENROUTER_API_KEY=sua_chave_openrouter

# ========== FRETE ==========
MELHOR_ENVIO_TOKEN=seu_token

# ========== OUTROS ==========
NODE_ENV=development
PORT=5001
SENTRY_DSN=seu_sentry_dsn_opcional
```

---

## 📁 Estrutura do Projeto

### Backend (Node.js + Express)

```
gabrielly-backend/
├── config/              # Configurações (segurança, headers)
├── middleware/          # Middlewares (auth, rate limiting, validation)
├── services/            # Lógica de negócio (cache, orders, products)
├── utils/               # Utilidades (passwords, auth, email, frete)
├── __tests__/           # Testes unitários
├── init.sql             # Schema do banco de dados
├── server.js            # Aplicação principal
├── db.js                # Conexão com PostgreSQL
├── docker-compose.yml   # Orquestração de containers
└── package.json         # Dependências
```

### Frontend (React)

```
gabrielly-frontend/
├── public/
│   └── products/        # Imagens de produtos (aneis, brincos, etc)
├── src/
│   ├── components/      # Componentes React (29 componentes)
│   ├── contexts/        # Context API (Auth, Cart, Theme)
│   ├── styles/          # CSS global + componentes
│   ├── utils/           # Funções auxiliares
│   ├── api.js           # Chamadas à API
│   └── App.js           # Componente raiz
├── package.json         # Dependências
└── public/index.html    # HTML raiz
```

---

## 🔐 Segurança

### ✅ Implementações

- **Bcrypt:** Hash de senhas com 12 rounds
- **JWT:** Autenticação com tokens seguros
- **CSRF Protection:** Tokens únicos por sessão
- **Rate Limiting:** Proteção contra brute force
- **Headers HTTP:** Helmet.js com OWASP best practices
- **SQL Injection:** Prepared statements em todas queries
- **XSS Protection:** Sanitização e escape de outputs
- **HTTPS:** Forçado em produção com HSTS
- **Logs:** Monitoramento com Pino

### 🔑 Requisitos de Senha

```
✅ Mínimo 8 caracteres
✅ Pelo menos 1 letra MAIÚSCULA
✅ Pelo menos 1 letra minúscula
✅ Pelo menos 1 número
✅ Pelo menos 1 símbolo especial (!@#$%^&*)
```

Ver [SEGURANCA_GUIA.md](./SEGURANCA_GUIA.md) para implementação detalhada.

---

## 🛠️ Rotas da API

### Autenticação

```bash
POST   /api/auth/register          # Novo usuário
POST   /api/auth/login             # Fazer login
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Recuperar senha
POST   /api/auth/reset-password    # Resetar senha
```

### Produtos

```bash
GET    /api/products               # Listar todos
GET    /api/products/:id           # Detalhe do produto
POST   /api/products               # Criar (admin)
PUT    /api/products/:id           # Atualizar (admin)
DELETE /api/products/:id           # Deletar (admin)
GET    /api/products?category=aneis # Filtrar por categoria
```

### Pedidos

```bash
GET    /api/orders                 # Listar pedidos do usuário
GET    /api/orders/:id             # Detalhe do pedido
POST   /api/orders                 # Criar novo pedido
PUT    /api/orders/:id             # Atualizar status
DELETE /api/orders/:id             # Cancelar pedido
```

### Frete

```bash
POST   /api/frete/calcular         # Calcular frete (rate limited)
```

### Chat

```bash
POST   /api/chat                   # Enviar mensagem ao chatbot
```

### Admin

```bash
GET    /api/stats/low-stock        # Produtos com baixo estoque
GET    /api/stats/sales            # Estatísticas de vendas
```

---

## 🧪 Testes

### Rodar Testes

```bash
# Unitários
npm test

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

### Testes Implementados

- ✅ Autenticação (register, login)
- ✅ Checkout (validação, cálculo de frete)
- ✅ Pedidos (criação, atualização)
- ✅ Produtos (listagem, filtros)

---

## 🚀 Deploy

### Microsoft Azure (Recomendado) ✅

```bash
# Login no Azure
az login

# Deploy com Azure CLI ou GitHub Actions
# O projeto está configurado com CI/CD automático no GitHub Actions
# Toda vez que fizer push no branch 'main', o deploy é automático

# URLs em Produção:
# Frontend: https://app-gabrielly-frontend-prod.azurewebsites.net
# Backend API: https://app-gabrielly-backend-prod.azurewebsites.net/api
```

### Docker (Local/Self-Hosted)

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📊 Performance

| Métrica | Status | Target |
|---------|--------|--------|
| Lighthouse | 85 | > 90 |
| Time to First Byte | ~400ms | < 600ms |
| Core Web Vitals | ✅ Good | Green |
| Cache Hit Ratio | 70% | > 80% |

---

## 🐛 Problemas Conhecidos

- [ ] Lista de desejos precisa ser persistida no BD
- [ ] Endereços salvos precisa de CRUD melhorado
- [ ] Upload de múltiplas imagens precisa de refactor
- [ ] Mobile menu pode melhorar acessibilidade

Veja [Issues](https://github.com/GlawberSantos/E-commerce-semijoias/issues) para mais.

---

## 🗺️ Roadmap

### Q4 2025
- ✅ Autenticação segura (Bcrypt)
- ✅ CSRF Protection
- [ ] SSL/TLS em produção
- [ ] Backup automático

### Q1 2026
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 (Google, Facebook)
- [ ] Dark Mode completo
- [ ] Notificações push

### Q2 2026
- [ ] Programa de fidelidade
- [ ] Subscription boxes
- [ ] Live shopping
- [ ] AR product preview

---

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

---

## 📝 License

Este projeto está sob a licença MIT - veja [LICENSE](./LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Glauber Santos**
- GitHub: [@GlawberSantos](https://github.com/GlawberSantos)
- Email: glauber.dmi@gmail.com
- LinkedIn: [glauber-santos](https://linkedin.com/in/glauber-santos)

---

## 🙏 Agradecimentos

- [React](https://reactjs.org/) - UI Library
- [Express.js](https://expressjs.com/) - Web Framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [MercadoPago](https://www.mercadopago.com.br/) - Payments
- [Helmet.js](https://helmetjs.github.io/) - Security Headers
- [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) - Password Hashing

---

## 📞 Suporte

- 📧 Email: gabriellysemijoias@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/GlawberSantos/E-commerce-semijoias/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/GlawberSantos/E-commerce-semijoias/discussions)

---

<div align="center">

**[⬆ Voltar ao Topo](#-gabrielly-semijoias---e-commerce-completo)**

Feito com ❤️ por [Glauber Santos](https://github.com/GlawberSantos)

</div>
