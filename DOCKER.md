# Docker - Guia de Uso

Este projeto utiliza Docker para containerização seguindo as melhores práticas do mercado.

## Estrutura

- **Dockerfile**: Multi-stage build otimizado para produção
- **docker-compose.yml**: Orquestração de containers
- **.dockerignore**: Arquivos excluídos do build

## Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+

## Build e Execução

### Usando Docker Compose (Recomendado)

1. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e configure as variáveis necessárias:
```bash
JWT_SECRET=seu-jwt-secret-aqui
DEFAULT_COD_EMPRESA=1
```

3. Build e execute:
```bash
docker-compose up -d --build
```

4. Acesse a aplicação em: http://localhost:3000

### Usando Docker diretamente

1. Build da imagem:
```bash
docker build -t hs-web:latest .
```

2. Execute o container:
```bash
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=seu-jwt-secret-aqui \
  -e DEFAULT_COD_EMPRESA=1 \
  --name hs-web \
  hs-web:latest
```

## Comandos Úteis

### Ver logs
```bash
docker-compose logs -f hs-web
```

### Parar o container
```bash
docker-compose down
```

### Rebuild sem cache
```bash
docker-compose build --no-cache
```

### Acessar o shell do container
```bash
docker exec -it hs-web sh
```

## Otimizações Implementadas

1. **Multi-stage build**: Reduz o tamanho final da imagem
2. **Cache de layers**: Dependências são instaladas em stage separado
3. **Usuário não-root**: Execução com usuário `nextjs` para segurança
4. **Standalone mode**: Next.js gera build otimizado para produção
5. **Healthcheck**: Monitoramento automático da saúde do container
6. **Alpine Linux**: Imagem base leve e segura

## Variáveis de Ambiente

### Obrigatórias
- `JWT_SECRET`: Secret para assinatura de tokens JWT

### Opcionais
- `DEFAULT_COD_EMPRESA`: Código da empresa padrão (padrão: 1)

## Troubleshooting

### Erro de permissão
Se encontrar erros de permissão, verifique se o usuário `nextjs` tem as permissões corretas:
```bash
docker exec -it hs-web ls -la /app
```

### Rebuild completo
Se houver problemas com cache:
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```
