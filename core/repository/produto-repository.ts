import { produtoRepositoryORM } from "./produto-repository-orm";
import { ProdutoServicoDB, DerivacaoDB, EstoqueDB } from "../tipos/produto-db";

export class ProdutoRepository {
  async listar(
    codEmpresa: number,
    filtros: {
      page?: number;
      pageSize?: number;
      search?: string;
      sit?: string;
      ind?: string;
    }
  ): Promise<{ produtos: ProdutoServicoDB[]; total: number }> {
    return produtoRepositoryORM.listar(codEmpresa, filtros);
  }

  async obterPorCodigo(
    codEmpresa: number,
    codProduto: number
  ): Promise<ProdutoServicoDB | null> {
    return produtoRepositoryORM.obterPorCodigo(codEmpresa, codProduto);
  }

  async criar(
    codEmpresa: number,
    dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    >
  ): Promise<number> {
    return produtoRepositoryORM.criar(codEmpresa, dados);
  }

  async atualizar(
    codEmpresa: number,
    codProduto: number,
    dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    >
  ): Promise<void> {
    return produtoRepositoryORM.atualizar(codEmpresa, codProduto, dados);
  }

  async inativar(codEmpresa: number, codProduto: number): Promise<void> {
    return produtoRepositoryORM.inativar(codEmpresa, codProduto);
  }

  async listarDerivacoes(
    codEmpresa: number,
    codProduto: number
  ): Promise<DerivacaoDB[]> {
    return produtoRepositoryORM.listarDerivacoes(codEmpresa, codProduto);
  }

  async listarEstoques(
    codEmpresa: number,
    codProduto: number
  ): Promise<EstoqueDB[]> {
    return produtoRepositoryORM.listarEstoques(codEmpresa, codProduto);
  }
}

export const produtoRepository = new ProdutoRepository();
