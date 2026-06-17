#  API Gateway (Nginx)

Reverse proxy que roteia requisições para os microsserviços corretos.

## Roteamento

| Rota | Serviço Destino |
|------|-----------------|
| `/api/auth/*` | auth-service:3001 |
| `/api/academic/*` | academic-service:3002 |
| `/api/assignments/*` | assignment-service:3003 |
| `/health` | Gateway health check |

## Funcionalidades

- **Reverse Proxy**: Roteia para o microsserviço correto
- **CORS**: Headers configurados para todas as origens
- **Rate Limiting**: 10 req/s por IP com burst de 20
- **Headers Propagados**: Authorization, X-Correlation-ID
