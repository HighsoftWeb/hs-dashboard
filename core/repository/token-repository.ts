import { obterBancoEmpresas } from "../db/banco-empresas";

interface UltimoLogin {
  cod_usuario: number;
  cod_empresa: number;
  ultimo_login_em: string;
}

class TokenRepository {
  private readonly RETENTION_DAYS = 30;
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;

    const db = obterBancoEmpresas();

    db.exec(`
      CREATE TABLE IF NOT EXISTS tokens_revogados (
        jti TEXT PRIMARY KEY,
        cod_usuario INTEGER NOT NULL,
        cod_empresa INTEGER NOT NULL,
        revogado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tokens_usuario_empresa 
      ON tokens_revogados(cod_usuario, cod_empresa)
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS ultimo_login (
        cod_usuario INTEGER NOT NULL,
        cod_empresa INTEGER NOT NULL,
        ultimo_login_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (cod_usuario, cod_empresa)
      )
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
      DELETE FROM tokens_revogados 
      WHERE revogado_em < ?
    `
    ).run(cutoffDate.toISOString());
  }

  revogarToken(jti: string, codUsuario: number, codEmpresa: number): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      INSERT OR REPLACE INTO tokens_revogados (jti, cod_usuario, cod_empresa, revogado_em)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `
    ).run(jti, codUsuario, codEmpresa);
  }

  isTokenRevogado(jti: string): boolean {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    const resultado = db
      .prepare("SELECT 1 FROM tokens_revogados WHERE jti = ?")
      .get(jti) as { "1": number } | undefined;

    return !!resultado;
  }

  revogarTodosTokensUsuario(codUsuario: number, codEmpresa: number): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      INSERT OR REPLACE INTO ultimo_login (
        cod_usuario, 
        cod_empresa, 
        ultimo_login_em
      )
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `
    ).run(codUsuario, codEmpresa);
  }

  atualizarUltimoLogin(
    codUsuario: number,
    codEmpresa: number,
    dataLogin: Date
  ): void {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    db.prepare(
      `
      INSERT OR REPLACE INTO ultimo_login (
        cod_usuario, 
        cod_empresa, 
        ultimo_login_em
      )
      VALUES (?, ?, ?)
    `
    ).run(codUsuario, codEmpresa, dataLogin.toISOString());
  }

  verificarLoginMaisRecente(
    codUsuario: number,
    codEmpresa: number,
    tokenCriadoEm: Date
  ): boolean {
    this.ensureInitialized();
    const db = obterBancoEmpresas();

    const resultado = db
      .prepare(
        `
        SELECT ultimo_login_em 
        FROM ultimo_login 
        WHERE cod_usuario = ? AND cod_empresa = ?
      `
      )
      .get(codUsuario, codEmpresa) as UltimoLogin | undefined;

    if (!resultado) {
      return false;
    }

    const ultimoLogin = new Date(resultado.ultimo_login_em);
    return ultimoLogin > tokenCriadoEm;
  }
}

export const tokenRepository = new TokenRepository();
