import { clienteHttp } from "@/core/http/cliente-http";
import { Cliente } from "@/core/tipos/comercial";

class ServicoCliente {
  async listarClientes(): Promise<Cliente[]> {
    const resposta = await clienteHttp.get<Cliente[]>("/comercial/clientes");

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao listar clientes");
    }

    return resposta.data?.map((cliente) => ({
      ...cliente,
      criadoEm: new Date(cliente.criadoEm),
      atualizadoEm: new Date(cliente.atualizadoEm),
    }));
  }

  async obterClientePorId(id: string): Promise<Cliente> {
    const resposta = await clienteHttp.get<Cliente>(
      `/comercial/clientes/${id}`
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao obter cliente");
    }

    return {
      ...resposta.data,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async criarCliente(
    dados: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<Cliente> {
    const resposta = await clienteHttp.post<Cliente>(
      "/comercial/clientes",
      dados
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao criar cliente");
    }

    return {
      ...resposta.data,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async atualizarCliente(
    id: string,
    dados: Partial<Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<Cliente> {
    const resposta = await clienteHttp.put<Cliente>(
      `/comercial/clientes/${id}`,
      dados
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao atualizar cliente");
    }

    return {
      ...resposta.data,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async excluirCliente(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(`/comercial/clientes/${id}`);

    if (!resposta.success) {
      throw new Error(resposta.error?.message || "Erro ao excluir cliente");
    }
  }
}

export const servicoCliente = new ServicoCliente();
