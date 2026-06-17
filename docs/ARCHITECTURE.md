#  Arquitetura do Sistema

## Visão Geral

A **Plataforma Acadêmica** utiliza uma arquitetura baseada em **microsserviços**, onde cada serviço é responsável por um domínio de negócio específico, com banco de dados independente (database-per-service pattern).

## Diagrama de Arquitetura

```
                    ┌──────────────────────┐
                    │    Cliente (Browser)  │
                    └──────────┬───────────┘
                               │ HTTP/HTTPS
                    ┌──────────▼───────────┐
                    │     API Gateway       │
                    │       (Nginx)         │
                    │     Port: 80/443      │
                    └──┬───────┬────────┬──┘
                       │       │        │
          ┌────────────┘       │        └────────────┐
          │                    │                     │
┌─────────▼──────────┐ ┌──────▼───────────┐ ┌───────▼──────────┐
│   auth-service     │ │ academic-service │ │assignment-service│
│   Port: 3001       │ │   Port: 3002     │ │   Port: 3003     │
│                    │ │                  │ │                  │
│ • Registro         │ │ • Disciplinas    │ │ • Atividades     │
│ • Login (JWT)      │ │ • Turmas         │ │ • Entregas       │
│ • Gestão Usuários  │ │ • Matrículas     │ │ • Notas          │
└─────────┬──────────┘ └──────┬───────────┘ └───────┬──────────┘
          │                    │                     │
┌─────────▼──────────┐ ┌──────▼───────────┐ ┌───────▼──────────┐
│     auth-db        │ │   academic-db    │ │  assignment-db   │
│  (PostgreSQL)      │ │  (PostgreSQL)    │ │  (PostgreSQL)    │
│                    │ │                  │ │                  │
│ • users            │ │ • disciplinas    │ │ • atividades     │
│ • alunos           │ │ • turmas         │ │ • entregas       │
│ • professores      │ │ • matriculas     │ │                  │
└────────────────────┘ └──────────────────┘ └──────────────────┘
```

## Microsserviços

### 1. Auth Service (`auth-service`)

**Responsabilidade**: Autenticação e gestão de identidade.

| Recurso | Descrição |
|---------|-----------|
| Registro de Usuários | Criar contas de alunos e professores |
| Autenticação JWT | Login com geração de token JWT |
| Validação de Token | Middleware para verificar tokens nos outros serviços |
| Gestão de Perfis | CRUD de dados do usuário |

**Modelos de Dados**:
- `User` — Dados base (id, nome, email, senha, tipo)
- `Aluno` — Extensão com matrícula e curso
- `Professor` — Extensão com SIAPE e departamento

**Endpoints**:
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/health` | Health check | Não |
| POST | `/api/auth/register` | Registrar usuário | Não |
| POST | `/api/auth/login` | Login (retorna JWT) | Não |
| GET | `/api/auth/profile` | Dados do usuário logado | Sim |
| GET | `/api/auth/users/:id` | Buscar usuário por ID | Sim |

---

### 2. Academic Service (`academic-service`)

**Responsabilidade**: Gestão de disciplinas, turmas e matrículas.

**Modelos de Dados**:
- `Disciplina` — Dados da disciplina (id, nome, código, carga horária)
- `Turma` — Instância de disciplina em um semestre (id, disciplina_id, professor_id, semestre, horário)
- `Matricula` — Vínculo aluno-turma (id, aluno_id, turma_id, data, status)

**Endpoints**:
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/health` | Health check | Não |
| GET | `/api/academic/disciplinas` | Listar disciplinas | Sim |
| POST | `/api/academic/disciplinas` | Criar disciplina | Sim |
| GET | `/api/academic/disciplinas/:id` | Buscar disciplina | Sim |
| PUT | `/api/academic/disciplinas/:id` | Atualizar disciplina | Sim |
| DELETE | `/api/academic/disciplinas/:id` | Remover disciplina | Sim |
| GET | `/api/academic/turmas` | Listar turmas | Sim |
| POST | `/api/academic/turmas` | Criar turma | Sim |
| GET | `/api/academic/turmas/:id` | Buscar turma | Sim |
| PUT | `/api/academic/turmas/:id` | Atualizar turma | Sim |
| DELETE | `/api/academic/turmas/:id` | Remover turma | Sim |
| POST | `/api/academic/matriculas` | Matricular aluno | Sim |
| GET | `/api/academic/matriculas/aluno/:alunoId` | Matrículas do aluno | Sim |
| GET | `/api/academic/matriculas/turma/:turmaId` | Alunos da turma | Sim |

---

### 3. Assignment Service (`assignment-service`)

**Responsabilidade**: Gestão de atividades, entregas e notas.

**Modelos de Dados**:
- `Atividade` — Atividade de uma turma (id, turma_id, titulo, descricao, prazo)
- `Entrega` — Submissão do aluno (id, atividade_id, aluno_id, data_entrega, nota)

**Endpoints**:
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/health` | Health check | Não |
| GET | `/api/assignments/atividades` | Listar atividades | Sim |
| POST | `/api/assignments/atividades` | Criar atividade | Sim |
| GET | `/api/assignments/atividades/:id` | Buscar atividade | Sim |
| PUT | `/api/assignments/atividades/:id` | Atualizar atividade | Sim |
| DELETE | `/api/assignments/atividades/:id` | Remover atividade | Sim |
| POST | `/api/assignments/entregas` | Submeter entrega | Sim |
| GET | `/api/assignments/entregas/aluno/:alunoId` | Entregas do aluno | Sim |
| GET | `/api/assignments/entregas/atividade/:atividadeId` | Entregas da atividade | Sim |
| PUT | `/api/assignments/entregas/:id/nota` | Atribuir nota | Sim |

---

## Comunicação entre Serviços

### Padrão de Comunicação

Utilizamos **comunicação síncrona via REST API** entre os serviços. O API Gateway (Nginx) roteia as requisições do cliente para o serviço correto.

```
Cliente → API Gateway (Nginx) → Serviço correspondente
```

### Autenticação entre Serviços

1. Cliente faz login no `auth-service` e recebe um **JWT token**
2. Cliente envia o token no header `Authorization: Bearer <token>` em todas as requisições
3. O API Gateway repassa o header para o serviço de destino
4. Cada serviço valida o JWT usando a mesma `JWT_SECRET` (variável de ambiente compartilhada)

```
┌────────┐    POST /login     ┌──────────┐
│ Cliente ├──────────────────►│auth-svc  │
│         │◄──────────────────┤          │
│         │   { token: JWT }  └──────────┘
│         │
│         │  GET /disciplinas  ┌──────────┐    Valida JWT     ┌──────────┐
│         ├───────────────────►│ Gateway  ├──────────────────►│acad-svc  │
│         │ Authorization:     │          │                   │          │
│         │ Bearer <JWT>       └──────────┘                   └──────────┘
└────────┘
```

## Rede Docker

Os serviços se comunicam através de uma **rede Docker interna**, garantindo isolamento:

```yaml
networks:
  plataforma-network:
    driver: bridge
```

- Serviços se comunicam usando nomes de container como hostname
- Apenas o Nginx (API Gateway) expõe porta para o host
- Bancos de dados são acessíveis apenas dentro da rede Docker

## Decisões Técnicas

### Por que Microsserviços?
- **Separação de domínios**: Cada serviço gerencia um contexto bounded (autenticação, acadêmico, atividades)
- **Deploy independente**: Atualizar um serviço sem impactar os demais
- **Escalabilidade**: Escalar individualmente o serviço mais demandado
- **Resiliência**: Falha em um serviço não derruba todo o sistema

### Por que Node.js + Express?
- Ecossistema maduro com npm
- I/O assíncrono ideal para chamadas REST
- Baixo consumo de memória (ótimo para free tier)
- ORM robusto com Sequelize

### Por que PostgreSQL (Database per Service)?
- Cada serviço tem seu próprio banco, garantindo independência
- Sem acoplamento de dados entre serviços
- Liberdade para evoluir schemas independentemente
- PostgreSQL: robusto, gratuito, com suporte a JSON

### Por que Nginx como API Gateway?
- Gratuito e open-source
- Reverse proxy com roteamento eficiente
- Rate limiting e CORS nativos
- Baixo consumo de recursos

### Por que JWT para Autenticação?
- Stateless: não precisa de sessão no servidor
- Pode ser validado por qualquer serviço sem chamar o auth-service
- Padrão da indústria para microsserviços
- Leve e seguro com assinatura HMAC
