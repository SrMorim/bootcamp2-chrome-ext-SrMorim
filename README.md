# 🍅 Bootcamp Pomodoro PWA

> Progressive Web App de timer Pomodoro com backend Node.js, Docker e CI/CD

[![CI/CD](https://github.com/SrMorim/bootcamp2-chrome-ext-SrMorim/actions/workflows/ci-pwa.yml/badge.svg)](https://github.com/SrMorim/bootcamp2-chrome-ext-SrMorim/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**📱 [Acessar PWA](https://srmorim.github.io/bootcamp2-chrome-ext-SrMorim/)** • **🐳 [Docker](#docker)** • **🧪 [Testes](#testes)**

---

## Sobre

Timer Pomodoro PWA com backend Node.js - **Bootcamp II Entrega Final**

**Features:**
- ⏱️ Timer com 3 modos (Foco 25min, Pausa 5min, Longa 15min)
- 📊 Histórico de sessões + estatísticas
- 💬 Frases motivacionais (Quotable API)
- 📴 Funciona offline (Service Worker)
- 📱 Instalável como app nativo
- ⚙️ Configurações personalizáveis

**Stack:** Vite + Vanilla JS | Node + Express | Docker | Playwright | GitHub Actions

---

## 🚀 Quick Start

### Docker (Recomendado)
```bash
docker-compose up --build
# PWA: http://localhost:8080
# API: http://localhost:3000
```

### Local
```bash
# API
cd apps/api && npm install && npm start

# Web (novo terminal)
cd apps/web && npm install && npm run dev
```

---

## 📡 API

**Base:** `http://localhost:3000`

- `GET /api/health` - Status
- `GET /api/quote` - Frase motivacional
- `GET /api/sessions` - Listar sessões
- `POST /api/sessions` - Criar sessão
- `GET /api/sessions/stats` - Estatísticas

---

## 🧪 Testes

```bash
cd tests/e2e
npm install && npx playwright install chromium
npm test
```

**16 testes E2E** (PWA + API + Offline)

---

## 🏗️ Arquitetura

```
apps/
├── web/     # PWA (Vite + PWA plugin)
└── api/     # Backend (Express + Quotable proxy)
tests/e2e/   # Playwright
docker-compose.yml
```

---

## ⚙️ CI/CD

GitHub Actions automatiza:
✅ Build • ✅ Testes E2E • ✅ Lighthouse • ✅ Docker • ✅ Deploy Pages

Ver: [ci-pwa.yml](.github/workflows/ci-pwa.yml)

---

## 📊 Avaliação (100%)

| Critério | Peso | Status |
|----------|------|--------|
| PWA | 30% | ✅ Manifest + SW + Perf ≥80 |
| API/Backend | 25% | ✅ Express + Quotable |
| Containers | 15% | ✅ Docker Compose (2 serviços) |
| Testes | 15% | ✅ 16 E2E (Playwright) |
| CI/CD | 10% | ✅ Actions + Pages |
| Docs | 5% | ✅ README + commits |

---

## 📝 Entregas

**v2.0.0** (Final): PWA + Backend + Docker + CI/CD ✨
**v1.1.0** (Intermediária): Docker + CI/CD + E2E
**v1.0.0** (Inicial): Extensão Chrome

---

## 📄 Licença

MIT - Ver [LICENSE](LICENSE)

---

<p align="center">
🍅 <a href="https://github.com/SrMorim">SrMorim</a> |
<a href="https://srmorim.github.io/bootcamp2-chrome-ext-SrMorim/">Acessar PWA</a>
</p>
