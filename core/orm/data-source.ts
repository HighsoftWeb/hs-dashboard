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
import type { EmpresaConfig } from "../entities/EmpresaConfig";

const entities = [
  ProdutoServico,
  Derivacao,
  Estoque,
  Usuario,
  OrcamentoOS,
  TituloReceber,
  TituloPagar,
  ClienteFornecedor,
];

let appDataSource: DataSource | null = null;
let inicializacaoEmAndamento: Promise<void> | null = null;
let configuracaoAtual: string | null = null;

function criarDataSource(empresaConfig: EmpresaConfig): DataSource {
  return new DataSource({
    type: "mssql",
    host: empresaConfig.host,
    port: empresaConfig.porta,
    username: empresaConfig.usuario,
    password: empresaConfig.senha,
    database: empresaConfig.nomeBase,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      connectTimeout: 30000,
    },
    extra: {
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || "2", 10),
        max: parseInt(process.env.DB_POOL_MAX || "20", 10),
        idleTimeoutMillis: parseInt(
          process.env.DB_POOL_IDLE_TIMEOUT || "30000",
          10
        ),
        acquireTimeoutMillis: parseInt(
          process.env.DB_POOL_ACQUIRE_TIMEOUT || "60000",
          10
        ),
      },
    },
    entities,
    synchronize: false,
    logging: false,
  });
}

export function getAppDataSource(): DataSource {
  if (!appDataSource) {
    throw new Error(
      "DataSource não inicializado. Chame inicializarDataSource primeiro."
    );
  }
  return appDataSource;
}

export async function inicializarDataSource(
  empresaConfig: EmpresaConfig
): Promise<void> {
  if (!empresaConfig) {
    throw new Error("Configuração de empresa é obrigatória");
  }

  const configKey = `${empresaConfig.host}:${empresaConfig.porta}:${empresaConfig.nomeBase}`;

  if (appDataSource?.isInitialized && configuracaoAtual === configKey) {
    return;
  }

  if (appDataSource?.isInitialized && configuracaoAtual !== configKey) {
    try {
      await appDataSource.destroy();
    } catch {}
    appDataSource = null;
    configuracaoAtual = null;
    inicializacaoEmAndamento = null;
  }

  if (inicializacaoEmAndamento) {
    return inicializacaoEmAndamento;
  }

  if (!appDataSource) {
    appDataSource = criarDataSource(empresaConfig);
  }

  inicializacaoEmAndamento = (async () => {
    try {
      if (!appDataSource!.isInitialized) {
        await appDataSource!.initialize();
        configuracaoAtual = configKey;
      }
    } catch (erro) {
      inicializacaoEmAndamento = null;
      configuracaoAtual = null;
      appDataSource = null;
      throw erro;
    }
  })();

  return inicializacaoEmAndamento;
}
