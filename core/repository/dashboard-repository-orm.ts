import { AppDataSource, inicializarDataSource } from "../orm/data-source";
import { poolBanco } from "../db/pool-banco";
import { OrcamentoOS } from "../entities/OrcamentoOS";
import { TituloReceber } from "../entities/TituloReceber";
import { TituloPagar } from "../entities/TituloPagar";
import { Usuario } from "../entities/Usuario";
import { ClienteFornecedor } from "../entities/ClienteFornecedor";
import { ProdutoServico } from "../entities/ProdutoServico";
import {
  OrcamentoOSDB,
  TituloReceberDB,
  TituloPagarDB,
  EstatisticasDashboard,
} from "../tipos/dashboard-db";
import { Between } from "typeorm";
import { logger } from "../utils/logger";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export class DashboardRepositoryORM {
  async obterEstatisticas(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<EstatisticasDashboard> {
    try {
      await inicializarDataSource();

      const usuarioRepo = AppDataSource.getRepository(Usuario);
      const produtoRepo = AppDataSource.getRepository(ProdutoServico);
      const clienteRepo = AppDataSource.getRepository(ClienteFornecedor);
      const orcamentoRepo = AppDataSource.getRepository(OrcamentoOS);
      const tituloReceberRepo = AppDataSource.getRepository(TituloReceber);
      const tituloPagarRepo = AppDataSource.getRepository(TituloPagar);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

      const [
        totalUsuarios,
        totalClientes,
        totalProdutos,
        orcamentosHoje,
        orcamentosMes,
        receitasMes,
        despesasMes,
        totalEmpresasResult,
      ] = await Promise.all([
      usuarioRepo.count({ where: { SIT_USUARIO: "A" } }),
      clienteRepo
        .createQueryBuilder("cliente")
        .where("cliente.SIT_CLI_FOR = :sit", { sit: "A" })
        .andWhere("cliente.CLI_FOR_AMBOS IN (:...tipos)", { tipos: ["C", "A"] })
        .getCount(),
      produtoRepo.count({
        where: { COD_EMPRESA: codEmpresa, SIT_PRODUTO: "A" },
      }),
      orcamentoRepo.count({
        where: {
          COD_EMPRESA: codEmpresa,
          DAT_EMISSAO: Between(hoje, amanha),
        },
      }),
      orcamentoRepo.count({
        where: {
          COD_EMPRESA: codEmpresa,
          DAT_EMISSAO: Between(inicioMes, fimMes),
        },
      }),
      tituloReceberRepo
        .createQueryBuilder("titulo")
        .select("SUM(titulo.VLR_ABERTO)", "total")
        .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
        .andWhere("titulo.SIT_TITULO = :sit", { sit: "AB" })
        .andWhere("MONTH(titulo.VCT_ORIGINAL) = :mes", { mes: hoje.getMonth() + 1 })
        .andWhere("YEAR(titulo.VCT_ORIGINAL) = :ano", { ano: hoje.getFullYear() })
        .getRawOne(),
      tituloPagarRepo
        .createQueryBuilder("titulo")
        .select("SUM(titulo.VLR_ABERTO)", "total")
        .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
        .andWhere("titulo.SIT_TITULO = :sit", { sit: "AB" })
        .andWhere("MONTH(titulo.VCT_ORIGINAL) = :mes", { mes: hoje.getMonth() + 1 })
        .andWhere("YEAR(titulo.VCT_ORIGINAL) = :ano", { ano: hoje.getFullYear() })
        .getRawOne(),
      produtoRepo
        .createQueryBuilder("produto")
        .select("COUNT(DISTINCT produto.COD_EMPRESA)", "total")
        .getRawOne(),
    ]);

      const totalEmpresas = parseInt(totalEmpresasResult?.total || "1", 10);

      return {
        totalUsuarios,
        totalEmpresas,
        totalClientes,
        totalProdutos,
        orcamentosHoje,
        orcamentosMes,
        receitasMes: parseFloat(receitasMes?.total || "0"),
        despesasMes: parseFloat(despesasMes?.total || "0"),
        lucroMes:
          parseFloat(receitasMes?.total || "0") -
          parseFloat(despesasMes?.total || "0"),
      };
    } catch (erro) {
      logger.warn("Erro ao obter estatísticas com TypeORM, usando SQL raw", {
        codEmpresa,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM dbo.USUARIOS WHERE SIT_USUARIO = 'A') as totalUsuarios,
          (SELECT COUNT(DISTINCT COD_EMPRESA) FROM dbo.PARAMETROS_EMPRESA) as totalEmpresas,
          (SELECT COUNT(*) FROM dbo.CLIENTES_FORNECEDORES WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')) as totalClientes,
          (SELECT COUNT(*) FROM dbo.PRODUTOS_SERVICOS WHERE COD_EMPRESA = @codEmpresa AND SIT_PRODUTO = 'A') as totalProdutos,
          (SELECT COUNT(*) FROM dbo.ORCAMENTOS_OS WHERE COD_EMPRESA = @codEmpresa AND CAST(DAT_EMISSAO AS DATE) = CAST(GETDATE() AS DATE)) as orcamentosHoje,
          (SELECT COUNT(*) FROM dbo.ORCAMENTOS_OS WHERE COD_EMPRESA = @codEmpresa AND MONTH(DAT_EMISSAO) = MONTH(GETDATE()) AND YEAR(DAT_EMISSAO) = YEAR(GETDATE())) as orcamentosMes,
          (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_RECEBER WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND MONTH(VCT_ORIGINAL) = MONTH(GETDATE()) AND YEAR(VCT_ORIGINAL) = YEAR(GETDATE())) as receitasMes,
          (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_PAGAR WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND MONTH(VCT_ORIGINAL) = MONTH(GETDATE()) AND YEAR(VCT_ORIGINAL) = YEAR(GETDATE())) as despesasMes
      `;

      const resultado = await poolBanco.executarConsulta<{
        totalUsuarios: number;
        totalEmpresas: number;
        totalClientes: number;
        totalProdutos: number;
        orcamentosHoje: number;
        orcamentosMes: number;
        receitasMes: number;
        despesasMes: number;
      }>(query, { codEmpresa }, empresaConfig);

      const stats = resultado[0] || {
        totalUsuarios: 0,
        totalEmpresas: 0,
        totalClientes: 0,
        totalProdutos: 0,
        orcamentosHoje: 0,
        orcamentosMes: 0,
        receitasMes: 0,
        despesasMes: 0,
      };

      return {
        ...stats,
        lucroMes: stats.receitasMes - stats.despesasMes,
      };
    }
  }

  async listarOrcamentosRecentes(
    codEmpresa: number,
    limite: number,
    empresaConfig: EmpresaConfig
  ): Promise<OrcamentoOSDB[]> {
    try {
      await inicializarDataSource();
      const repository = AppDataSource.getRepository(OrcamentoOS);

      const orcamentos = await repository.find({
        where: { COD_EMPRESA: codEmpresa },
        order: { DAT_EMISSAO: "DESC" },
        take: limite,
      });

      const clienteRepo = AppDataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [
        ...new Set(orcamentos.map((o) => o.COD_CLI_FOR)),
      ];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(
        clientes.map((c) => [c.COD_CLI_FOR, c])
      );

      const orcamentosComCliente = orcamentos.map((orc) => {
        const cliente = clientesMap.get(orc.COD_CLI_FOR);

        return {
          COD_EMPRESA: orc.COD_EMPRESA,
          IND_ORCAMENTO_OS: orc.IND_ORCAMENTO_OS,
          NUM_ORCAMENTO_OS: orc.NUM_ORCAMENTO_OS,
          COD_CLI_FOR: orc.COD_CLI_FOR,
          COD_SERIE_ORC_OS: orc.COD_SERIE_ORC_OS,
          NUM_DOCUMENTO: orc.NUM_DOCUMENTO,
          DAT_EMISSAO: orc.DAT_EMISSAO,
          VLR_LIQUIDO: orc.VLR_LIQUIDO,
          SIT_ORCAMENTO_OS: orc.SIT_ORCAMENTO_OS,
          RAZ_CLI_FOR: cliente?.RAZ_CLI_FOR || null,
        };
      });

      return orcamentosComCliente;
    } catch (erro) {
      logger.warn("Erro ao listar orçamentos com TypeORM, usando SQL raw", {
        codEmpresa,
        limite,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
        SELECT TOP (@limite)
          O.COD_EMPRESA,
          O.IND_ORCAMENTO_OS,
          O.NUM_ORCAMENTO_OS,
          O.COD_CLI_FOR,
          O.COD_SERIE_ORC_OS,
          O.NUM_DOCUMENTO,
          O.DAT_EMISSAO,
          O.VLR_LIQUIDO,
          O.SIT_ORCAMENTO_OS,
          C.RAZ_CLI_FOR
        FROM dbo.ORCAMENTOS_OS O
        LEFT JOIN dbo.CLIENTES_FORNECEDORES C ON C.COD_CLI_FOR = O.COD_CLI_FOR
        WHERE O.COD_EMPRESA = @codEmpresa
        ORDER BY O.DAT_EMISSAO DESC
      `;

      return poolBanco.executarConsulta<OrcamentoOSDB>(
        query,
        { codEmpresa, limite },
        empresaConfig
      );
    }
  }

  async listarTitulosReceberVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloReceberDB[]> {
    try {
      await inicializarDataSource();
      const repository = AppDataSource.getRepository(TituloReceber);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataLimite = new Date(hoje);
      dataLimite.setDate(dataLimite.getDate() + dias);

      const titulos = await repository.find({
        where: {
          COD_EMPRESA: codEmpresa,
          SIT_TITULO: "AB",
          VCT_ORIGINAL: Between(hoje, dataLimite),
        },
        order: { VCT_ORIGINAL: "ASC" },
        take: 10,
      });

      const clienteRepo = AppDataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [
        ...new Set(titulos.map((t) => t.COD_CLI_FOR)),
      ];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(
        clientes.map((c) => [c.COD_CLI_FOR, c])
      );

      const titulosComCliente = titulos.map((tit) => {
        const cliente = clientesMap.get(tit.COD_CLI_FOR);

        return {
          COD_EMPRESA: tit.COD_EMPRESA,
          COD_CLI_FOR: tit.COD_CLI_FOR,
          COD_TIPO_TITULO: tit.COD_TIPO_TITULO,
          NUM_TITULO: tit.NUM_TITULO,
          SEQ_TITULO: tit.SEQ_TITULO,
          VCT_ORIGINAL: tit.VCT_ORIGINAL,
          VLR_ABERTO: tit.VLR_ABERTO,
          SIT_TITULO: tit.SIT_TITULO,
          RAZ_CLI_FOR: cliente?.RAZ_CLI_FOR || null,
        };
      });

      return titulosComCliente;
    } catch (erro) {
      logger.warn("Erro ao listar títulos receber com TypeORM, usando SQL raw", {
        codEmpresa,
        dias,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
        SELECT TOP (10)
          T.COD_EMPRESA,
          T.COD_CLI_FOR,
          T.COD_TIPO_TITULO,
          T.NUM_TITULO,
          T.SEQ_TITULO,
          T.VCT_ORIGINAL,
          T.VLR_ABERTO,
          T.SIT_TITULO,
          C.RAZ_CLI_FOR
        FROM dbo.TITULOS_RECEBER T
        LEFT JOIN dbo.CLIENTES_FORNECEDORES C ON C.COD_CLI_FOR = T.COD_CLI_FOR
        WHERE T.COD_EMPRESA = @codEmpresa
          AND T.SIT_TITULO = 'AB'
          AND T.VCT_ORIGINAL BETWEEN GETDATE() AND DATEADD(DAY, @dias, GETDATE())
        ORDER BY T.VCT_ORIGINAL ASC
      `;

      return poolBanco.executarConsulta<TituloReceberDB>(
        query,
        { codEmpresa, dias },
        empresaConfig
      );
    }
  }

  async listarTitulosPagarVencendo(
    codEmpresa: number,
    dias: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloPagarDB[]> {
    try {
      await inicializarDataSource();
      const repository = AppDataSource.getRepository(TituloPagar);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataLimite = new Date(hoje);
      dataLimite.setDate(dataLimite.getDate() + dias);

      const titulos = await repository.find({
        where: {
          COD_EMPRESA: codEmpresa,
          SIT_TITULO: "AB",
          VCT_ORIGINAL: Between(hoje, dataLimite),
        },
        order: { VCT_ORIGINAL: "ASC" },
        take: 10,
      });

      const clienteRepo = AppDataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [
        ...new Set(titulos.map((t) => t.COD_CLI_FOR)),
      ];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(
        clientes.map((c) => [c.COD_CLI_FOR, c])
      );

      const titulosComCliente = titulos.map((tit) => {
        const cliente = clientesMap.get(tit.COD_CLI_FOR);

        return {
          COD_EMPRESA: tit.COD_EMPRESA,
          NUM_INTERNO: tit.NUM_INTERNO,
          NUM_PARCELA: tit.NUM_PARCELA,
          COD_CLI_FOR: tit.COD_CLI_FOR,
          VCT_ORIGINAL: tit.VCT_ORIGINAL,
          VLR_ABERTO: tit.VLR_ABERTO,
          SIT_TITULO: tit.SIT_TITULO,
          RAZ_CLI_FOR: cliente?.RAZ_CLI_FOR || null,
        };
      });

      return titulosComCliente;
    } catch (erro) {
      logger.warn("Erro ao listar títulos pagar com TypeORM, usando SQL raw", {
        codEmpresa,
        dias,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const query = `
        SELECT TOP (10)
          T.COD_EMPRESA,
          T.NUM_INTERNO,
          T.NUM_PARCELA,
          T.COD_CLI_FOR,
          T.VCT_ORIGINAL,
          T.VLR_ABERTO,
          T.SIT_TITULO,
          C.RAZ_CLI_FOR
        FROM dbo.TITULOS_PAGAR T
        LEFT JOIN dbo.CLIENTES_FORNECEDORES C ON C.COD_CLI_FOR = T.COD_CLI_FOR
        WHERE T.COD_EMPRESA = @codEmpresa
          AND T.SIT_TITULO = 'AB'
          AND T.VCT_ORIGINAL BETWEEN GETDATE() AND DATEADD(DAY, @dias, GETDATE())
        ORDER BY T.VCT_ORIGINAL ASC
      `;

      return poolBanco.executarConsulta<TituloPagarDB>(
        query,
        { codEmpresa, dias },
        empresaConfig
      );
    }
  }
}

export const dashboardRepositoryORM = new DashboardRepositoryORM();
