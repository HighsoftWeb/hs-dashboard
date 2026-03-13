import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DB_DIR, "empresas.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: DatabaseType | null = null;

export function obterBancoEmpresas(): DatabaseType {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    inicializarTabela();
  }
  return dbInstance;
}

function inicializarTabela(): void {
  const db = dbInstance!;

  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cnpj TEXT NOT NULL UNIQUE,
      nome_empresa TEXT NOT NULL,
      host TEXT NOT NULL,
      porta INTEGER NOT NULL,
      nome_base TEXT NOT NULL,
      usuario TEXT NOT NULL,
      senha TEXT NOT NULL,
      codigos_usuarios_permitidos TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const colunas = db.prepare("PRAGMA table_info(empresas)").all() as Array<{
    name: string;
  }>;
  const nomesColunas = colunas.map((c) => c.name);

  if (!nomesColunas.includes("nome_empresa")) {
    db.exec(
      "ALTER TABLE empresas ADD COLUMN nome_empresa TEXT NOT NULL DEFAULT ''"
    );
  }
  if (!nomesColunas.includes("cor_primaria")) {
    db.exec("ALTER TABLE empresas ADD COLUMN cor_primaria TEXT DEFAULT '#094a73'");
  }
  if (!nomesColunas.includes("cor_secundaria")) {
    db.exec("ALTER TABLE empresas ADD COLUMN cor_secundaria TEXT DEFAULT '#048abf'");
  }
  if (!nomesColunas.includes("cor_terciaria")) {
    db.exec("ALTER TABLE empresas ADD COLUMN cor_terciaria TEXT DEFAULT '#04b2d9'");
  }
}

export function fecharBancoEmpresas(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
