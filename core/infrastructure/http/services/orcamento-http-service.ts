import { BaseHttpService } from './base-http-service';
import { HttpClient } from '../client/http-client';
import { Orcamento } from '@/core/tipos/comercial';

/**
 * Serviço HTTP para gerenciamento de orçamentos
 */
export class OrcamentoHttpService extends BaseHttpService<
  Orcamento,
  Omit<Orcamento, 'id' | 'criadoEm' | 'atualizadoEm'>,
  Partial<Omit<Orcamento, 'id' | 'criadoEm' | 'atualizadoEm'>>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/comercial/orcamentos', {
      dateFields: ['data', 'criadoEm', 'atualizadoEm'],
    });
  }

  protected getEntityName(): string {
    return 'orçamento';
  }

  /**
   * Aprova um orçamento
   */
  async aprovar(id: string): Promise<Orcamento> {
    const response = await this.httpClient.post<Orcamento>(
      `${this.basePath}/${id}/aprovar`
    );

    this.validateResponse(response, 'aprovar');

    return this.transformDates(response.data!);
  }

  /**
   * Processa uma ordem de serviço
   */
  async processarOrdemServico(id: string): Promise<Orcamento> {
    const response = await this.httpClient.post<Orcamento>(
      `/comercial/ordens-servico/${id}/processar`
    );

    this.validateResponse(response, 'processar ordem de serviço');

    return this.transformDates(response.data!);
  }
}
