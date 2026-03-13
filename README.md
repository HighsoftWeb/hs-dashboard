# HS Dashboard

## Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **TypeORM** - ORM para banco de dados
- **SQLServer** - Banco de dados do cliente
- **SQLite** - Banco de dados de configurações
- **JWT** - Autenticação
- **Docker** - Containerização

## Pré-requisitos

- Node.js 20+
- Yarn ou npm
- Docker (opcional)

## Instalação

```bash
# Instalar dependências
yarn install

# Ou com npm
npm install
```

## Executar

### Desenvolvimento

```bash
yarn dev
```

A aplicação estará disponível em `http://localhost:3000 ou 3005`

### Produção

```bash
# Build
yarn build

# Iniciar
yarn start
```

### Docker

```bash
# Iniciar containers
docker compose up -d

# Parar containers
docker compose down
```

Para mais detalhes sobre Docker, consulte o Dockerfile e docker-compose.yml

## Scripts Disponíveis

- `yarn dev` - Inicia servidor de desenvolvimento
- `yarn build` - Gera build de produção
- `yarn start` - Inicia servidor de produção
- `yarn lint` - Executa linter
- `yarn format` - Formata código

## Configuração

### Variáveis de Ambiente

O sistema requer variáveis de ambiente para funcionar.

**Variáveis obrigatórias:**

- `JWT_SECRET` - Secret para assinatura de tokens JWT

**Variáveis opcionais:**

- `JWT_EXPIRES_IN` - Expiração do token (padrão: 8h)
- `DEFAULT_COD_EMPRESA` - Código padrão de empresa (padrão: 1)
- `DB_POOL_MIN` / `DB_POOL_MAX` - Configuração do pool de conexões
- `LOG_LEVEL` - Nível de log (padrão: info)

Crie um arquivo `.env.local` na raiz do projeto com as variáveis necessárias.

## Licença

Privado
