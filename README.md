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

Para mais detalhes sobre Docker, consulte [DOCKER.md](./DOCKER.md)

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

## Licença

Privado
