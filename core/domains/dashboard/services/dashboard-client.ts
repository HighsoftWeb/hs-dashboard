import { EstatisticasDashboard } from "@/core/tipos/dashboard-db";
import { Orcamento } from "@/core/tipos/comercial";
import { DASHBOARD_PADRAO } from "@/core/constants/paginacao";
import { clienteHttp } from "@/core/http/cliente-http";

export interface ContaVencendo {
  id: string;
  tipo: "receber" | "pagar";
  descricao: string;
  valor: number;
  dataVencimento: Date;
  clienteId?: string;
  fornecedorId?: string;
}

interface OrcamentoOSDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_CLI_FOR: number;
  COD_SERIE_ORC_OS: string;
  NUM_DOCUMENTO: string | null;
  DAT_EMISSAO: Date | null;
  VLR_LIQUIDO: number | null;
  SIT_ORCAMENTO_OS: string | null;
  RAZ_CLI_FOR: string | null;
}

class ServicoDashboard {
  async obterEstatisticas(): Promise<EstatisticasDashboard> {
    const resposta = await clienteHttp.get<EstatisticasDashboard>(
      "/dashboard/estatisticas"
    );

    if (!resposta.success || !resposta.data) {
      const errorMessage =
        resposta.error?.message || "Erro ao obter estatísticas";
      throw new Error(errorMessage);
    }

    return resposta.data;
  }

  async listarOrcamentosRecentes(limite?: number): Promise<Orcamento[]> {
    const limiteFinal = limite || DASHBOARD_PADRAO.LIMITE_ORCAMENTOS;
    const params = `?limite=${limiteFinal}`;
    const resposta = await clienteHttp.get<OrcamentoOSDB[]>(
      `/dashboard/orcamentos-recentes${params}`
    );

    if (!resposta.success || !resposta.data) {
      const errorMessage =
        resposta.error?.message || "Erro ao listar orçamentos";
      throw new Error(errorMessage);
    }

    return resposta.data.map((orc) => {
      const dataEmissao = orc.DAT_EMISSAO
        ? orc.DAT_EMISSAO instanceof Date
          ? orc.DAT_EMISSAO
          : new Date(orc.DAT_EMISSAO)
        : new Date();

      return {
        id: `${orc.COD_EMPRESA}-${orc.IND_ORCAMENTO_OS}-${orc.NUM_ORCAMENTO_OS}`,
        clienteId: orc.COD_CLI_FOR.toString(),
        numero: orc.NUM_DOCUMENTO || `${orc.IND_ORCAMENTO_OS}-${orc.NUM_ORCAMENTO_OS}`,
        data: dataEmissao,
        valorTotal: orc.VLR_LIQUIDO || 0,
        tipo: orc.IND_ORCAMENTO_OS === "OR" ? "orcamento" : "ordem-servico",
        status: this.mapearStatus(orc.SIT_ORCAMENTO_OS),
        observacoes: undefined,
        criadoEm: dataEmissao,
        atualizadoEm: dataEmissao,
      };
    });
  }

  async listarContasVencendo(dias?: number): Promise<ContaVencendo[]> {
    const diasFinal = dias || DASHBOARD_PADRAO.DIAS_VENCIMENTO;
    const params = `?dias=${diasFinal}`;
    const resposta = await clienteHttp.get<ContaVencendo[]>(
      `/dashboard/contas-vencendo${params}`
    );

    if (!resposta.success || !resposta.data) {
      const errorMessage =
        resposta.error?.message || "Erro ao listar contas vencendo";
      throw new Error(errorMessage);
    }

    return resposta.data.map((conta) => {
      const dataVencimento =
        conta.dataVencimento instanceof Date
          ? conta.dataVencimento
          : new Date(conta.dataVencimento);

      if (isNaN(dataVencimento.getTime())) {
        return {
          ...conta,
          dataVencimento: new Date(),
        };
      }

      return {
        ...conta,
        dataVencimento,
      };
    });
  }

  private mapearStatus(
    sitOrcamentoOS: string | null
  ): string {
    if (!sitOrcamentoOS) return "Aberto Total";

    const sit = sitOrcamentoOS.toUpperCase();
    
    const statusMap: Record<string, string> = {
      AB: "Aberto Total",
      AP: "Aprovado",
      PR: "Processado",
      CA: "Cancelado",
      RO: "Romaneio",
      AA: "Aguardando Aprovação",
      FP: "Faturado Parcial",
      OP: "Ordem de Produção",
    };

    return statusMap[sit] || sit;
  }
}

export const servicoDashboard = new ServicoDashboard();
