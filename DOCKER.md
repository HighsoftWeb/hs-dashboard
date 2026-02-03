# Docker Setup - Persistência de Dados

## Estrutura

O projeto utiliza Docker Compose com volumes nomeados para persistir os dados do banco SQLite, garantindo que os dados não sejam perdidos ao recriar containers.

### Volumes

- **hs-web-data**: Volume nomeado que persiste o diretório `/app/.data/` contendo:
  - `empresas.db` - Banco SQLite com configurações de empresas
  - Tabelas de tokens revogados e controle de logins

## Comandos Principais

### Iniciar os containers
```bash
docker compose up -d
```

### Parar os containers (mantém os dados)
```bash
docker compose down
```

### Recriar container sem perder dados
```bash
docker compose down
docker compose up -d --build
```

### Parar e remover volumes (⚠️ APAGA OS DADOS)
```bash
docker compose down -v
```

### Ver logs
```bash
docker compose logs -f hs-web
```

### Acessar o container
```bash
docker compose exec hs-web sh
```

## Backup e Restore

### Backup do volume
```bash
docker run --rm -v hs-web-data:/data -v $(pwd):/backup alpine tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

### Restaurar backup
```bash
docker run --rm -v hs-web-data:/data -v $(pwd):/backup alpine sh -c "cd /data && rm -rf * && tar xzf /backup/backup-YYYYMMDD-HHMMSS.tar.gz"
```

### Listar volumes
```bash
docker volume ls | grep hs-web
```

### Inspecionar volume
```bash
docker volume inspect hs-web-data
```

## Persistência

Os dados são armazenados em um volume Docker nomeado (`hs-web-data`), que:
- ✅ Persiste mesmo quando o container é removido
- ✅ Permite recriar o container sem perder dados
- ✅ Pode ser facilmente feito backup
- ✅ É gerenciado pelo Docker
- ✅ Funciona em qualquer ambiente (desenvolvimento, staging, produção)

## Localização do Volume

O volume é gerenciado pelo Docker e pode ser encontrado em:
- **Linux**: `/var/lib/docker/volumes/hs-web-data/_data`
- **macOS/Windows**: Gerenciado pelo Docker Desktop (localização interna)

## Troubleshooting

### Problemas de permissão
Se houver problemas de permissão ao acessar o banco:
```bash
docker compose exec hs-web ls -la /app/.data
```

### Resetar dados (cuidado!)
```bash
docker compose down -v
docker compose up -d
```

### Verificar se o volume está montado
```bash
docker compose exec hs-web df -h | grep .data
```
