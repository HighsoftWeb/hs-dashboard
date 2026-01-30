import { clienteHttp } from "../http/cliente-http";
import { ContaReceber } from "../tipos/financeiro";

class ServicoContaReceber {
  async listarContasReceber(): Promise<ContaReceber[]> {
    const resposta = await clienteHttp.get<ContaReceber[]>("/financeiro/contas-receber");

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao listar contas a receber");
    }

    return resposta.dados.map((conta) => ({
      ...conta,
      dataVencimento: new Date(conta.dataVencimento),
      dataPagamento: conta.dataPagamento ? new Date(conta.dataPagamento) : undefined,
      criadoEm: new Date(conta.criadoEm),
      atualizadoEm: new Date(conta.atualizadoEm),
    }));
  }

  async obterContaReceberPorId(id: string): Promise<ContaReceber> {
    const resposta = await clienteHttp.get<ContaReceber>(
      `/financeiro/contas-receber/${id}`
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao obter conta a receber");
    }

    return {
      ...resposta.dados,
      dataVencimento: new Date(resposta.dados.dataVencimento),
      dataPagamento: resposta.dados.dataPagamento
        ? new Date(resposta.dados.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
    };
  }

  async criarContaReceber(
    dados: Omit<ContaReceber, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<ContaReceber> {
    const resposta = await clienteHttp.post<ContaReceber>(
      "/financeiro/contas-receber",
      dados
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao criar conta a receber");
    }

    return {
      ...resposta.dados,
      dataVencimento: new Date(resposta.dados.dataVencimento),
      dataPagamento: resposta.dados.dataPagamento
        ? new Date(resposta.dados.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
    };
  }

  async atualizarContaReceber(
    id: string,
    dados: Partial<Omit<ContaReceber, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<ContaReceber> {
    const resposta = await clienteHttp.put<ContaReceber>(
      `/financeiro/contas-receber/${id}`,
      dados
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao atualizar conta a receber");
    }

    return {
      ...resposta.dados,
      dataVencimento: new Date(resposta.dados.dataVencimento),
      dataPagamento: resposta.dados.dataPagamento
        ? new Date(resposta.dados.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.dados.criadoEm),
      atualizadoEm: new Date(resposta.dados.atualizadoEm),
    };
  }

  async excluirContaReceber(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(`/financeiro/contas-receber/${id}`);

    if (!resposta.sucesso) {
      throw new Error(resposta.mensagem || "Erro ao excluir conta a receber");
    }
  }
}

export const servicoContaReceber = new ServicoContaReceber();
