import { dashboardRepositoryORM } from "./dashboard-repository-orm";
import {
  OrcamentoOSDB,
  TituloReceberDB,
  TituloPagarDB,
  EstatisticasDashboard,
} from "../tipos/dashboard-db";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export class DashboardRepository {
  async obterEstatisticas(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<EstatisticasDashboard> {
    return dashboardRepositoryORM.obterEstatisticas(codEmpresa, empresaConfig);
  }

  async listarOrcamentosRecentes(
    codEmpresa: number,
    limite: number,
    empresaConfig: EmpresaConfig
  ): Promise<OrcamentoOSDB[]> {
    return dashboardRepositoryORM.listarOrcamentosRecentes(
      codEmpresa,
      limite,
      empresaConfig
    );
  }

  async listarTitulosReceberVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloReceberDB[]> {
    return dashboardRepositoryORM.listarTitulosReceberVencendo(
      codEmpresa,
      dias,
      empresaConfig
    );
  }

  async listarTitulosPagarVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloPagarDB[]> {
    return dashboardRepositoryORM.listarTitulosPagarVencendo(
      codEmpresa,
      dias,
      empresaConfig
    );
  }

  async obterResumoEstoque(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<{
    totalDepositos: number;
    totalProdutosComEstoque: number;
    totalItensEstoque: number;
    somaQuantidade: number;
  }> {
    return dashboardRepositoryORM.obterResumoEstoque(codEmpresa, empresaConfig);
  }
}

export const dashboardRepository = new DashboardRepository();
