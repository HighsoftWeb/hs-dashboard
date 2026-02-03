# HS Web

Sistema web de gestão empresarial desenvolvido com Next.js.

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

A aplicação estará disponível em `http://localhost:3000`

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

## Estrutura do Projeto

```
hs-web/
├── app/              # Páginas e rotas Next.js
├── core/             # Lógica de negócio e serviços
├── public/           # Arquivos estáticos
└── sql/              # Queries SQL
```

## Configuração

### Variáveis de Ambiente

O sistema requer variáveis de ambiente para funcionar. Consulte o arquivo `.env.example` (se existir) ou a documentação do projeto.

**Variáveis obrigatórias:**

- `JWT_SECRET` - Secret para assinatura de tokens JWT

**Variáveis opcionais:**

- `JWT_EXPIRES_IN` - Expiração do token (padrão: 8h)
- `DEFAULT_COD_EMPRESA` - Código padrão de empresa (padrão: 1)
- `DB_POOL_MIN` / `DB_POOL_MAX` - Configuração do pool de conexões
- `LOG_LEVEL` - Nível de log (padrão: info)

Crie um arquivo `.env.local` na raiz do projeto com as variáveis necessárias.

## Auditoria Enterprise

Este projeto passou por uma auditoria completa de segurança, performance e arquitetura. Consulte [AUDITORIA_ENTERPRISE.md](./AUDITORIA_ENTERPRISE.md) para:

- Mapa completo do projeto
- Problemas identificados e priorizados
- Plano de correção em etapas
- Checklist de produção enterprise

**Status Atual:** ⚠️ Implementando melhorias críticas (P0)

## Licença

Privado
