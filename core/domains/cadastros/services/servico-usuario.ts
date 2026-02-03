import { clienteHttp } from "@/core/http/cliente-http";
import { UsuarioHttpService } from "@/core/infrastructure/http/services/usuario-http-service";
import { Usuario } from "@/core/tipos/usuario";

class ServicoUsuario {
  private readonly usuarioService: UsuarioHttpService;

  constructor() {
    this.usuarioService = new UsuarioHttpService(clienteHttp);
  }

  async listarUsuarios(): Promise<Usuario[]> {
    return this.usuarioService.listar();
  }

  async obterUsuarioPorId(id: string): Promise<Usuario> {
    return this.usuarioService.obterPorId(id);
  }

  async criarUsuario(dados: Omit<Usuario, "codUsuario">): Promise<Usuario> {
    return this.usuarioService.criar(dados);
  }

  async atualizarUsuario(
    id: string,
    dados: Partial<Omit<Usuario, "codUsuario">>
  ): Promise<Usuario> {
    return this.usuarioService.atualizar(id, dados);
  }

  async excluirUsuario(id: string): Promise<void> {
    return this.usuarioService.excluir(id);
  }
}

export const servicoUsuario = new ServicoUsuario();
