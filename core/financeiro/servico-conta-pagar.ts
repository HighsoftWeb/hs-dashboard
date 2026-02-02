import { clienteHttp } from "../http/cliente-http";
import { ContaPagar } from "../tipos/financeiro";

class ServicoContaPagar {
  async listarContasPagar(): Promise<ContaPagar[]> {
    const resposta = await clienteHttp.get<ContaPagar[]>("/financeiro/contas-pagar");

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao listar contas a pagar");
    }

    return resposta.data?.map((conta) => ({
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

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao obter conta a pagar");
    }

    return {
      ...resposta.data,
      dataVencimento: new Date(resposta.data.dataVencimento),
      dataPagamento: resposta.data.dataPagamento
        ? new Date(resposta.data.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async criarContaPagar(
    dados: Omit<ContaPagar, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<ContaPagar> {
    const resposta = await clienteHttp.post<ContaPagar>(
      "/financeiro/contas-pagar",
      dados as unknown as Record<string, string | number | boolean | null>
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao criar conta a pagar");
    }

    return {
      ...resposta.data,
      dataVencimento: new Date(resposta.data.dataVencimento),
      dataPagamento: resposta.data.dataPagamento
        ? new Date(resposta.data.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async atualizarContaPagar(
    id: string,
    dados: Partial<Omit<ContaPagar, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<ContaPagar> {
    const resposta = await clienteHttp.put<ContaPagar>(
      `/financeiro/contas-pagar/${id}`,
      dados as unknown as Record<string, string | number | boolean | null>
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(resposta.error?.message || "Erro ao atualizar conta a pagar");
    }

    return {
      ...resposta.data,
      dataVencimento: new Date(resposta.data.dataVencimento),
      dataPagamento: resposta.data.dataPagamento
        ? new Date(resposta.data.dataPagamento)
        : undefined,
      criadoEm: new Date(resposta.data.criadoEm),
      atualizadoEm: new Date(resposta.data.atualizadoEm),
    };
  }

  async excluirContaPagar(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(`/financeiro/contas-pagar/${id}`);

    if (!resposta.success) {
      throw new Error(resposta.error?.message || "Erro ao excluir conta a pagar");
    }
  }
}

export const servicoContaPagar = new ServicoContaPagar();
