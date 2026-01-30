import { clienteHttp } from "../http/cliente-http";
import { Cliente } from "../tipos/comercial";

class ServicoCliente {
  async listarClientes(): Promise<Cliente[]> {
    const resposta = await clienteHttp.get<Cliente[]>("/comercial/clientes");

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao listar clientes");
    }

    return resposta.dados.map((cliente) => ({
      ...cliente,
      criadoEm: new Date(cliente.criadoEm),
      atualizadoEm: new Date(cliente.atualizadoEm),
    }));
  }

  async obterClientePorId(id: string): Promise<Cliente> {
    const resposta = await clienteHttp.get<Cliente>(`/comercial/clientes/${id}`);

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao obter cliente");
    }

    return {
      ...resposta.dados,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
    };
  }

  async criarCliente(
    dados: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<Cliente> {
    const resposta = await clienteHttp.post<Cliente>("/comercial/clientes", dados);

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao criar cliente");
    }

    return {
      ...resposta.dados,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
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

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao atualizar cliente");
    }

    return {
      ...resposta.dados,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
    };
  }

  async excluirCliente(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(`/comercial/clientes/${id}`);

    if (!resposta.sucesso) {
      throw new Error(resposta.mensagem || "Erro ao excluir cliente");
    }
  }
}

export const servicoCliente = new ServicoCliente();
