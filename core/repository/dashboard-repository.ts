import { dashboardRepositoryORM } from "./dashboard-repository-orm";
import {
  OrcamentoOSDB,
  TituloReceberDB,
  TituloPagarDB,
  EstatisticasDashboard,
} from "../tipos/dashboard-db";

export class DashboardRepository {
  async obterEstatisticas(
    codEmpresa: number
  ): Promise<EstatisticasDashboard> {
    return dashboardRepositoryORM.obterEstatisticas(codEmpresa);
  }

  async listarOrcamentosRecentes(
    codEmpresa: number,
    limite: number = 10
  ): Promise<OrcamentoOSDB[]> {
    return dashboardRepositoryORM.listarOrcamentosRecentes(codEmpresa, limite);
  }

  async listarTitulosReceberVencendo(
    codEmpresa: number,
    dias: number = 30
  ): Promise<TituloReceberDB[]> {
    return dashboardRepositoryORM.listarTitulosReceberVencendo(codEmpresa, dias);
  }

  async listarTitulosPagarVencendo(
    codEmpresa: number,
    dias: number = 30
  ): Promise<TituloPagarDB[]> {
    return dashboardRepositoryORM.listarTitulosPagarVencendo(codEmpresa, dias);
  }
}

export const dashboardRepository = new DashboardRepository();
