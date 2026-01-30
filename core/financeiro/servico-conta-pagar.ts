import { clienteHttp } from "../http/cliente-http";
import { ContaPagar } from "../tipos/financeiro";

class ServicoContaPagar {
  async listarContasPagar(): Promise<ContaPagar[]> {
    const resposta = await clienteHttp.get<ContaPagar[]>("/financeiro/contas-pagar");

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao listar contas a pagar");
    }

    return resposta.dados.map((conta) => ({
      ...conta,
      dataVencimento: new Date(conta.dataVencimento),
      dataPagamento: conta.dataPagamento ? new Date(conta.dataPagamento) : undefined,
      criadoEm: new Date(conta.criadoEm),
      atualizadoEm: new Date(conta.atualizadoEm),
    }));
  }

  async obterContaPagarPorId(id: string): Promise<ContaPagar> {
    const resposta = await clienteHttp.get<ContaPagar>(
      `/financeiro/contas-pagar/${id}`
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao obter conta a pagar");
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

  async criarContaPagar(
    dados: Omit<ContaPagar, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<ContaPagar> {
    const resposta = await clienteHttp.post<ContaPagar>(
      "/financeiro/contas-pagar",
      dados
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao criar conta a pagar");
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

  async atualizarContaPagar(
    id: string,
    dados: Partial<Omit<ContaPagar, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<ContaPagar> {
    const resposta = await clienteHttp.put<ContaPagar>(
      `/financeiro/contas-pagar/${id}`,
      dados
    );

    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem || "Erro ao atualizar conta a pagar");
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

  async excluirContaPagar(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(`/financeiro/contas-pagar/${id}`);

    if (!resposta.sucesso) {
      throw new Error(resposta.mensagem || "Erro ao excluir conta a pagar");
    }
  }
}

export const servicoContaPagar = new ServicoContaPagar();
