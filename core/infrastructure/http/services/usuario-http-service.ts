import { BaseHttpService } from './base-http-service';
import { HttpClient } from '../client/http-client';
import { Usuario } from '@/core/tipos/usuario';

/**
 * Serviço HTTP para gerenciamento de usuários
 */
export class UsuarioHttpService extends BaseHttpService<
  Usuario,
  Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm'>,
  Partial<Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm'>>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/usuarios', {
      dateFields: ['criadoEm', 'atualizadoEm'],
    });
  }

  protected getEntityName(): string {
    return 'usuário';
  }
}
