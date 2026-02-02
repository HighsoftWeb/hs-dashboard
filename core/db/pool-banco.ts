import { ConnectionPool, config as SqlConfig } from "mssql";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

interface ConfiguracaoBanco {
  server: string;
  database: string;
  user: string;
  password: string;
  port?: number;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
    requestTimeout?: number;
  };
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };
}

class PoolBanco {
  private pool: ConnectionPool | null = null;
  private configuracao: SqlConfig | null = null;
  private configuracaoAtual: string | null = null;

  async configurar(empresaConfig: EmpresaConfig): Promise<void> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    const configKey = `${empresaConfig.host}:${empresaConfig.porta}:${empresaConfig.nomeBase}`;
    
    if (this.configuracaoAtual && this.configuracaoAtual !== configKey) {
      await this.fecharPool();
    }
    
    this.configuracaoAtual = configKey;
    
    const config: ConfiguracaoBanco = {
      server: empresaConfig.host,
      database: empresaConfig.nomeBase,
      user: empresaConfig.usuario,
      password: empresaConfig.senha,
      port: empresaConfig.porta,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        requestTimeout: 30000,
      },
      pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 30000,
      },
    };

    this.configuracao = config as SqlConfig;
  }

  async obterPool(empresaConfig: EmpresaConfig): Promise<ConnectionPool> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    await this.configurar(empresaConfig);

    if (!this.configuracao) {
      throw new Error("Configuração do banco de dados não definida");
    }

    if (!this.pool) {
      this.pool = new ConnectionPool(this.configuracao);
    }

    if (!this.pool.connected) {
      try {
        await this.pool.connect();
      } catch (erro) {
        if (erro && typeof erro === "object" && "code" in erro && erro.code === "ECONNCLOSED") {
          this.pool = new ConnectionPool(this.configuracao);
          await this.pool.connect();
        } else {
          throw erro;
        }
      }
    }

    return this.pool;
  }

  async fecharPool(): Promise<void> {
    if (this.pool && this.pool.connected) {
      await this.pool.close();
      this.pool = null;
      this.configuracao = null;
      this.configuracaoAtual = null;
    }
  }

  private async executarQueryComRetry<T>(
    query: string,
    parametros: Record<string, string | number | boolean | Date | null> | undefined,
    empresaConfig: EmpresaConfig,
    retornarRecordset: boolean
  ): Promise<T> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    const executar = async (): Promise<T> => {
      const pool = await this.obterPool(empresaConfig);
      const request = pool.request();

      if (parametros) {
        Object.entries(parametros).forEach(([chave, valor]) => {
          request.input(chave, valor);
        });
      }

      const resultado = await request.query(query);
      return (retornarRecordset ? resultado.recordset : resultado.rowsAffected[0] || 0) as T;
    };

    try {
      return await executar();
    } catch (erro) {
      if (erro && typeof erro === "object" && "code" in erro && erro.code === "ECONNCLOSED") {
        this.pool = null;
        return await executar();
      }
      throw erro;
    }
  }

  async executarConsulta<T>(
    query: string,
    parametros: Record<string, string | number | boolean | Date | null> | undefined,
    empresaConfig: EmpresaConfig
  ): Promise<T[]> {
    return this.executarQueryComRetry<T[]>(query, parametros, empresaConfig, true);
  }

  async executarComando(
    query: string,
    parametros: Record<string, string | number | boolean | Date | null> | undefined,
    empresaConfig: EmpresaConfig
  ): Promise<number> {
    return this.executarQueryComRetry<number>(query, parametros, empresaConfig, false);
  }
}

export const poolBanco = new PoolBanco();
