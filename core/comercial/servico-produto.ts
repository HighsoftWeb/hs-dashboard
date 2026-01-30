import { clienteHttp } from "../http/cliente-http";
import { ProdutoHttpService, FiltrosProduto, RespostaListagemProdutos } from "../infrastructure/http/services/produto-http-service";
import { ProdutoServicoDB } from "../tipos/produto-db";

export { FiltrosProduto, RespostaListagemProdutos };

class ServicoProduto {
  private readonly produtoService: ProdutoHttpService;

  constructor() {
    this.produtoService = new ProdutoHttpService(clienteHttp);
  }

  async listarProdutos(
    filtros?: FiltrosProduto
  ): Promise<RespostaListagemProdutos> {
    return this.produtoService.listarProdutos(filtros);
  }

  async obterProdutoPorCodigo(
    codProduto: number
  ): Promise<ProdutoServicoDB> {
    return this.produtoService.obterProdutoPorCodigo(codProduto);
  }

  async criarProduto(
    dados: Omit<
      ProdutoServicoDB,
      "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
    >
  ): Promise<ProdutoServicoDB> {
    return this.produtoService.criar(dados);
  }

  async atualizarProduto(
    codProduto: number,
    dados: Partial<
      Omit<
        ProdutoServicoDB,
        "COD_EMPRESA" | "COD_PRODUTO" | "DAT_CADASTRO" | "DAT_ALTERACAO"
      >
    >
  ): Promise<ProdutoServicoDB> {
    return this.produtoService.atualizar(codProduto, dados);
  }

  async excluirProduto(codProduto: number): Promise<void> {
    return this.produtoService.excluir(codProduto);
  }
}

export const servicoProduto = new ServicoProduto();
