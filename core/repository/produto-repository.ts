import { produtoRepositoryORM } from "./produto-repository-orm";
import { ProdutoServicoDB, DerivacaoDB, EstoqueDB } from "../tipos/produto-db";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export class ProdutoRepository {
  async listar(
    codEmpresa: number,
    filtros: {
      page?: number;
      pageSize?: number;
      search?: string;
      sit?: string;
      ind?: string;
    },
    empresaConfig: EmpresaConfig
  ): Promise<{ produtos: ProdutoServicoDB[]; total: number }> {
    return produtoRepositoryORM.listar(codEmpresa, filtros, empresaConfig);
  }

  async obterPorCodigo(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<ProdutoServicoDB | null> {
    return produtoRepositoryORM.obterPorCodigo(codEmpresa, codProduto, empresaConfig);
  }

  async criar(
    codEmpresa: number,
    dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    >,
    empresaConfig: EmpresaConfig
  ): Promise<number> {
    return produtoRepositoryORM.criar(codEmpresa, dados, empresaConfig);
  }

  async atualizar(
    codEmpresa: number,
    codProduto: number,
    dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    >,
    empresaConfig: EmpresaConfig
  ): Promise<void> {
    return produtoRepositoryORM.atualizar(codEmpresa, codProduto, dados, empresaConfig);
  }

  async inativar(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<void> {
    return produtoRepositoryORM.inativar(codEmpresa, codProduto, empresaConfig);
  }

  async listarDerivacoes(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<DerivacaoDB[]> {
    return produtoRepositoryORM.listarDerivacoes(codEmpresa, codProduto, empresaConfig);
  }

  async listarEstoques(
    codEmpresa: number,
    codProduto: number,
    empresaConfig: EmpresaConfig
  ): Promise<EstoqueDB[]> {
    return produtoRepositoryORM.listarEstoques(codEmpresa, codProduto, empresaConfig);
  }
}

export const produtoRepository = new ProdutoRepository();
