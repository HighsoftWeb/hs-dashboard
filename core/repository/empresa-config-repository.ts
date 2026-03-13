import { obterBancoEmpresas } from "../db/banco-empresas";
import { EmpresaConfig, EmpresaConfigInput } from "../entities/EmpresaConfig";
import { CORES_HIGHSOFT_PADRAO } from "../temas/cores-highsoft";
import type { EmpresaRow } from "../db/types-sqlite";

function mapearRowParaEmpresaConfig(row: EmpresaRow): EmpresaConfig {
  return {
    id: row.id,
    cnpj: row.cnpj,
    nomeEmpresa: row.nome_empresa || "",
    host: row.host,
    porta: row.porta,
    nomeBase: row.nome_base,
    usuario: row.usuario,
    senha: row.senha,
    codigosUsuariosPermitidos: row.codigos_usuarios_permitidos,
    corPrimaria: row.cor_primaria || "#64748b",
    corSecundaria: row.cor_secundaria || "#94a3b8",
    corTerciaria: row.cor_terciaria || "#cbd5e1",
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

class EmpresaConfigRepository {
  obterPorCnpj(cnpj: string): EmpresaConfig | null {
    const db = obterBancoEmpresas();
    const row = db
      .prepare("SELECT * FROM empresas WHERE cnpj = ?")
      .get(cnpj) as EmpresaRow | undefined;

    if (!row) {
      return null;
    }

    return mapearRowParaEmpresaConfig(row);
  }

  listarTodas(): EmpresaConfig[] {
    const db = obterBancoEmpresas();
    const rows = db
      .prepare("SELECT * FROM empresas ORDER BY cnpj")
      .all() as EmpresaRow[];

    return rows.map(mapearRowParaEmpresaConfig);
  }

  criar(empresa: EmpresaConfigInput): EmpresaConfig {
    const db = obterBancoEmpresas();
    const stmt = db.prepare(`
      INSERT INTO empresas (cnpj, nome_empresa, host, porta, nome_base, usuario, senha, codigos_usuarios_permitidos, cor_primaria, cor_secundaria, cor_terciaria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      empresa.cnpj,
      empresa.nomeEmpresa,
      empresa.host,
      empresa.porta,
      empresa.nomeBase,
      empresa.usuario,
      empresa.senha,
      empresa.codigosUsuariosPermitidos || null,
      empresa.corPrimaria || CORES_HIGHSOFT_PADRAO.primaria,
      empresa.corSecundaria || CORES_HIGHSOFT_PADRAO.secundaria,
      empresa.corTerciaria || CORES_HIGHSOFT_PADRAO.terciaria
    );

    const novaEmpresa = this.obterPorId(result.lastInsertRowid as number);
    if (!novaEmpresa) {
      throw new Error("Erro ao criar empresa");
    }

    return novaEmpresa;
  }

  atualizar(id: number, empresa: EmpresaConfigInput): EmpresaConfig {
    const db = obterBancoEmpresas();
    const stmt = db.prepare(`
      UPDATE empresas 
      SET cnpj = ?, nome_empresa = ?, host = ?, porta = ?, nome_base = ?, usuario = ?, senha = ?, 
          codigos_usuarios_permitidos = ?, cor_primaria = ?, cor_secundaria = ?, cor_terciaria = ?,
          atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      empresa.cnpj,
      empresa.nomeEmpresa,
      empresa.host,
      empresa.porta,
      empresa.nomeBase,
      empresa.usuario,
      empresa.senha,
      empresa.codigosUsuariosPermitidos || null,
      empresa.corPrimaria || CORES_HIGHSOFT_PADRAO.primaria,
      empresa.corSecundaria || CORES_HIGHSOFT_PADRAO.secundaria,
      empresa.corTerciaria || CORES_HIGHSOFT_PADRAO.terciaria,
      id
    );

    const empresaAtualizada = this.obterPorId(id);
    if (!empresaAtualizada) {
      throw new Error("Erro ao atualizar empresa");
    }

    return empresaAtualizada;
  }

  excluir(id: number): void {
    const db = obterBancoEmpresas();
    db.prepare("DELETE FROM empresas WHERE id = ?").run(id);
  }

  obterPorId(id: number): EmpresaConfig | null {
    const db = obterBancoEmpresas();
    const row = db.prepare("SELECT * FROM empresas WHERE id = ?").get(id) as
      | EmpresaRow
      | undefined;

    if (!row) {
      return null;
    }

    return mapearRowParaEmpresaConfig(row);
  }
}

export const empresaConfigRepository = new EmpresaConfigRepository();
