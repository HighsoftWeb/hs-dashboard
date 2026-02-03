import { clienteHttp } from "@/core/http/cliente-http";
import { EmpresaHttpService } from "@/core/infrastructure/http/services/empresa-http-service";
import { Empresa } from "@/core/tipos/empresa";

class ServicoEmpresa {
  private readonly empresaService: EmpresaHttpService;

  constructor() {
    this.empresaService = new EmpresaHttpService(clienteHttp);
  }

  async listarEmpresas(): Promise<Empresa[]> {
    return this.empresaService.listar();
  }

  async obterEmpresaPorId(id: string): Promise<Empresa> {
    return this.empresaService.obterPorId(id);
  }

  async criarEmpresa(
    dados: Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<Empresa> {
    return this.empresaService.criar(dados);
  }

  async atualizarEmpresa(
    id: string,
    dados: Partial<Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<Empresa> {
    return this.empresaService.atualizar(id, dados);
  }

  async excluirEmpresa(id: string): Promise<void> {
    return this.empresaService.excluir(id);
  }
}

export const servicoEmpresa = new ServicoEmpresa();
