import { produtoRepository } from "../repository/produto-repository";
import { ProdutoServicoDB, DerivacaoDB, EstoqueDB } from "../tipos/produto-db";
import { PAGINACAO_PADRAO } from "../constants/paginacao";

export interface FiltrosProduto {
  page?: number;
  pageSize?: number;
  search?: string;
  sit?: string;
  ind?: string;
}

export interface RespostaListagemProdutos {
  produtos: ProdutoServicoDB[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProdutoService {
  async listar(
    codEmpresa: number,
    filtros: FiltrosProduto
  ): Promise<RespostaListagemProdutos> {
    const page = filtros.page || PAGINACAO_PADRAO.PAGE_DEFAULT;
    const pageSizeRaw = filtros.pageSize || PAGINACAO_PADRAO.PAGE_SIZE;
    const pageSize = Math.min(pageSizeRaw, PAGINACAO_PADRAO.PAGE_SIZE_MAX);

    const { produtos, total } = await produtoRepository.listar(
      codEmpresa,
      filtros
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      produtos,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async obterPorCodigo(
    codEmpresa: number,
    codProduto: number
  ): Promise<ProdutoServicoDB> {
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    return produto;
  }

  async criar(
    codEmpresa: number,
    dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    >,
    codUsuario?: number
  ): Promise<ProdutoServicoDB> {
    if (!dados.DES_PRODUTO || (dados.DES_PRODUTO && dados.DES_PRODUTO.trim().length === 0)) {
      throw new Error("DES_PRODUTO é obrigatório");
    }

    if (dados.DES_PRODUTO && dados.DES_PRODUTO.length > 200) {
      throw new Error("DES_PRODUTO deve ter no máximo 200 caracteres");
    }

    const codProduto = await produtoRepository.criar(codEmpresa, {
      ...dados,
      COD_USUARIO: codUsuario || null,
    });
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Erro ao criar produto");
    }

    return produto;
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
    codUsuario?: number
  ): Promise<ProdutoServicoDB> {
    const produtoExistente = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produtoExistente) {
      throw new Error("Produto não encontrado");
    }

    if (dados.DES_PRODUTO !== undefined && dados.DES_PRODUTO !== null) {
      if (dados.DES_PRODUTO.trim().length === 0) {
        throw new Error("DES_PRODUTO não pode ser vazio");
      }
      if (dados.DES_PRODUTO.length > 200) {
        throw new Error("DES_PRODUTO deve ter no máximo 200 caracteres");
      }
    }

    await produtoRepository.atualizar(codEmpresa, codProduto, {
      ...dados,
      COD_USUARIO: codUsuario || dados.COD_USUARIO || null,
    });
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Erro ao atualizar produto");
    }

    return produto;
  }

  async excluir(codEmpresa: number, codProduto: number): Promise<void> {
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    const [derivacoes, estoques] = await Promise.all([
      produtoRepository.listarDerivacoes(codEmpresa, codProduto),
      produtoRepository.listarEstoques(codEmpresa, codProduto),
    ]);

    await produtoRepository.inativar(codEmpresa, codProduto);
  }

  async listarDerivacoes(
    codEmpresa: number,
    codProduto: number
  ): Promise<DerivacaoDB[]> {
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    return produtoRepository.listarDerivacoes(codEmpresa, codProduto);
  }

  async listarEstoques(
    codEmpresa: number,
    codProduto: number
  ): Promise<EstoqueDB[]> {
    const produto = await produtoRepository.obterPorCodigo(
      codEmpresa,
      codProduto
    );

    if (!produto) {
      throw new Error("Produto não encontrado");
    }

    return produtoRepository.listarEstoques(codEmpresa, codProduto);
  }
}

export const produtoService = new ProdutoService();
