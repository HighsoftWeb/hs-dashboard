import { clienteHttp } from "../http/cliente-http";
import { OrcamentoHttpService } from "../infrastructure/http/services/orcamento-http-service";
import { Orcamento } from "../tipos/comercial";

class ServicoOrcamento {
  private readonly orcamentoService: OrcamentoHttpService;

  constructor() {
    this.orcamentoService = new OrcamentoHttpService(clienteHttp);
  }

  async listarOrcamentos(): Promise<Orcamento[]> {
    return this.orcamentoService.listar();
  }

  async obterOrcamentoPorId(id: string): Promise<Orcamento> {
    return this.orcamentoService.obterPorId(id);
  }

  async criarOrcamento(
    dados: Omit<Orcamento, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<Orcamento> {
    return this.orcamentoService.criar(dados);
  }

  async atualizarOrcamento(
    id: string,
    dados: Partial<Omit<Orcamento, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<Orcamento> {
    return this.orcamentoService.atualizar(id, dados);
  }

  async aprovarOrcamento(id: string): Promise<Orcamento> {
    return this.orcamentoService.aprovar(id);
  }

  async processarOrdemServico(id: string): Promise<Orcamento> {
    return this.orcamentoService.processarOrdemServico(id);
  }

  async excluirOrcamento(id: string): Promise<void> {
    return this.orcamentoService.excluir(id);
  }
}

export const servicoOrcamento = new ServicoOrcamento();
