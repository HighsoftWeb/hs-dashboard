import { dashboardRepository } from "../repository/dashboard-repository";
import {
  EstatisticasDashboard,
  OrcamentoOSDB,
  TituloReceberDB,
  TituloPagarDB,
} from "../tipos/dashboard-db";
import {
  EstatisticasDashboardSchema,
  OrcamentoOSSchema,
  TituloReceberSchema,
  TituloPagarSchema,
} from "../schemas/dashboard-schemas";

export class DashboardService {
  async obterEstatisticas(
    codEmpresa: number
  ): Promise<EstatisticasDashboard> {
    const estatisticas = await dashboardRepository.obterEstatisticas(
      codEmpresa
    );
    return EstatisticasDashboardSchema.parse(estatisticas);
  }

  async listarOrcamentosRecentes(
    codEmpresa: number,
    limite: number
  ): Promise<OrcamentoOSDB[]> {
    const orcamentos = await dashboardRepository.listarOrcamentosRecentes(
      codEmpresa,
      limite
    );
    return orcamentos.map((orc) => OrcamentoOSSchema.parse(orc));
  }

  async listarTitulosReceberVencendo(
    codEmpresa: number,
    dias: number
  ): Promise<TituloReceberDB[]> {
    const titulos = await dashboardRepository.listarTitulosReceberVencendo(
      codEmpresa,
      dias
    );
    return titulos.map((tit) => TituloReceberSchema.parse(tit));
  }

  async listarTitulosPagarVencendo(
    codEmpresa: number,
    dias: number
  ): Promise<TituloPagarDB[]> {
    const titulos = await dashboardRepository.listarTitulosPagarVencendo(
      codEmpresa,
      dias
    );
    return titulos.map((tit) => TituloPagarSchema.parse(tit));
  }
}

export const dashboardService = new DashboardService();
