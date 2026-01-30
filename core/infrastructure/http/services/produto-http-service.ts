import { BaseHttpService } from './base-http-service';
import { HttpClient } from '../client/http-client';
import { ProdutoServicoDB } from '@/core/tipos/produto-db';

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

/**
 * Serviço HTTP para gerenciamento de produtos
 */
export class ProdutoHttpService extends BaseHttpService<
  ProdutoServicoDB,
  Omit<ProdutoServicoDB, 'COD_EMPRESA' | 'COD_PRODUTO' | 'DAT_CADASTRO' | 'DAT_ALTERACAO'>,
  Partial<Omit<ProdutoServicoDB, 'COD_EMPRESA' | 'COD_PRODUTO' | 'DAT_CADASTRO' | 'DAT_ALTERACAO'>>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/produtos', {
      dateFields: [],
    });
  }

  protected getEntityName(): string {
    return 'produto';
  }

  /**
   * Lista produtos com filtros e paginação
   */
  async listarProdutos(filtros?: FiltrosProduto): Promise<RespostaListagemProdutos> {
    const params = new URLSearchParams();
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.pageSize) params.append('pageSize', filtros.pageSize.toString());
    if (filtros?.search) params.append('search', filtros.search);
    if (filtros?.sit) params.append('sit', filtros.sit);
    if (filtros?.ind) params.append('ind', filtros.ind);

    const url = `${this.basePath}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.httpClient.get<ProdutoServicoDB[]>(url);

    if (!response.success || !response.data) {
      const errorMessage = response.error?.message || 'Erro ao listar produtos';
      throw new Error(errorMessage);
    }

    const meta = response.meta as RespostaListagemProdutos | undefined;

    return {
      produtos: response.data,
      total: meta?.total || response.data.length,
      page: meta?.page || filtros?.page || 1,
      pageSize: meta?.pageSize || filtros?.pageSize || 10,
      totalPages: meta?.totalPages || 1,
    };
  }

  /**
   * Obtém produto por código
   */
  async obterProdutoPorCodigo(codProduto: number): Promise<ProdutoServicoDB> {
    return this.obterPorId(codProduto);
  }
}
