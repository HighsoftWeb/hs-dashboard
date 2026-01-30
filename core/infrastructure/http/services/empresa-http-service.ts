import { BaseHttpService } from './base-http-service';
import { HttpClient } from '../client/http-client';
import { Empresa } from '@/core/tipos/empresa';

/**
 * Serviço HTTP para gerenciamento de empresas
 */
export class EmpresaHttpService extends BaseHttpService<
  Empresa,
  Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'>,
  Partial<Omit<Empresa, 'id' | 'criadoEm' | 'atualizadoEm'>>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/empresas', {
      dateFields: ['criadoEm', 'atualizadoEm'],
    });
  }

  protected getEntityName(): string {
    return 'empresa';
  }
}
