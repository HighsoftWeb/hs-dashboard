import { getAppDataSource, inicializarDataSource } from "../orm/data-source";
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
    empresaConfig: EmpresaConfig,
    dataInicio?: string,
    dataFim?: string
  ): Promise<EstatisticasDashboard> {
    try {
      await inicializarDataSource(empresaConfig);

      const dataSource = getAppDataSource();
      const usuarioRepo = dataSource.getRepository(Usuario);
      const produtoRepo = dataSource.getRepository(ProdutoServico);
      const clienteRepo = dataSource.getRepository(ClienteFornecedor);
      const orcamentoRepo = dataSource.getRepository(OrcamentoOS);
      const tituloReceberRepo = dataSource.getRepository(TituloReceber);
      const tituloPagarRepo = dataSource.getRepository(TituloPagar);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const inicioPeriodo =
        dataInicio && dataFim && !isNaN(new Date(dataInicio).getTime())
          ? new Date(dataInicio + "T00:00:00")
          : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimPeriodo =
        dataInicio && dataFim && !isNaN(new Date(dataFim).getTime())
          ? new Date(dataFim + "T23:59:59")
          : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

      const [
        totalUsuarios,
        totalClientes,
        totalProdutos,
        orcamentosHoje,
        orcamentosMes,
        receitasMes,
        despesasMes,
        receitasMesHoje,
        despesasMesHoje,
        receitasMesVencimento,
        despesasMesVencimento,
        totalEmpresasResult,
      ] = await Promise.all([
        usuarioRepo.count({ where: { SIT_USUARIO: "A" } }),
        clienteRepo
          .createQueryBuilder("cliente")
          .where("cliente.SIT_CLI_FOR = :sit", { sit: "A" })
          .andWhere("cliente.CLI_FOR_AMBOS IN (:...tipos)", {
            tipos: ["C", "A"],
          })
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
            DAT_EMISSAO: Between(inicioPeriodo, fimPeriodo),
          },
        }),
        // contas a receber hoje (vcto hoje)
        tituloReceberRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("(titulo.SIT_TITULO IS NULL OR titulo.SIT_TITULO != :ca)", {
            ca: "CA",
          })
          .andWhere(
            "COALESCE(titulo.DAT_EMISSAO, titulo.VCT_ORIGINAL) >= :inicio",
            { inicio: inicioPeriodo }
          )
          .andWhere(
            "COALESCE(titulo.DAT_EMISSAO, titulo.VCT_ORIGINAL) <= :fim",
            { fim: fimPeriodo }
          )
          .getRawOne(),
        // contas a pagar hoje (vcto hoje)
        tituloPagarRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("(titulo.SIT_TITULO IS NULL OR titulo.SIT_TITULO != :ca)", {
            ca: "CA",
          })
          .andWhere(
            "COALESCE(titulo.DAT_EMISSAO, titulo.VCT_ORIGINAL) >= :inicio",
            { inicio: inicioPeriodo }
          )
          .andWhere(
            "COALESCE(titulo.DAT_EMISSAO, titulo.VCT_ORIGINAL) <= :fim",
            { fim: fimPeriodo }
          )
          .getRawOne(),
        // contas a receber no período (por vencimento)
        tituloReceberRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("titulo.SIT_TITULO = :ab", { ab: "AB" })
          .andWhere("CAST(titulo.VCT_ORIGINAL AS DATE) = CAST(:hoje AS DATE)", {
            hoje,
          })
          .getRawOne(),
        // contas a pagar no período (por vencimento)
        tituloPagarRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("titulo.SIT_TITULO = :ab", { ab: "AB" })
          .andWhere("CAST(titulo.VCT_ORIGINAL AS DATE) = CAST(:hoje AS DATE)", {
            hoje,
          })
          .getRawOne(),
        tituloReceberRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("titulo.SIT_TITULO = :ab", { ab: "AB" })
          .andWhere("titulo.VCT_ORIGINAL >= :inicio", { inicio: inicioPeriodo })
          .andWhere("titulo.VCT_ORIGINAL <= :fim", { fim: fimPeriodo })
          .getRawOne(),
        tituloPagarRepo
          .createQueryBuilder("titulo")
          .select(
            "SUM(COALESCE(titulo.VLR_ORIGINAL, titulo.VLR_ABERTO))",
            "total"
          )
          .where("titulo.COD_EMPRESA = :codEmpresa", { codEmpresa })
          .andWhere("titulo.SIT_TITULO = :ab", { ab: "AB" })
          .andWhere("titulo.VCT_ORIGINAL >= :inicio", { inicio: inicioPeriodo })
          .andWhere("titulo.VCT_ORIGINAL <= :fim", { fim: fimPeriodo })
          .getRawOne(),
        produtoRepo
          .createQueryBuilder("produto")
          .select("COUNT(DISTINCT produto.COD_EMPRESA)", "total")
          .getRawOne(),
      ]);

      const totalEmpresas = parseInt(totalEmpresasResult?.total || "1", 10);
      const contasReceberHoje =
        parseFloat((receitasMesHoje as { total?: string })?.total || "0") || 0;
      const contasPagarHoje =
        parseFloat((despesasMesHoje as { total?: string })?.total || "0") || 0;
      const contasReceberMes =
        parseFloat((receitasMesVencimento as { total?: string })?.total || "0") ||
        0;
      const contasPagarMes =
        parseFloat((despesasMesVencimento as { total?: string })?.total || "0") ||
        0;

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
        contasReceberHoje,
        contasPagarHoje,
        contasReceberMes,
        contasPagarMes,
      };
    } catch (erro) {
      logger.warn("Erro ao obter estatísticas com TypeORM, usando SQL raw", {
        codEmpresa,
        erro: erro instanceof Error ? erro.message : String(erro),
      });

      const hoje = new Date();
      const dataInicioUsar =
        dataInicio && !isNaN(new Date(dataInicio).getTime())
          ? dataInicio
          : new Date(hoje.getFullYear(), hoje.getMonth(), 1)
              .toISOString()
              .slice(0, 10);
      const dataFimUsar =
        dataFim && !isNaN(new Date(dataFim).getTime())
          ? dataFim
          : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
              .toISOString()
              .slice(0, 10);

      const query = `
        SELECT 
          (SELECT COUNT(*) FROM dbo.USUARIOS WHERE SIT_USUARIO = 'A') as totalUsuarios,
          (SELECT COUNT(DISTINCT COD_EMPRESA) FROM dbo.PARAMETROS_EMPRESA) as totalEmpresas,
          (SELECT COUNT(*) FROM dbo.CLIENTES_FORNECEDORES WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')) as totalClientes,
          (SELECT COUNT(*) FROM dbo.PRODUTOS_SERVICOS WHERE COD_EMPRESA = @codEmpresa AND SIT_PRODUTO = 'A') as totalProdutos,
          (SELECT COUNT(*) FROM dbo.ORCAMENTOS_OS WHERE COD_EMPRESA = @codEmpresa AND CAST(DAT_EMISSAO AS DATE) = CAST(GETDATE() AS DATE)) as orcamentosHoje,
          (SELECT COUNT(*) FROM dbo.ORCAMENTOS_OS WHERE COD_EMPRESA = @codEmpresa AND CAST(DAT_EMISSAO AS DATE) >= CAST(@dataInicio AS DATE) AND CAST(DAT_EMISSAO AS DATE) <= CAST(@dataFim AS DATE)) as orcamentosMes,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_RECEBER WHERE COD_EMPRESA = @codEmpresa AND (SIT_TITULO IS NULL OR SIT_TITULO != 'CA') AND CAST(COALESCE(DAT_EMISSAO, VCT_ORIGINAL) AS DATE) >= CAST(@dataInicio AS DATE) AND CAST(COALESCE(DAT_EMISSAO, VCT_ORIGINAL) AS DATE) <= CAST(@dataFim AS DATE)) as receitasMes,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_PAGAR WHERE COD_EMPRESA = @codEmpresa AND (SIT_TITULO IS NULL OR SIT_TITULO != 'CA') AND CAST(COALESCE(DAT_EMISSAO, VCT_ORIGINAL) AS DATE) >= CAST(@dataInicio AS DATE) AND CAST(COALESCE(DAT_EMISSAO, VCT_ORIGINAL) AS DATE) <= CAST(@dataFim AS DATE)) as despesasMes,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_RECEBER WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND CAST(VCT_ORIGINAL AS DATE) = CAST(GETDATE() AS DATE)) as contasReceberHoje,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_PAGAR WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND CAST(VCT_ORIGINAL AS DATE) = CAST(GETDATE() AS DATE)) as contasPagarHoje,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_RECEBER WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND CAST(VCT_ORIGINAL AS DATE) >= CAST(@dataInicio AS DATE) AND CAST(VCT_ORIGINAL AS DATE) <= CAST(@dataFim AS DATE)) as contasReceberMes,
          (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0) FROM dbo.TITULOS_PAGAR WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND CAST(VCT_ORIGINAL AS DATE) >= CAST(@dataInicio AS DATE) AND CAST(VCT_ORIGINAL AS DATE) <= CAST(@dataFim AS DATE)) as contasPagarMes
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
        contasReceberHoje: number;
        contasPagarHoje: number;
        contasReceberMes: number;
        contasPagarMes: number;
      }>(
        query,
        { codEmpresa, dataInicio: dataInicioUsar, dataFim: dataFimUsar },
        empresaConfig
      );

      const stats = resultado[0] || {
        totalUsuarios: 0,
        totalEmpresas: 0,
        totalClientes: 0,
        totalProdutos: 0,
        orcamentosHoje: 0,
        orcamentosMes: 0,
        receitasMes: 0,
        despesasMes: 0,
        contasReceberHoje: 0,
        contasPagarHoje: 0,
        contasReceberMes: 0,
        contasPagarMes: 0,
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
    empresaConfig: EmpresaConfig,
    dataInicio?: string,
    dataFim?: string
  ): Promise<OrcamentoOSDB[]> {
    try {
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(OrcamentoOS);

      const hoje = new Date();
      const inicioPeriodo =
        dataInicio && !isNaN(new Date(dataInicio).getTime())
          ? new Date(dataInicio + "T00:00:00")
          : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimPeriodo =
        dataFim && !isNaN(new Date(dataFim).getTime())
          ? new Date(dataFim + "T23:59:59")
          : new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

      const orcamentos = await repository.find({
        where: {
          COD_EMPRESA: codEmpresa,
          DAT_EMISSAO: Between(inicioPeriodo, fimPeriodo),
        },
        order: { DAT_EMISSAO: "DESC" },
        take: limite,
      });

      const clienteRepo = dataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [
        ...new Set(orcamentos.map((o) => o.COD_CLI_FOR)),
      ];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(clientes.map((c) => [c.COD_CLI_FOR, c]));

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
          AND O.DAT_EMISSAO >= @dataInicio AND O.DAT_EMISSAO <= @dataFim
        ORDER BY O.DAT_EMISSAO DESC
      `;

      const hoje = new Date();
      const inicioPeriodoFallback = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      )
        .toISOString()
        .slice(0, 10);
      const fimPeriodoFallback = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0
      )
        .toISOString()
        .slice(0, 10);

      return poolBanco.executarConsulta<OrcamentoOSDB>(
        query,
        {
          codEmpresa,
          limite,
          dataInicio: inicioPeriodoFallback,
          dataFim: fimPeriodoFallback,
        },
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
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(TituloReceber);

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
        order: { VCT_ORIGINAL: "DESC" },
        take: 25,
      });

      const clienteRepo = dataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [...new Set(titulos.map((t) => t.COD_CLI_FOR))];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(clientes.map((c) => [c.COD_CLI_FOR, c]));

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
      logger.warn(
        "Erro ao listar títulos receber com TypeORM, usando SQL raw",
        {
          codEmpresa,
          dias,
          erro: erro instanceof Error ? erro.message : String(erro),
        }
      );

      const query = `
        SELECT TOP (25)
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
        ORDER BY T.VCT_ORIGINAL DESC
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
      await inicializarDataSource(empresaConfig);
      const dataSource = getAppDataSource();
      const repository = dataSource.getRepository(TituloPagar);

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
        order: { VCT_ORIGINAL: "DESC" },
        take: 25,
      });

      const clienteRepo = dataSource.getRepository(ClienteFornecedor);
      const codigosClientes = [...new Set(titulos.map((t) => t.COD_CLI_FOR))];
      const clientes = await clienteRepo.find({
        where: codigosClientes.map((cod) => ({ COD_CLI_FOR: cod })),
      });
      const clientesMap = new Map(clientes.map((c) => [c.COD_CLI_FOR, c]));

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
        SELECT TOP (25)
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
        ORDER BY T.VCT_ORIGINAL DESC
      `;

      return poolBanco.executarConsulta<TituloPagarDB>(
        query,
        { codEmpresa, dias },
        empresaConfig
      );
    }
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
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM dbo.DEPOSITOS) as totalDepositos,
          (SELECT COUNT(DISTINCT COD_PRODUTO) FROM dbo.ESTOQUES WHERE COD_EMPRESA = @codEmpresa) as totalProdutosComEstoque,
          (SELECT COUNT(*) FROM dbo.ESTOQUES WHERE COD_EMPRESA = @codEmpresa) as totalItensEstoque,
          (SELECT ISNULL(SUM(QTD_ATUAL), 0) FROM dbo.ESTOQUES WHERE COD_EMPRESA = @codEmpresa) as somaQuantidade
      `;
      const resultado = await poolBanco.executarConsulta<{
        totalDepositos: number;
        totalProdutosComEstoque: number;
        totalItensEstoque: number;
        somaQuantidade: number;
      }>(query, { codEmpresa }, empresaConfig);

      const r = resultado[0] || {
        totalDepositos: 0,
        totalProdutosComEstoque: 0,
        totalItensEstoque: 0,
        somaQuantidade: 0,
      };
      return {
        totalDepositos: Number(r.totalDepositos) || 0,
        totalProdutosComEstoque: Number(r.totalProdutosComEstoque) || 0,
        totalItensEstoque: Number(r.totalItensEstoque) || 0,
        somaQuantidade: Number(r.somaQuantidade) || 0,
      };
    } catch (erro) {
      logger.warn("Erro ao obter resumo estoque", {
        codEmpresa,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
      return {
        totalDepositos: 0,
        totalProdutosComEstoque: 0,
        totalItensEstoque: 0,
        somaQuantidade: 0,
      };
    }
  }
}

export const dashboardRepositoryORM = new DashboardRepositoryORM();
