# Plataforma Acadêmica

> Plataforma escalável de gerenciamento acadêmico baseada em microsserviços, com práticas DevOps, CI/CD completo e observabilidade.

## Sobre o Projeto

Projeto Final de Semestre — **Engenharia da Computação**

Uma startup deseja construir uma plataforma escalável de **gerenciamento acadêmico**, utilizando arquitetura de microsserviços com práticas profissionais de automação, conteinerização e integração contínua.

### Funcionalidades

- **Autenticação**: Registro e login de usuários (alunos e professores) com JWT
- **Gestão Acadêmica**: CRUD de disciplinas, turmas e matrículas
- **Atividades**: Criação de atividades, submissão de entregas e atribuição de notas

## Arquitetura

```
┌─────────────────┐
│   Frontend Web  │
└────────┬────────┘
         │
┌────────▼────────┐
│   API Gateway   │
│    (Nginx)      │
└──┬─────┬─────┬──┘
   │     │     │
┌──▼──┐┌─▼──┐┌▼────┐
│Auth ││Acad││Assign│
│Svc  ││Svc ││ Svc  │
└──┬──┘└─┬──┘└──┬──┘
   │     │      │
┌──▼──┐┌─▼──┐┌──▼──┐
│Auth ││Acad││Assign│
│ DB  ││ DB ││ DB   │
└─────┘└────┘└─────┘
```

### Microsserviços

| Serviço | Porta | Responsabilidade |
|---------|-------|------------------|
| **auth-service** | 3001 | Autenticação, registro, gestão de usuários (JWT) |
| **academic-service** | 3002 | Disciplinas, turmas, matrículas |
| **assignment-service** | 3003 | Atividades, entregas, notas |
| **API Gateway (Nginx)** | 80 | Roteamento, CORS, rate limiting |

## Stack Tecnológica

| Componente | Tecnologia |
|------------|------------|
| Backend | Node.js 20 + Express 4 |
| ORM | Sequelize 6 |
| Banco de Dados | PostgreSQL 16 |
| API Gateway | Nginx |
| Autenticação | JWT |
| Containerização | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry |
| Deploy | Render.com |
| Monitoramento | Prometheus + Grafana |
| Logs | Winston |
| Testes | Jest + Supertest |
| Lint | ESLint + Prettier |

## Quick Start

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- [Git](https://git-scm.com/) configurado

### Executar o projeto

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/plataforma-academica.git
cd plataforma-academica

# 2. Copiar variáveis de ambiente
cp infra/.env.example infra/.env

# 3. Subir todos os containers
cd infra
docker compose up -d

# 4. Verificar se está tudo rodando
docker compose ps
```

### Endpoints disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/auth/health` | Health check do auth-service |
| `POST /api/auth/register` | Registrar novo usuário |
| `POST /api/auth/login` | Fazer login (retorna JWT) |
| `GET /api/academic/health` | Health check do academic-service |
| `GET /api/academic/disciplinas` | Listar disciplinas |
| `GET /api/assignments/health` | Health check do assignment-service |
| `GET /api/assignments/atividades` | Listar atividades |

## Estrutura do Projeto

```
plataforma-academica/
├── services/
│   ├── auth-service/          # Microsserviço de autenticação
│   ├── academic-service/      # Microsserviço acadêmico
│   └── assignment-service/    # Microsserviço de atividades
├── gateway/                   # API Gateway (Nginx)
├── infra/                     # Docker Compose e infraestrutura
│   └── monitoring/            # Prometheus + Grafana
├── docs/                      # Documentação técnica
├── .github/                   # GitHub Actions e templates
└── README.md
```

## Documentação

- [Arquitetura do Sistema](docs/ARCHITECTURE.md)
- [Modelo Conceitual](docs/CONCEPTUAL_MODEL.md)
- [Documentação da API](docs/API.md)
- [Instruções de Deploy](docs/DEPLOY.md)

## Git Flow

Este projeto utiliza **Git Flow** como estratégia de branches:

- `main` — Produção (código estável)
- `develop` — Integração (desenvolvimento)
- `feature/*` — Features individuais
- `hotfix/*` — Correções urgentes
- `release/*` — Preparação de release

### Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): implement JWT authentication
fix(academic): correct enrollment validation
docs(architecture): update system diagram
chore(docker): optimize Dockerfile layers
```

## Equipe

| Nome | Papel |
|------|-------|
| [Membro 1] | Desenvolvedor |
| [Membro 2] | Desenvolvedor |

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
