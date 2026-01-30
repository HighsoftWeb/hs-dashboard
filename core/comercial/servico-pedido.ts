import { clienteHttp } from "../http/cliente-http";
import { PedidoHttpService } from "../infrastructure/http/services/pedido-http-service";
import { Pedido } from "../tipos/comercial";

class ServicoPedido {
  private readonly pedidoService: PedidoHttpService;

  constructor() {
    this.pedidoService = new PedidoHttpService(clienteHttp);
  }

  async listarPedidos(): Promise<Pedido[]> {
    return this.pedidoService.listar();
  }

  async obterPedidoPorId(id: string): Promise<Pedido> {
    return this.pedidoService.obterPorId(id);
  }

  async criarPedido(
    dados: Omit<Pedido, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<Pedido> {
    return this.pedidoService.criar(dados);
  }

  async atualizarPedido(
    id: string,
    dados: Partial<Omit<Pedido, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<Pedido> {
    return this.pedidoService.atualizar(id, dados);
  }

  async excluirPedido(id: string): Promise<void> {
    return this.pedidoService.excluir(id);
  }
}

export const servicoPedido = new ServicoPedido();
