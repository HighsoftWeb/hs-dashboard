import { clienteHttp } from "@/core/http/cliente-http";
import { ContaReceber } from "@/core/tipos/financeiro";

class ServicoContaReceber {
  async listarContasReceber(): Promise<ContaReceber[]> {
    const resposta = await clienteHttp.get<ContaReceber[]>(
      "/financeiro/contas-receber"
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(
        resposta.error?.message || "Erro ao listar contas a receber"
      );
    }

    return resposta.data?.map((conta) => ({
      ...conta,
      dataVencimento: new Date(conta.dataVencimento),
      dataPagamento: conta.dataPagamento
        ? new Date(conta.dataPagamento)
        : undefined,
      criadoEm: new Date(conta.criadoEm),
      atualizadoEm: new Date(conta.atualizadoEm),
    }));
  }

  async obterContaReceberPorId(id: string): Promise<ContaReceber> {
    const resposta = await clienteHttp.get<ContaReceber>(
      `/financeiro/contas-receber/${id}`
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(
        resposta.error?.message || "Erro ao obter conta a receber"
      );
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

  async criarContaReceber(
    dados: Omit<ContaReceber, "id" | "criadoEm" | "atualizadoEm">
  ): Promise<ContaReceber> {
    const resposta = await clienteHttp.post<ContaReceber>(
      "/financeiro/contas-receber",
      dados as unknown as Record<string, string | number | boolean | null>
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(
        resposta.error?.message || "Erro ao criar conta a receber"
      );
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

  async atualizarContaReceber(
    id: string,
    dados: Partial<Omit<ContaReceber, "id" | "criadoEm" | "atualizadoEm">>
  ): Promise<ContaReceber> {
    const resposta = await clienteHttp.put<ContaReceber>(
      `/financeiro/contas-receber/${id}`,
      dados as Record<string, string | number | boolean | null>
    );

    if (!resposta.success || !resposta.data) {
      throw new Error(
        resposta.error?.message || "Erro ao atualizar conta a receber"
      );
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

  async excluirContaReceber(id: string): Promise<void> {
    const resposta = await clienteHttp.delete(
      `/financeiro/contas-receber/${id}`
    );

    if (!resposta.success) {
      throw new Error(
        resposta.error?.message || "Erro ao excluir conta a receber"
      );
    }
  }
}

export const servicoContaReceber = new ServicoContaReceber();
