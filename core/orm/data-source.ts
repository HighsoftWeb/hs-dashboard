import "reflect-metadata";
import { DataSource } from "typeorm";
import { ProdutoServico } from "../entities/ProdutoServico";
import { Derivacao } from "../entities/Derivacao";
import { Estoque } from "../entities/Estoque";
import { Usuario } from "../entities/Usuario";
import { OrcamentoOS } from "../entities/OrcamentoOS";
import { TituloReceber } from "../entities/TituloReceber";
import { TituloPagar } from "../entities/TituloPagar";
import { ClienteFornecedor } from "../entities/ClienteFornecedor";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433", 10),
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === "true",
    enableArithAbort: true,
    connectTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT_MS || "30000", 10),
  },
  extra: {
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || "0", 10),
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_MS || "30000", 10),
    },
  },
  entities: [
    ProdutoServico,
    Derivacao,
    Estoque,
    Usuario,
    OrcamentoOS,
    TituloReceber,
    TituloPagar,
    ClienteFornecedor,
  ],
  synchronize: false,
  logging: process.env.LOG_LEVEL === "debug",
});

let inicializacaoEmAndamento: Promise<void> | null = null;

export async function inicializarDataSource(): Promise<void> {
  if (AppDataSource.isInitialized) {
    return;
  }

  if (inicializacaoEmAndamento) {
    return inicializacaoEmAndamento;
  }

  inicializacaoEmAndamento = (async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
    } catch (erro) {
      inicializacaoEmAndamento = null;
      throw erro;
    }
  })();

  return inicializacaoEmAndamento;
}

export async function fecharDataSource(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
