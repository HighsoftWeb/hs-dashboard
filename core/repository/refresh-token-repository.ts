import { obterBancoEmpresas } from "../db/banco-empresas";

interface RefreshTokenRecord {
  jti: string;
  cod_usuario: number;
  cod_empresa: number;
  criado_em: string;
  usado_em: string | null;
}

class RefreshTokenRepository {
  private readonly RETENTION_DAYS = 30;
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;

    const db = obterBancoEmpresas();

    db.exec(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        jti TEXT PRIMARY KEY,
        cod_usuario INTEGER NOT NULL,
        cod_empresa INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        usado_em DATETIME,
        revogado_em DATETIME
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario_empresa 
      ON refresh_tokens(cod_usuario, cod_empresa)
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_criado_em 
      ON refresh_tokens(criado_em)
    `);

    this.cleanupExpiredTokens(db);
    this.initialized = true;
  }

  private cleanupExpiredTokens(
    db: ReturnType<typeof obterBancoEmpresas>
  ): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

    db.prepare(
      `
      DELETE FROM refresh_tokens 
      WHERE criado_em < ?
    `
    ).run(cutoffDate.toISOString());
  }

  salvarRefreshToken(
    jti: string,
    codUsuario: number,
    codEmpresa: number
  ): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      INSERT INTO refresh_tokens (jti, cod_usuario, cod_empresa, criado_em)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `
    ).run(jti, codUsuario, codEmpresa);
  }

  isRefreshTokenValido(jti: string): boolean {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    const resultado = db
      .prepare(
        `
        SELECT jti 
        FROM refresh_tokens 
        WHERE jti = ? 
          AND usado_em IS NULL 
          AND revogado_em IS NULL
      `
      )
      .get(jti) as RefreshTokenRecord | undefined;

    return !!resultado;
  }

  marcarComoUsado(jti: string): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      UPDATE refresh_tokens 
      SET usado_em = CURRENT_TIMESTAMP 
      WHERE jti = ?
    `
    ).run(jti);
  }

  revogarTodosRefreshTokensUsuario(
    codUsuario: number,
    codEmpresa: number
  ): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      UPDATE refresh_tokens 
      SET revogado_em = CURRENT_TIMESTAMP 
      WHERE cod_usuario = ? 
        AND cod_empresa = ? 
        AND revogado_em IS NULL
    `
    ).run(codUsuario, codEmpresa);
  }

  revogarRefreshToken(jti: string): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      UPDATE refresh_tokens 
      SET revogado_em = CURRENT_TIMESTAMP 
      WHERE jti = ?
    `
    ).run(jti);
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
