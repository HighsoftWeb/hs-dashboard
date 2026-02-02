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

  configurar(empresaConfig: EmpresaConfig): void {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    const configKey = `${empresaConfig.host}:${empresaConfig.porta}:${empresaConfig.nomeBase}`;
    
    if (this.configuracaoAtual && this.configuracaoAtual !== configKey) {
      this.fecharPool();
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

    this.configurar(empresaConfig);

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
    }
  }

  async executarConsulta<T>(
    query: string,
    parametros: Record<string, string | number | boolean | Date | null> | undefined,
    empresaConfig: EmpresaConfig
  ): Promise<T[]> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    try {
      const pool = await this.obterPool(empresaConfig);
      const request = pool.request();

      if (parametros) {
        Object.entries(parametros).forEach(([chave, valor]) => {
          request.input(chave, valor);
        });
      }

      const resultado = await request.query(query);
      return resultado.recordset as T[];
    } catch (erro) {
      if (erro && typeof erro === "object" && "code" in erro && erro.code === "ECONNCLOSED") {
        this.pool = null;
        const pool = await this.obterPool(empresaConfig);
        const request = pool.request();

        if (parametros) {
          Object.entries(parametros).forEach(([chave, valor]) => {
            request.input(chave, valor);
          });
        }

        const resultado = await request.query(query);
        return resultado.recordset as T[];
      }
      throw erro;
    }
  }

  async executarComando(
    query: string,
    parametros: Record<string, string | number | boolean | Date | null> | undefined,
    empresaConfig: EmpresaConfig
  ): Promise<number> {
    if (!empresaConfig) {
      throw new Error("Configuração de empresa é obrigatória");
    }

    try {
      const pool = await this.obterPool(empresaConfig);
      const request = pool.request();

      if (parametros) {
        Object.entries(parametros).forEach(([chave, valor]) => {
          request.input(chave, valor);
        });
      }

      const resultado = await request.query(query);
      return resultado.rowsAffected[0] || 0;
    } catch (erro) {
      if (erro && typeof erro === "object" && "code" in erro && erro.code === "ECONNCLOSED") {
        this.pool = null;
        const pool = await this.obterPool(empresaConfig);
        const request = pool.request();

        if (parametros) {
          Object.entries(parametros).forEach(([chave, valor]) => {
            request.input(chave, valor);
          });
        }

        const resultado = await request.query(query);
        return resultado.rowsAffected[0] || 0;
      }
      throw erro;
    }
  }
}

export const poolBanco = new PoolBanco();
