import { BaseHttpService } from './base-http-service';
import { HttpClient } from '../client/http-client';
import { Usuario } from '@/core/tipos/usuario';

/**
 * Serviço HTTP para gerenciamento de usuários
 */
export class UsuarioHttpService extends BaseHttpService<
  Usuario,
  Omit<Usuario, 'codUsuario'>,
  Partial<Omit<Usuario, 'codUsuario'>>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/usuarios', {
      dateFields: [],
    });
  }

  protected getEntityName(): string {
    return 'usuário';
  }
}
