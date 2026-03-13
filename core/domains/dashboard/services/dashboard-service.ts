import { dashboardRepository } from "@/core/repository/dashboard-repository";
import {
  EstatisticasDashboard,
  OrcamentoOSDB,
  TituloReceberDB,
  TituloPagarDB,
} from "@/core/tipos/dashboard-db";
import {
  EstatisticasDashboardSchema,
  OrcamentoOSSchema,
  TituloReceberSchema,
  TituloPagarSchema,
} from "@/core/schemas/dashboard-schemas";
import type { EmpresaConfig } from "@/core/entities/EmpresaConfig";

export class DashboardService {
  async obterEstatisticas(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<EstatisticasDashboard> {
    const estatisticas = await dashboardRepository.obterEstatisticas(
      codEmpresa,
      empresaConfig
    );
    return EstatisticasDashboardSchema.parse(estatisticas);
  }

  async listarOrcamentosRecentes(
    codEmpresa: number,
    limite: number,
    empresaConfig: EmpresaConfig
  ): Promise<OrcamentoOSDB[]> {
    const orcamentos = await dashboardRepository.listarOrcamentosRecentes(
      codEmpresa,
      limite,
      empresaConfig
    );
    return orcamentos.map((orc) => OrcamentoOSSchema.parse(orc));
  }

  async listarTitulosReceberVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloReceberDB[]> {
    const titulos = await dashboardRepository.listarTitulosReceberVencendo(
      codEmpresa,
      dias,
      empresaConfig
    );
    return titulos.map((tit) => TituloReceberSchema.parse(tit));
  }

  async listarTitulosPagarVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloPagarDB[]> {
    const titulos = await dashboardRepository.listarTitulosPagarVencendo(
      codEmpresa,
      dias,
      empresaConfig
    );
    return titulos.map((tit) => TituloPagarSchema.parse(tit));
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
    return dashboardRepository.obterResumoEstoque(
      codEmpresa,
      empresaConfig
    );
  }
}

export const dashboardService = new DashboardService();
