import { ConnectionPool, config as SqlConfig } from "mssql";

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

  configurar(): void {
    const config: ConfiguracaoBanco = {
      server: process.env.DB_HOST || "",
      database: process.env.DB_NAME || "",
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      port: parseInt(process.env.DB_PORT || "1433", 10),
      options: {
        encrypt: process.env.DB_ENCRYPT === "true",
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === "true",
        enableArithAbort: true,
        requestTimeout: parseInt(
          process.env.DB_REQUEST_TIMEOUT_MS || "30000",
          10
        ),
      },
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || "0", 10),
        max: parseInt(process.env.DB_POOL_MAX || "10", 10),
        idleTimeoutMillis: parseInt(
          process.env.DB_POOL_IDLE_MS || "30000",
          10
        ),
      },
    };

    this.configuracao = config as SqlConfig;
  }

  async obterPool(): Promise<ConnectionPool> {
    if (!this.configuracao) {
      this.configurar();
    }

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
    parametros?: Record<string, string | number | boolean | Date | null>
  ): Promise<T[]> {
    try {
      const pool = await this.obterPool();
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
        const pool = await this.obterPool();
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
    parametros?: Record<string, string | number | boolean | Date | null>
  ): Promise<number> {
    try {
      const pool = await this.obterPool();
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
        const pool = await this.obterPool();
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
