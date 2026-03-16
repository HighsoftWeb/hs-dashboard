import { poolBanco } from "../db/pool-banco";
import type { EmpresaConfig } from "../entities/EmpresaConfig";
import { SIT_NF } from "../constants/status-documentos";
import type {
  AgingReceber,
  AgingPagar,
  TendenciaMensal,
  TopCliente,
  TopProduto,
  FunilVendas,
  MetaRealizado,
  ResumoEstoqueAvancado,
  ResumoClientes,
  ProdutoLucro,
  ProdutoParado,
  ClienteInativo,
  IndicadoresCaixa,
  IndicadoresInadimplencia,
  FluxoRecebimentoMensal,
  DespesaPorCentroCusto,
  TopVendedor,
  AlertaGestor,
} from "../tipos/analytics-db";

function formatarDataSql(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export class AnalyticsRepository {
  async obterAgingReceber(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<AgingReceber[]> {
    const query = `
      SELECT 
        CASE 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) < 0 THEN 'Vencido'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 0 AND 30 THEN '0-30 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 31 AND 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 61 AND 90 THEN '61-90 dias'
          ELSE 'Acima de 90 dias'
        END AS faixa,
        COUNT(*) AS quantidade,
        ISNULL(SUM(T.VLR_ABERTO), 0) AS valor
      FROM dbo.TITULOS_RECEBER T
      WHERE T.COD_EMPRESA = @codEmpresa AND T.SIT_TITULO = 'AB' AND T.VLR_ABERTO > 0
      GROUP BY 
        CASE 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) < 0 THEN 'Vencido'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 0 AND 30 THEN '0-30 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 31 AND 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 61 AND 90 THEN '61-90 dias'
          ELSE 'Acima de 90 dias'
        END
      ORDER BY MIN(CASE 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) < 0 THEN 1 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 0 AND 30 THEN 2 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 31 AND 60 THEN 3 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 61 AND 90 THEN 4 
          ELSE 5 
        END)
    `;
    const rows = await poolBanco.executarConsulta<{
      faixa: string;
      quantidade: number;
      valor: number;
    }>(query, { codEmpresa }, empresaConfig);
    return (rows || []).map((r) => ({
      faixa: r.faixa,
      quantidade: Number(r.quantidade) || 0,
      valor: Number(r.valor) || 0,
    }));
  }

  async obterAgingPagar(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<AgingPagar[]> {
    const query = `
      SELECT 
        CASE 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) < 0 THEN 'Vencido'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 0 AND 30 THEN '0-30 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 31 AND 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 61 AND 90 THEN '61-90 dias'
          ELSE 'Acima de 90 dias'
        END AS faixa,
        COUNT(*) AS quantidade,
        ISNULL(SUM(T.VLR_ABERTO), 0) AS valor
      FROM dbo.TITULOS_PAGAR T
      WHERE T.COD_EMPRESA = @codEmpresa AND T.SIT_TITULO = 'AB' AND T.VLR_ABERTO > 0
      GROUP BY 
        CASE 
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) < 0 THEN 'Vencido'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 0 AND 30 THEN '0-30 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 31 AND 60 THEN '31-60 dias'
          WHEN DATEDIFF(DAY, GETDATE(), T.VCT_ORIGINAL) BETWEEN 61 AND 90 THEN '61-90 dias'
          ELSE 'Acima de 90 dias'
        END
    `;
    const rows = await poolBanco.executarConsulta<{
      faixa: string;
      quantidade: number;
      valor: number;
    }>(query, { codEmpresa }, empresaConfig);
    return (rows || []).map((r) => ({
      faixa: r.faixa,
      quantidade: Number(r.quantidade) || 0,
      valor: Number(r.valor) || 0,
    }));
  }

  async obterTendenciaMensal(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TendenciaMensal[]> {
    const resultados: TendenciaMensal[] = [];
    let inicio = new Date(dataInicio + "T00:00:00");
    let fim = new Date(dataFim + "T23:59:59");
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      const hoje = new Date();
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }

    const mesesIterar: { mes: number; ano: number }[] = [];
    const cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    const fimMes = new Date(fim.getFullYear(), fim.getMonth(), 1);

    while (cursor <= fimMes) {
      mesesIterar.push({
        mes: cursor.getMonth() + 1,
        ano: cursor.getFullYear(),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const { mes, ano } of mesesIterar) {
      const dataRef = new Date(ano, mes - 1, 1);

      const query = `
        SELECT 
          ISNULL((SELECT SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)) FROM dbo.TITULOS_RECEBER 
            WHERE COD_EMPRESA = @codEmpresa AND (SIT_TITULO IS NULL OR SIT_TITULO != 'CA')
              AND MONTH(COALESCE(DAT_EMISSAO, VCT_ORIGINAL)) = @mes AND YEAR(COALESCE(DAT_EMISSAO, VCT_ORIGINAL)) = @ano), 0) AS receitas,
          ISNULL((SELECT SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)) FROM dbo.TITULOS_PAGAR 
            WHERE COD_EMPRESA = @codEmpresa AND (SIT_TITULO IS NULL OR SIT_TITULO != 'CA')
              AND MONTH(COALESCE(DAT_EMISSAO, VCT_ORIGINAL)) = @mes AND YEAR(COALESCE(DAT_EMISSAO, VCT_ORIGINAL)) = @ano), 0) AS despesas,
          (SELECT COUNT(*) FROM dbo.ORCAMENTOS_OS 
            WHERE COD_EMPRESA = @codEmpresa
              AND MONTH(DAT_EMISSAO) = @mes AND YEAR(DAT_EMISSAO) = @ano) AS orcamentos,
          (SELECT COUNT(*) FROM dbo.NOTAS_FISCAIS_VENDA 
            WHERE COD_EMPRESA = @codEmpresa AND SIT_NF = @sitNfProcessada
              AND MONTH(DAT_EMISSAO) = @mes AND YEAR(DAT_EMISSAO) = @ano) AS nfVendas
      `;
      const rows = await poolBanco.executarConsulta<{
        receitas: number;
        despesas: number;
        orcamentos: number;
        nfVendas: number;
      }>(
        query,
        { codEmpresa, mes, ano, sitNfProcessada: SIT_NF.PROCESSADA },
        empresaConfig
      );
      const r = rows?.[0];

      const nomesMes = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      resultados.push({
        mes: `${nomesMes[dataRef.getMonth()]}/${ano}`,
        mesAno: `${ano}-${String(mes).padStart(2, "0")}`,
        receitas: Number(r?.receitas) || 0,
        despesas: Number(r?.despesas) || 0,
        lucro: (Number(r?.receitas) || 0) - (Number(r?.despesas) || 0),
        orcamentos: Number(r?.orcamentos) || 0,
        nfVendas: Number(r?.nfVendas) || 0,
      });
    }
    return resultados;
  }

  async obterTopClientes(
    codEmpresa: number,
    limite: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TopCliente[]> {
    const query = `
      SELECT TOP (@limite)
        O.COD_CLI_FOR AS codCliFor,
        ISNULL(C.RAZ_CLI_FOR, 'Cliente') AS razaoSocial,
        SUM(ISNULL(O.VLR_LIQUIDO, 0)) AS valorTotal,
        COUNT(*) AS quantidade
      FROM dbo.ORCAMENTOS_OS O
      LEFT JOIN dbo.CLIENTES_FORNECEDORES C ON C.COD_CLI_FOR = O.COD_CLI_FOR
      WHERE O.COD_EMPRESA = @codEmpresa
        AND O.DAT_EMISSAO >= @dataInicio AND O.DAT_EMISSAO <= @dataFim
        AND (O.SIT_ORCAMENTO_OS IN ('AP', 'PR', 'FP', 'RO') OR O.SIT_ORCAMENTO_OS IS NULL)
      GROUP BY O.COD_CLI_FOR, C.RAZ_CLI_FOR
      ORDER BY valorTotal DESC
    `;
    const rows = await poolBanco.executarConsulta<{
      codCliFor: number;
      razaoSocial: string;
      valorTotal: number;
      quantidade: number;
    }>(query, { codEmpresa, limite, dataInicio, dataFim }, empresaConfig);

    return (rows || []).map((r) => ({
      codCliFor: Number(r.codCliFor),
      razaoSocial: r.razaoSocial || "Cliente",
      valorTotal: Number(r.valorTotal) || 0,
      quantidade: Number(r.quantidade) || 0,
    }));
  }

  async obterTopClientesPorFaturamento(
    codEmpresa: number,
    limite: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TopCliente[]> {
    const query = `
      SELECT TOP (@limite)
        n.COD_CLI_FOR AS codCliFor,
        ISNULL(c.RAZ_CLI_FOR, 'Cliente') AS razaoSocial,
        SUM(ISNULL(n.VLR_LIQUIDO, 0)) AS valorTotal,
        COUNT(*) AS quantidade
      FROM dbo.NOTAS_FISCAIS_VENDA n
      LEFT JOIN dbo.CLIENTES_FORNECEDORES c ON c.COD_CLI_FOR = n.COD_CLI_FOR
      WHERE n.COD_EMPRESA = @codEmpresa
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND n.SIT_NF = @sitNfProcessada
      GROUP BY n.COD_CLI_FOR, c.RAZ_CLI_FOR
      ORDER BY valorTotal DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codCliFor: number;
        razaoSocial: string;
        valorTotal: number;
        quantidade: number;
      }>(
        query,
        {
          codEmpresa,
          limite,
          dataInicio,
          dataFim,
          sitNfProcessada: SIT_NF.PROCESSADA,
        },
        empresaConfig
      );
      const resultado = (rows || []).map((r) => ({
        codCliFor: Number(r.codCliFor),
        razaoSocial: r.razaoSocial || "Cliente",
        valorTotal: Number(r.valorTotal) || 0,
        quantidade: Number(r.quantidade) || 0,
      }));
      if (resultado.length > 0) return resultado;
      return this.obterTopClientes(
        codEmpresa,
        limite,
        dataInicio,
        dataFim,
        empresaConfig
      );
    } catch {
      return this.obterTopClientes(
        codEmpresa,
        limite,
        dataInicio,
        dataFim,
        empresaConfig
      );
    }
  }

  async obterTopProdutosOrcamento(
    codEmpresa: number,
    limite: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TopProduto[]> {
    const query = `
      SELECT TOP (@limite)
        I.COD_PRODUTO AS codProduto,
        ISNULL(P.DES_PRODUTO, 'Produto') AS descricao,
        SUM(ISNULL(I.QTD_PRODUTO, 0)) AS quantidade,
        SUM(ISNULL(I.VLR_TOTAL, 0)) AS valorTotal
      FROM dbo.ITENS_ORCAMENTO_OS I
      INNER JOIN dbo.ORCAMENTOS_OS O ON O.COD_EMPRESA = I.COD_EMPRESA 
        AND O.IND_ORCAMENTO_OS = I.IND_ORCAMENTO_OS AND O.NUM_ORCAMENTO_OS = I.NUM_ORCAMENTO_OS
      LEFT JOIN dbo.PRODUTOS_SERVICOS P ON P.COD_EMPRESA = I.COD_EMPRESA AND P.COD_PRODUTO = I.COD_PRODUTO
      WHERE I.COD_EMPRESA = @codEmpresa
        AND O.DAT_EMISSAO >= @dataInicio AND O.DAT_EMISSAO <= @dataFim
      GROUP BY I.COD_PRODUTO, P.DES_PRODUTO
      ORDER BY quantidade DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codProduto: number;
        descricao: string;
        quantidade: number;
        valorTotal: number;
      }>(query, { codEmpresa, limite, dataInicio, dataFim }, empresaConfig);
      return (rows || []).map((r) => ({
        codProduto: Number(r.codProduto),
        descricao: (r.descricao || "Produto").substring(0, 50),
        quantidade: Number(r.quantidade) || 0,
        valorTotal: Number(r.valorTotal) || 0,
      }));
    } catch {
      return [];
    }
  }

  async obterTopProdutosVenda(
    codEmpresa: number,
    limite: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TopProduto[]> {
    const query = `
      SELECT TOP (@limite)
        i.COD_PRODUTO AS codProduto,
        ISNULL(p.DES_PRODUTO, i.DES_ITEM) AS descricao,
        SUM(i.QTD_FATURADA) AS quantidade,
        SUM(ISNULL(i.VLR_LIQUIDO, 0)) AS valorTotal
      FROM dbo.ITENS_NF_VENDA i
      INNER JOIN dbo.NOTAS_FISCAIS_VENDA n ON n.COD_EMPRESA = i.COD_EMPRESA
        AND n.COD_SERIE_NF_VENDA = i.COD_SERIE_NF_VENDA AND n.NUM_NF_VENDA = i.NUM_NF_VENDA
      LEFT JOIN dbo.PRODUTOS_SERVICOS p ON p.COD_EMPRESA = i.COD_EMPRESA AND p.COD_PRODUTO = i.COD_PRODUTO
      WHERE i.COD_EMPRESA = @codEmpresa AND i.COD_PRODUTO IS NOT NULL
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND n.SIT_NF = @sitNfProcessada
      GROUP BY i.COD_PRODUTO, ISNULL(p.DES_PRODUTO, i.DES_ITEM)
      ORDER BY quantidade DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codProduto: number;
        descricao: string;
        quantidade: number;
        valorTotal: number;
      }>(
        query,
        {
          codEmpresa,
          limite,
          dataInicio,
          dataFim,
          sitNfProcessada: SIT_NF.PROCESSADA,
        },
        empresaConfig
      );
      const resultado = (rows || []).map((r) => ({
        codProduto: Number(r.codProduto),
        descricao: (r.descricao || "Produto").substring(0, 80),
        quantidade: Number(r.quantidade) || 0,
        valorTotal: Number(r.valorTotal) || 0,
      }));
      if (resultado.length > 0) return resultado;
      return this.obterTopProdutosOrcamento(
        codEmpresa,
        limite,
        dataInicio,
        dataFim,
        empresaConfig
      );
    } catch {
      return this.obterTopProdutosOrcamento(
        codEmpresa,
        limite,
        dataInicio,
        dataFim,
        empresaConfig
      );
    }
  }

  async obterFunilVendas(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<FunilVendas[]> {
    const query = `
      SELECT 
        CASE 
          WHEN O.SIT_ORCAMENTO_OS = 'AB' THEN 'Aberto'
          WHEN O.SIT_ORCAMENTO_OS = 'AA' THEN 'Aguardando'
          WHEN O.SIT_ORCAMENTO_OS = 'AP' THEN 'Aprovado'
          WHEN O.SIT_ORCAMENTO_OS = 'PR' THEN 'Processado'
          WHEN O.SIT_ORCAMENTO_OS = 'FP' THEN 'Faturado Parcial'
          WHEN O.SIT_ORCAMENTO_OS = 'RO' THEN 'Romaneio'
          WHEN O.SIT_ORCAMENTO_OS = 'CA' THEN 'Cancelado'
          ELSE ISNULL(O.SIT_ORCAMENTO_OS, 'Outros')
        END AS status,
        COUNT(*) AS quantidade,
        SUM(ISNULL(O.VLR_LIQUIDO, 0)) AS valor
      FROM dbo.ORCAMENTOS_OS O
      WHERE O.COD_EMPRESA = @codEmpresa
        AND O.DAT_EMISSAO >= @dataInicio AND O.DAT_EMISSAO <= @dataFim
      GROUP BY O.SIT_ORCAMENTO_OS
      ORDER BY 
        CASE O.SIT_ORCAMENTO_OS 
          WHEN 'AB' THEN 1 WHEN 'AA' THEN 2 WHEN 'AP' THEN 3 
          WHEN 'PR' THEN 4 WHEN 'FP' THEN 5 WHEN 'RO' THEN 6 
          WHEN 'CA' THEN 99 ELSE 7 
        END
    `;
    const rows = await poolBanco.executarConsulta<{
      status: string;
      quantidade: number;
      valor: number;
    }>(query, { codEmpresa, dataInicio, dataFim }, empresaConfig);
    return (rows || []).map((r) => ({
      status: r.status,
      quantidade: Number(r.quantidade) || 0,
      valor: Number(r.valor) || 0,
    }));
  }

  async obterMetaRealizado(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<MetaRealizado | null> {
    const queryMeta = `
      SELECT TOP 1 VLR_META AS meta FROM dbo.METAS_VENDAS_EMPRESA
      WHERE COD_EMPRESA = @codEmpresa
        AND DAT_INICIAL <= @dataFim AND DAT_FINAL >= @dataInicio
      ORDER BY DAT_INICIAL DESC
    `;
    const metaRows = await poolBanco.executarConsulta<{ meta: number }>(
      queryMeta,
      { codEmpresa, dataInicio, dataFim },
      empresaConfig
    );
    const meta = metaRows?.[0]?.meta ? Number(metaRows[0].meta) : null;
    if (meta == null) return null;

    const queryRealizado = `
      SELECT SUM(ISNULL(VLR_LIQUIDO, 0)) AS realizado
      FROM dbo.ORCAMENTOS_OS
      WHERE COD_EMPRESA = @codEmpresa
        AND DAT_EMISSAO >= @dataInicio AND DAT_EMISSAO <= @dataFim
        AND SIT_ORCAMENTO_OS IN ('AP', 'PR', 'FP', 'RO')
    `;
    const realRows = await poolBanco.executarConsulta<{ realizado: number }>(
      queryRealizado,
      { codEmpresa, dataInicio, dataFim },
      empresaConfig
    );
    const realizado = Number(realRows?.[0]?.realizado) || 0;
    const percentual = meta > 0 ? Math.round((realizado / meta) * 100) : 0;

    return {
      meta,
      realizado,
      percentual,
      periodo: `${dataInicio} a ${dataFim}`,
    };
  }

  async obterResumoEstoqueAvancado(
    codEmpresa: number,
    empresaConfig: EmpresaConfig,
    dataInicio?: string,
    dataFim?: string
  ): Promise<ResumoEstoqueAvancado> {
    const queryValor = `
      SELECT 
        ISNULL(SUM(E.QTD_ATUAL * ISNULL(COALESCE(D.VLR_FINAL_CUSTO_ULT_ENT, D.VLR_PRECO_CUSTO_ULT_ENT, D.VLR_CUSTO_REAL), 0)), 0) AS valorTotalEstoque,
        COUNT(DISTINCT E.COD_PRODUTO) AS totalProdutos
      FROM dbo.ESTOQUES E
      LEFT JOIN dbo.DERIVACOES D ON D.COD_EMPRESA = E.COD_EMPRESA 
        AND D.COD_PRODUTO = E.COD_PRODUTO AND D.COD_DERIVACAO = E.COD_DERIVACAO
      WHERE E.COD_EMPRESA = @codEmpresa AND ISNULL(E.QTD_ATUAL, 0) > 0
    `;
    const queryAbaixoMin = `
      SELECT COUNT(*) AS produtosAbaixoMinimo
      FROM dbo.ESTOQUES E
      WHERE E.COD_EMPRESA = @codEmpresa
        AND E.QTD_MINIMA_REPOSICAO > 0
        AND ISNULL(E.QTD_ATUAL, 0) < E.QTD_MINIMA_REPOSICAO
    `;
    const querySemMov = `
      SELECT COUNT(*) AS produtosSemMovimento90Dias
      FROM dbo.ESTOQUES E
      WHERE E.COD_EMPRESA = @codEmpresa AND ISNULL(E.QTD_ATUAL, 0) > 0
        AND (E.DAT_ULTIMA_SAIDA IS NULL OR E.DAT_ULTIMA_SAIDA < DATEADD(DAY, -90, GETDATE()))
    `;
    const queryDepositos = `
      SELECT 
        E.COD_DEPOSITO AS codDeposito,
        ISNULL(D.DES_DEPOSITO, E.COD_DEPOSITO) AS descricao,
        ISNULL(SUM(E.QTD_ATUAL), 0) AS quantidade
      FROM dbo.ESTOQUES E
      LEFT JOIN dbo.DEPOSITOS D ON D.COD_DEPOSITO = E.COD_DEPOSITO
      WHERE E.COD_EMPRESA = @codEmpresa
      GROUP BY E.COD_DEPOSITO, D.DES_DEPOSITO
      ORDER BY SUM(E.QTD_ATUAL) DESC
    `;

    try {
      const [valorR, abaixoR, semMovR, depositosR] = await Promise.all([
        poolBanco.executarConsulta<{
          valorTotalEstoque: number;
          totalProdutos: number;
        }>(queryValor, { codEmpresa }, empresaConfig),
        poolBanco.executarConsulta<{ produtosAbaixoMinimo: number }>(
          queryAbaixoMin,
          { codEmpresa },
          empresaConfig
        ),
        poolBanco.executarConsulta<{ produtosSemMovimento90Dias: number }>(
          querySemMov,
          { codEmpresa },
          empresaConfig
        ),
        poolBanco.executarConsulta<{
          codDeposito: string;
          descricao: string;
          quantidade: number;
        }>(queryDepositos, { codEmpresa }, empresaConfig),
      ]);

      const v = valorR?.[0];
      const a = abaixoR?.[0];
      const s = semMovR?.[0];

      const hoje = new Date();
      const inicioPadrao =
        dataInicio ??
        formatarDataSql(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1));
      const fimPadrao = dataFim ?? formatarDataSql(new Date());
      const topProdutos = await this.obterTopProdutosOrcamento(
        codEmpresa,
        5,
        inicioPadrao,
        fimPadrao,
        empresaConfig
      );

      return {
        valorTotalEstoque: Number(v?.valorTotalEstoque) || 0,
        totalProdutos: Number(v?.totalProdutos) || 0,
        produtosAbaixoMinimo: Number(a?.produtosAbaixoMinimo) || 0,
        produtosSemMovimento90Dias: Number(s?.produtosSemMovimento90Dias) || 0,
        produtosMaisVendidos: topProdutos,
        depositos: (depositosR || []).map((d) => ({
          codDeposito: d.codDeposito,
          descricao: d.descricao || d.codDeposito,
          quantidade: Number(d.quantidade) || 0,
        })),
      };
    } catch {
      return {
        valorTotalEstoque: 0,
        totalProdutos: 0,
        produtosAbaixoMinimo: 0,
        produtosSemMovimento90Dias: 0,
        produtosMaisVendidos: [],
        depositos: [],
      };
    }
  }

  async obterResumoClientes(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<ResumoClientes> {
    const queryTotal = `
      SELECT COUNT(*) AS total FROM dbo.CLIENTES_FORNECEDORES
      WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')
    `;
    const queryNovos = `
      SELECT COUNT(*) AS clientesNovos FROM dbo.CLIENTES_FORNECEDORES
      WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')
        AND DAT_CADASTRO >= @dataInicio AND DAT_CADASTRO <= @dataFim
    `;
    const queryInadimplentes = `
      SELECT 
        COUNT(DISTINCT T.COD_CLI_FOR) AS inadimplentes,
        ISNULL(SUM(T.VLR_ABERTO), 0) AS valorInadimplente
      FROM dbo.TITULOS_RECEBER T
      WHERE T.COD_EMPRESA = @codEmpresa AND T.SIT_TITULO = 'AB'
        AND T.VCT_ORIGINAL < GETDATE() AND T.VLR_ABERTO > 0
    `;
    const queryPorEstado = `
      SELECT 
        ISNULL(SIG_ESTADO, 'NI') AS estado,
        COUNT(*) AS quantidade
      FROM dbo.CLIENTES_FORNECEDORES
      WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')
      GROUP BY SIG_ESTADO
      ORDER BY quantidade DESC
    `;
    const queryPorTipo = `
      SELECT 
        CASE TIP_CLI_FOR WHEN 'F' THEN 'Pessoa Física' WHEN 'J' THEN 'Pessoa Jurídica' ELSE 'Outros' END AS tipo,
        COUNT(*) AS quantidade
      FROM dbo.CLIENTES_FORNECEDORES
      WHERE SIT_CLI_FOR = 'A' AND CLI_FOR_AMBOS IN ('C', 'A')
      GROUP BY TIP_CLI_FOR
    `;

    try {
      const [totalR, novosR, inadR, estadoR, tipoR] = await Promise.all([
        poolBanco.executarConsulta<{ total: number }>(
          queryTotal,
          {},
          empresaConfig
        ),
        poolBanco.executarConsulta<{ clientesNovos: number }>(
          queryNovos,
          { dataInicio, dataFim },
          empresaConfig
        ),
        poolBanco.executarConsulta<{
          inadimplentes: number;
          valorInadimplente: number;
        }>(queryInadimplentes, { codEmpresa }, empresaConfig),
        poolBanco.executarConsulta<{ estado: string; quantidade: number }>(
          queryPorEstado,
          {},
          empresaConfig
        ),
        poolBanco.executarConsulta<{ tipo: string; quantidade: number }>(
          queryPorTipo,
          {},
          empresaConfig
        ),
      ]);

      return {
        totalClientes: Number(totalR?.[0]?.total) || 0,
        clientesNovosPeriodo: Number(novosR?.[0]?.clientesNovos) || 0,
        inadimplentes: Number(inadR?.[0]?.inadimplentes) || 0,
        valorInadimplente: Number(inadR?.[0]?.valorInadimplente) || 0,
        porEstado: (estadoR || []).map((e) => ({
          estado: e.estado || "NI",
          quantidade: Number(e.quantidade) || 0,
        })),
        porTipo: (tipoR || []).map((t) => ({
          tipo: t.tipo || "Outros",
          quantidade: Number(t.quantidade) || 0,
        })),
      };
    } catch {
      return {
        totalClientes: 0,
        clientesNovosPeriodo: 0,
        inadimplentes: 0,
        valorInadimplente: 0,
        porEstado: [],
        porTipo: [],
      };
    }
  }

  async obterProdutosPorLucro(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    limite: number,
    ordem: "maior" | "menor",
    empresaConfig: EmpresaConfig
  ): Promise<ProdutoLucro[]> {
    const orderDir = ordem === "maior" ? "DESC" : "ASC";
    const query = `
      SELECT TOP (@limite)
        i.COD_PRODUTO AS codProduto,
        ISNULL(P.DES_PRODUTO, i.DES_ITEM) AS descricao,
        SUM(i.QTD_FATURADA) AS quantidade,
        SUM(ISNULL(i.VLR_LIQUIDO, 0)) AS receita,
        SUM(i.QTD_FATURADA * ISNULL(COALESCE(i.VLR_CUSTO_ULT_ENT, i.VLR_PRECO_CUSTO_MEDIO, D.VLR_PRECO_CUSTO_ULT_ENT, D.VLR_CUSTO_REAL), 0)) AS custo,
        SUM(ISNULL(i.VLR_LIQUIDO, 0)) - SUM(i.QTD_FATURADA * ISNULL(COALESCE(i.VLR_CUSTO_ULT_ENT, i.VLR_PRECO_CUSTO_MEDIO, D.VLR_PRECO_CUSTO_ULT_ENT, D.VLR_CUSTO_REAL), 0)) AS lucro
      FROM dbo.ITENS_NF_VENDA i
      INNER JOIN dbo.NOTAS_FISCAIS_VENDA n ON n.COD_EMPRESA = i.COD_EMPRESA
        AND n.COD_SERIE_NF_VENDA = i.COD_SERIE_NF_VENDA AND n.NUM_NF_VENDA = i.NUM_NF_VENDA
      LEFT JOIN dbo.PRODUTOS_SERVICOS P ON P.COD_EMPRESA = i.COD_EMPRESA AND P.COD_PRODUTO = i.COD_PRODUTO
      LEFT JOIN dbo.DERIVACOES D ON D.COD_EMPRESA = i.COD_EMPRESA AND D.COD_PRODUTO = i.COD_PRODUTO
        AND D.COD_DERIVACAO = ISNULL(i.COD_DERIVACAO, ' ')
      WHERE i.COD_EMPRESA = @codEmpresa AND i.COD_PRODUTO IS NOT NULL
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND n.SIT_NF = @sitNfProcessada
      GROUP BY i.COD_PRODUTO, ISNULL(P.DES_PRODUTO, i.DES_ITEM)
      ORDER BY lucro ${orderDir}
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codProduto: number;
        descricao: string;
        quantidade: number;
        receita: number;
        custo: number;
        lucro: number;
      }>(
        query,
        {
          codEmpresa,
          dataInicio,
          dataFim,
          limite,
          sitNfProcessada: SIT_NF.PROCESSADA,
        },
        empresaConfig
      );
      return (rows || []).map((r) => {
        const receita = Number(r.receita) || 0;
        const custo = Number(r.custo) || 0;
        const lucro = Number(r.lucro) || 0;
        const margemPercentual = receita > 0 ? (lucro / receita) * 100 : 0;
        return {
          codProduto: r.codProduto,
          descricao: r.descricao || "",
          quantidade: Number(r.quantidade) || 0,
          receita,
          custo,
          lucro,
          margemPercentual: Math.round(margemPercentual * 100) / 100,
        };
      });
    } catch {
      return [];
    }
  }

  async obterProdutosParados(
    codEmpresa: number,
    diasMinimos: number,
    limite: number,
    empresaConfig: EmpresaConfig
  ): Promise<ProdutoParado[]> {
    const query = `
      WITH ProdutosEstoque AS (
        SELECT
          E.COD_PRODUTO,
          ISNULL(P.DES_PRODUTO, '') AS descricao,
          SUM(E.QTD_ATUAL) AS quantidadeEstoque,
          SUM(E.QTD_ATUAL * ISNULL(COALESCE(D.VLR_FINAL_CUSTO_ULT_ENT, D.VLR_PRECO_CUSTO_ULT_ENT, D.VLR_CUSTO_REAL), 0)) AS valorEstoque,
          MAX(E.DAT_ULTIMA_SAIDA) AS dataUltimaSaida,
          MAX(ISNULL(E.DAT_ULTIMA_SAIDA, E.DAT_ULTIMA_ENTRADA)) AS dataReferencia
        FROM dbo.ESTOQUES E
        LEFT JOIN dbo.PRODUTOS_SERVICOS P ON P.COD_EMPRESA = E.COD_EMPRESA AND P.COD_PRODUTO = E.COD_PRODUTO
        LEFT JOIN dbo.DERIVACOES D ON D.COD_EMPRESA = E.COD_EMPRESA AND D.COD_PRODUTO = E.COD_PRODUTO AND D.COD_DERIVACAO = E.COD_DERIVACAO
        WHERE E.COD_EMPRESA = @codEmpresa AND ISNULL(E.QTD_ATUAL, 0) > 0
        GROUP BY E.COD_PRODUTO, ISNULL(P.DES_PRODUTO, '')
      )
      SELECT TOP (@limite)
        codProduto,
        descricao,
        quantidadeEstoque,
        valorEstoque,
        DATEDIFF(DAY, dataReferencia, GETDATE()) AS diasSemVenda,
        dataUltimaSaida
      FROM ProdutosEstoque
      WHERE dataReferencia IS NULL OR dataReferencia < DATEADD(DAY, -@diasMinimos, GETDATE())
      ORDER BY diasSemVenda DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codProduto: number;
        descricao: string;
        quantidadeEstoque: number;
        valorEstoque: number;
        diasSemVenda: number;
        dataUltimaSaida: string | null;
      }>(query, { codEmpresa, diasMinimos, limite }, empresaConfig);
      return (rows || []).map((r) => ({
        codProduto: r.codProduto,
        descricao: r.descricao || "",
        quantidadeEstoque: Number(r.quantidadeEstoque) || 0,
        valorEstoque: Number(r.valorEstoque) || 0,
        diasSemVenda: Number(r.diasSemVenda) || 0,
        dataUltimaSaida: r.dataUltimaSaida,
      }));
    } catch {
      return [];
    }
  }

  async obterClientesInativos(
    codEmpresa: number,
    diasSemCompra: number,
    limite: number,
    empresaConfig: EmpresaConfig
  ): Promise<ClienteInativo[]> {
    const dataLimite = formatarDataSql(
      new Date(Date.now() - diasSemCompra * 24 * 60 * 60 * 1000)
    );
    const query = `
      WITH UltimaCompra AS (
        SELECT
          n.COD_CLI_FOR,
          MAX(CAST(n.DAT_EMISSAO AS DATE)) AS dataUltimaCompra,
          SUM(n.VLR_LIQUIDO) AS valorUltimoAno
        FROM dbo.NOTAS_FISCAIS_VENDA n
        WHERE n.COD_EMPRESA = @codEmpresa
          AND n.SIT_NF = @sitNfProcessada
          AND CAST(n.DAT_EMISSAO AS DATE) >= DATEADD(YEAR, -1, GETDATE())
        GROUP BY n.COD_CLI_FOR
      )
      SELECT TOP (@limite)
        u.COD_CLI_FOR AS codCliFor,
        ISNULL(c.RAZ_CLI_FOR, '') AS razaoSocial,
        ISNULL(u.valorUltimoAno, 0) AS valorUltimoAno,
        u.dataUltimaCompra,
        DATEDIFF(DAY, u.dataUltimaCompra, GETDATE()) AS diasSemCompra
      FROM UltimaCompra u
      INNER JOIN dbo.CLIENTES_FORNECEDORES c ON c.COD_CLI_FOR = u.COD_CLI_FOR AND c.SIT_CLI_FOR = 'A'
      WHERE u.dataUltimaCompra < @dataLimite
      ORDER BY u.valorUltimoAno DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codCliFor: number;
        razaoSocial: string;
        valorUltimoAno: number;
        dataUltimaCompra: string | null;
        diasSemCompra: number;
      }>(
        query,
        { codEmpresa, dataLimite, limite, sitNfProcessada: SIT_NF.PROCESSADA },
        empresaConfig
      );
      return (rows || []).map((r) => ({
        codCliFor: r.codCliFor,
        razaoSocial: r.razaoSocial || "",
        valorUltimoAno: Number(r.valorUltimoAno) || 0,
        dataUltimaCompra: r.dataUltimaCompra,
        diasSemCompra: Number(r.diasSemCompra) || 0,
      }));
    } catch {
      return [];
    }
  }

  async obterIndicadoresCaixa(
    codEmpresa: number,
    empresaConfig: EmpresaConfig,
    dataInicio?: string,
    dataFim?: string
  ): Promise<IndicadoresCaixa> {
    const hoje = new Date();
    const mesAtual =
      dataInicio && dataFim
        ? (() => {
            const d = new Date(dataInicio + "T00:00:00");
            return !isNaN(d.getTime())
              ? { mes: d.getMonth() + 1, ano: d.getFullYear() }
              : { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() };
          })()
        : { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() };
    const mesAnt = new Date(mesAtual.ano, mesAtual.mes - 2, 1);
    const mesAnterior = {
      mes: mesAnt.getMonth() + 1,
      ano: mesAnt.getFullYear(),
    };
    const query = `
      SELECT
        (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_RECEBER
          WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB'
          AND MONTH(VCT_ORIGINAL) = @mesAtual AND YEAR(VCT_ORIGINAL) = @anoAtual) AS receitasMesAtual,
        (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_PAGAR
          WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB'
          AND MONTH(VCT_ORIGINAL) = @mesAtual AND YEAR(VCT_ORIGINAL) = @anoAtual) AS despesasMesAtual,
        (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_RECEBER
          WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB'
          AND MONTH(VCT_ORIGINAL) = @mesAnt AND YEAR(VCT_ORIGINAL) = @anoAnt) AS receitasMesAnterior,
        (SELECT ISNULL(SUM(VLR_ABERTO), 0) FROM dbo.TITULOS_PAGAR
          WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB'
          AND MONTH(VCT_ORIGINAL) = @mesAnt AND YEAR(VCT_ORIGINAL) = @anoAnt) AS despesasMesAnterior
    `;
    try {
      const r = await poolBanco.executarConsulta<{
        receitasMesAtual: number;
        despesasMesAtual: number;
        receitasMesAnterior: number;
        despesasMesAnterior: number;
      }>(
        query,
        {
          codEmpresa,
          mesAtual: mesAtual.mes,
          anoAtual: mesAtual.ano,
          mesAnt: mesAnterior.mes,
          anoAnt: mesAnterior.ano,
        },
        empresaConfig
      );
      const row = r?.[0];
      const receitasAtual = Number(row?.receitasMesAtual) || 0;
      const despesasAtual = Number(row?.despesasMesAtual) || 0;
      const receitasAnterior = Number(row?.receitasMesAnterior) || 0;
      const despesasAnterior = Number(row?.despesasMesAnterior) || 0;
      const saldoAtual = receitasAtual - despesasAtual;
      const saldoAnterior = receitasAnterior - despesasAnterior;
      let variacaoPercentual = 0;
      if (saldoAnterior !== 0) {
        variacaoPercentual =
          ((saldoAtual - saldoAnterior) / Math.abs(saldoAnterior)) * 100;
      } else if (saldoAtual !== 0) {
        variacaoPercentual = saldoAtual > 0 ? 100 : -100;
      }
      let tendencia: "subindo" | "descendo" | "estavel" = "estavel";
      if (variacaoPercentual > 5) tendencia = "subindo";
      else if (variacaoPercentual < -5) tendencia = "descendo";
      return {
        receitasMesAtual: receitasAtual,
        despesasMesAtual: despesasAtual,
        saldoMesAtual: saldoAtual,
        receitasMesAnterior: receitasAnterior,
        despesasMesAnterior: despesasAnterior,
        saldoMesAnterior: saldoAnterior,
        variacaoPercentual: Math.round(variacaoPercentual * 100) / 100,
        tendencia,
      };
    } catch {
      return {
        receitasMesAtual: 0,
        despesasMesAtual: 0,
        saldoMesAtual: 0,
        receitasMesAnterior: 0,
        despesasMesAnterior: 0,
        saldoMesAnterior: 0,
        variacaoPercentual: 0,
        tendencia: "estavel",
      };
    }
  }

  async obterIndicadoresInadimplencia(
    codEmpresa: number,
    empresaConfig: EmpresaConfig
  ): Promise<IndicadoresInadimplencia> {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    const query = `
      SELECT
        ISNULL(SUM(VLR_ABERTO), 0) AS valorTotalReceber,
        ISNULL(SUM(CASE WHEN VCT_ORIGINAL < GETDATE() THEN VLR_ABERTO ELSE 0 END), 0) AS valorVencido,
        ISNULL(SUM(CASE WHEN VCT_ORIGINAL >= GETDATE() THEN VLR_ABERTO ELSE 0 END), 0) AS valorEmDia,
        SUM(CASE WHEN VCT_ORIGINAL < GETDATE() AND VLR_ABERTO > 0 THEN 1 ELSE 0 END) AS quantidadeTitulosVencidos,
        (SELECT COUNT(DISTINCT COD_CLI_FOR) FROM dbo.TITULOS_RECEBER
          WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB'
          AND VCT_ORIGINAL < GETDATE() AND VLR_ABERTO > 0) AS quantidadeClientesInadimplentes,
        (SELECT ISNULL(SUM(ISNULL(VLR_ORIGINAL, VLR_ABERTO)), 0)
           FROM dbo.TITULOS_RECEBER
           WHERE COD_EMPRESA = @codEmpresa
             AND CAST(DAT_EMISSAO AS DATE) >= CAST(@dataInicioMes AS DATE)
             AND CAST(DAT_EMISSAO AS DATE) <= CAST(@dataFimMes AS DATE)
        ) AS valorTotalMes,
        (SELECT ISNULL(SUM(VLR_ABERTO), 0)
           FROM dbo.TITULOS_RECEBER
           WHERE COD_EMPRESA = @codEmpresa
             AND SIT_TITULO = 'AB'
             AND VCT_ORIGINAL < GETDATE()
             AND CAST(DAT_EMISSAO AS DATE) >= CAST(@dataInicioMes AS DATE)
             AND CAST(DAT_EMISSAO AS DATE) <= CAST(@dataFimMes AS DATE)
        ) AS valorVencidoMes
      FROM dbo.TITULOS_RECEBER
      WHERE COD_EMPRESA = @codEmpresa AND SIT_TITULO = 'AB' AND VLR_ABERTO > 0
    `;
    try {
      const r = await poolBanco.executarConsulta<{
        valorTotalReceber: number;
        valorVencido: number;
        valorEmDia: number;
        quantidadeTitulosVencidos: number;
        quantidadeClientesInadimplentes: number;
        valorTotalMes: number;
        valorVencidoMes: number;
      }>(
        query,
        { codEmpresa, dataInicioMes: inicioMes, dataFimMes: fimMes },
        empresaConfig
      );
      const row = r?.[0];
      const valorTotal = Number(row?.valorTotalReceber) || 0;
      const valorVencido = Number(row?.valorVencido) || 0;
      const valorEmDia = Number(row?.valorEmDia) || 0;
      const valorTotalMes = Number(row?.valorTotalMes) || 0;
      const valorVencidoMes = Number(row?.valorVencidoMes) || 0;
      const basePercentual =
        valorTotalMes > 0
          ? valorTotalMes
          : valorEmDia > 0
            ? valorEmDia
            : valorTotal;
      const percentual =
        basePercentual > 0 ? (valorVencidoMes / basePercentual) * 100 : 0;
      return {
        valorTotalReceber: valorTotal,
        valorVencido,
        percentualInadimplencia: Math.round(percentual * 100) / 100,
        quantidadeTitulosVencidos: Number(row?.quantidadeTitulosVencidos) || 0,
        quantidadeClientesInadimplentes:
          Number(row?.quantidadeClientesInadimplentes) || 0,
      };
    } catch {
      return {
        valorTotalReceber: 0,
        valorVencido: 0,
        percentualInadimplencia: 0,
        quantidadeTitulosVencidos: 0,
        quantidadeClientesInadimplentes: 0,
      };
    }
  }

  async obterFluxoRecebimentoMensal(
    codEmpresa: number,
    meses: number,
    empresaConfig: EmpresaConfig,
    dataInicio?: string,
    dataFim?: string
  ): Promise<FluxoRecebimentoMensal[]> {
    const usarPeriodo =
      dataInicio &&
      dataFim &&
      !isNaN(new Date(dataInicio).getTime()) &&
      !isNaN(new Date(dataFim).getTime());

    const query = usarPeriodo
      ? `
      SELECT
        MONTH(T.VCT_ORIGINAL) AS mes,
        YEAR(T.VCT_ORIGINAL) AS ano,
        SUM(T.VLR_ABERTO) AS valor,
        COUNT(*) AS quantidade
      FROM dbo.TITULOS_RECEBER T
      WHERE T.COD_EMPRESA = @codEmpresa AND T.SIT_TITULO = 'AB' AND T.VLR_ABERTO > 0
        AND T.VCT_ORIGINAL >= CAST(@dataInicio AS DATE)
        AND T.VCT_ORIGINAL <= CAST(@dataFim AS DATE)
      GROUP BY MONTH(T.VCT_ORIGINAL), YEAR(T.VCT_ORIGINAL)
      ORDER BY ano, mes
    `
      : `
      SELECT
        MONTH(T.VCT_ORIGINAL) AS mes,
        YEAR(T.VCT_ORIGINAL) AS ano,
        SUM(T.VLR_ABERTO) AS valor,
        COUNT(*) AS quantidade
      FROM dbo.TITULOS_RECEBER T
      WHERE T.COD_EMPRESA = @codEmpresa AND T.SIT_TITULO = 'AB' AND T.VLR_ABERTO > 0
        AND T.VCT_ORIGINAL >= CAST(GETDATE() AS DATE)
        AND T.VCT_ORIGINAL < DATEADD(MONTH, @meses, GETDATE())
      GROUP BY MONTH(T.VCT_ORIGINAL), YEAR(T.VCT_ORIGINAL)
      ORDER BY ano, mes
    `;
    const nomesMes = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    try {
      const rows = await poolBanco.executarConsulta<{
        mes: number;
        ano: number;
        valor: number;
        quantidade: number;
      }>(
        query,
        usarPeriodo
          ? { codEmpresa, dataInicio, dataFim }
          : { codEmpresa, meses },
        empresaConfig
      );
      return (rows || []).map((r) => ({
        mes: `${r.ano}-${String(r.mes).padStart(2, "0")}`,
        mesAno: `${nomesMes[r.mes - 1]}/${r.ano}`,
        valor: Number(r.valor) || 0,
        quantidade: Number(r.quantidade) || 0,
      }));
    } catch {
      return [];
    }
  }

  async obterIndicadoresProduto(
    codEmpresa: number,
    codProduto: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<{
    faturamento: number;
    quantidadeVendida: number;
    custoTotal: number;
    lucroTotal: number;
    margemPercentual: number;
  }> {
    const query = `
      SELECT
        ISNULL(SUM(i.QTD_FATURADA), 0) AS quantidadeVendida,
        ISNULL(SUM(ISNULL(i.VLR_LIQUIDO, 0)), 0) AS faturamento,
        ISNULL(SUM(i.QTD_FATURADA * ISNULL(COALESCE(i.VLR_CUSTO_ULT_ENT, i.VLR_PRECO_CUSTO_MEDIO, d.VLR_PRECO_CUSTO_ULT_ENT, d.VLR_CUSTO_REAL), 0)), 0) AS custoTotal
      FROM dbo.ITENS_NF_VENDA i
      INNER JOIN dbo.NOTAS_FISCAIS_VENDA n ON n.COD_EMPRESA = i.COD_EMPRESA
        AND n.COD_SERIE_NF_VENDA = i.COD_SERIE_NF_VENDA AND n.NUM_NF_VENDA = i.NUM_NF_VENDA
      LEFT JOIN dbo.DERIVACOES d ON d.COD_EMPRESA = i.COD_EMPRESA
        AND d.COD_PRODUTO = i.COD_PRODUTO AND d.COD_DERIVACAO = ISNULL(i.COD_DERIVACAO, ' ')
      WHERE
        i.COD_EMPRESA = @codEmpresa
        AND i.COD_PRODUTO = @codProduto
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio
        AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND n.SIT_NF = @sitNfProcessada
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        quantidadeVendida: number;
        faturamento: number;
        custoTotal: number;
      }>(
        query,
        {
          codEmpresa,
          codProduto,
          dataInicio,
          dataFim,
          sitNfProcessada: SIT_NF.PROCESSADA,
        },
        empresaConfig
      );
      const r = rows?.[0];
      const faturamento = Number(r?.faturamento) || 0;
      const custoTotal = Number(r?.custoTotal) || 0;
      const quantidadeVendida = Number(r?.quantidadeVendida) || 0;
      const lucroTotal = faturamento - custoTotal;
      const margemPercentual =
        faturamento > 0
          ? Math.round((lucroTotal / faturamento) * 100 * 100) / 100
          : 0;
      return {
        faturamento,
        quantidadeVendida,
        custoTotal,
        lucroTotal,
        margemPercentual,
      };
    } catch {
      return {
        faturamento: 0,
        quantidadeVendida: 0,
        custoTotal: 0,
        lucroTotal: 0,
        margemPercentual: 0,
      };
    }
  }

  async obterHistoricoComprasMateriasProduto(
    codEmpresa: number,
    codProduto: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<
    {
      codMateriaPrima: number;
      descricao: string;
      historico: { data: string; precoUnitario: number }[];
    }[]
  > {
    const query = `
      SELECT
        mp.COD_PRODUTO_MATERIA AS codMateriaPrima,
        ISNULL(p.DES_PRODUTO, 'Matéria-prima') AS descricao,
        CAST(n.DAT_EMISSAO AS DATE) AS dataCompra,
        ISNULL(i.VLR_LIQUIDO, 0) / NULLIF(i.QTD_ENTRADA, 0) AS precoUnitario
      FROM dbo.MATERIAS_PRIMAS_PRODUTO mp
      INNER JOIN dbo.ITENS_NF_COMPRA i
        ON i.COD_EMPRESA = mp.COD_EMPRESA
        AND i.COD_PRODUTO = mp.COD_PRODUTO_MATERIA
      INNER JOIN dbo.NOTAS_FISCAIS_COMPRA n
        ON n.COD_EMPRESA = i.COD_EMPRESA
        AND n.COD_SERIE_NF_COMPRA = i.COD_SERIE_NF_COMPRA
        AND n.NUM_NF_COMPRA = i.NUM_NF_COMPRA
      LEFT JOIN dbo.PRODUTOS_SERVICOS p
        ON p.COD_EMPRESA = mp.COD_EMPRESA AND p.COD_PRODUTO = mp.COD_PRODUTO_MATERIA
      WHERE
        mp.COD_EMPRESA = @codEmpresa
        AND mp.COD_PRODUTO = @codProduto
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio
        AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND i.QTD_ENTRADA > 0
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codMateriaPrima: number;
        descricao: string;
        dataCompra: string;
        precoUnitario: number;
      }>(query, { codEmpresa, codProduto, dataInicio, dataFim }, empresaConfig);
      const agrupado = new Map<
        number,
        {
          codMateriaPrima: number;
          descricao: string;
          historico: { data: string; precoUnitario: number }[];
        }
      >();
      for (const r of rows || []) {
        const cod = Number(r.codMateriaPrima);
        const existente = agrupado.get(cod) ?? {
          codMateriaPrima: cod,
          descricao: r.descricao || "Matéria-prima",
          historico: [],
        };
        existente.historico.push({
          data: r.dataCompra,
          precoUnitario: Number(r.precoUnitario) || 0,
        });
        agrupado.set(cod, existente);
      }
      return Array.from(agrupado.values()).map((m) => ({
        ...m,
        historico: m.historico.sort((a, b) => a.data.localeCompare(b.data)),
      }));
    } catch {
      return [];
    }
  }

  async obterDespesasPorCentroCusto(
    codEmpresa: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<DespesaPorCentroCusto[]> {
    const query = `
      SELECT 
        ISNULL(CC.DES_CENTRO_CUSTO, 'Outros') AS centroCusto,
        ISNULL(SUM(T.VLR_ABERTO), 0) AS valor
      FROM dbo.TITULOS_PAGAR T
      LEFT JOIN dbo.CENTROS_CUSTO CC 
        ON CC.COD_CENTRO_CUSTO = T.COD_CENTRO_CUSTO
      WHERE 
        T.COD_EMPRESA = @codEmpresa
        AND T.SIT_TITULO IN ('AB', 'LI')
        AND CAST(T.VCT_ORIGINAL AS DATE) >= CAST(@dataInicio AS DATE)
        AND CAST(T.VCT_ORIGINAL AS DATE) <= CAST(@dataFim AS DATE)
      GROUP BY ISNULL(CC.DES_CENTRO_CUSTO, 'Outros')
      ORDER BY valor DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        centroCusto: string;
        valor: number;
      }>(query, { codEmpresa, dataInicio, dataFim }, empresaConfig);
      return (rows || []).map((r) => ({
        centroCusto: r.centroCusto || "Outros",
        valor: Number(r.valor) || 0,
      }));
    } catch {
      return [];
    }
  }

  async obterTopVendedores(
    codEmpresa: number,
    limite: number,
    dataInicio: string,
    dataFim: string,
    empresaConfig: EmpresaConfig
  ): Promise<TopVendedor[]> {
    const query = `
      SELECT TOP (@limite)
        n.COD_REPRESENTANTE AS codRepresentante,
        ISNULL(r.RAZ_REPRESENTANTE, 'Representante') AS nome,
        SUM(ISNULL(n.VLR_LIQUIDO, 0)) AS valorTotal,
        COUNT(*) AS quantidade
      FROM dbo.NOTAS_FISCAIS_VENDA n
      LEFT JOIN dbo.REPRESENTANTES r 
        ON r.COD_REPRESENTANTE = n.COD_REPRESENTANTE
      WHERE 
        n.COD_EMPRESA = @codEmpresa
        AND CAST(n.DAT_EMISSAO AS DATE) >= @dataInicio
        AND CAST(n.DAT_EMISSAO AS DATE) <= @dataFim
        AND (n.SIT_NF IS NULL OR n.SIT_NF != 'CA')
        AND n.COD_REPRESENTANTE IS NOT NULL
      GROUP BY n.COD_REPRESENTANTE, r.RAZ_REPRESENTANTE
      ORDER BY valorTotal DESC
    `;
    try {
      const rows = await poolBanco.executarConsulta<{
        codRepresentante: number;
        nome: string;
        valorTotal: number;
        quantidade: number;
      }>(
        query,
        {
          codEmpresa,
          limite,
          dataInicio,
          dataFim,
        },
        empresaConfig
      );

      console.log("aqui", rows);
      return (rows || []).map((r) => ({
        codRepresentante: Number(r.codRepresentante),
        nome: r.nome || "Representante",
        valorTotal: Number(r.valorTotal) || 0,
        quantidade: Number(r.quantidade) || 0,
      }));
    } catch {
      return [];
    }
  }

  derivarAlertasGestor(params: {
    indicadoresInadimplencia?: IndicadoresInadimplencia;
    despesasPorCentroCusto?: DespesaPorCentroCusto[];
    produtosPrejuizo?: ProdutoLucro[];
  }): AlertaGestor[] {
    const alertas: AlertaGestor[] = [];

    const inad = params.indicadoresInadimplencia;
    if (inad && inad.percentualInadimplencia > 0) {
      const severidade: "info" | "warning" | "error" =
        inad.percentualInadimplencia > 20
          ? "error"
          : inad.percentualInadimplencia > 10
            ? "warning"
            : "info";
      alertas.push({
        tipo: "inadimplencia",
        mensagem: `Inadimplência em ${inad.percentualInadimplencia.toFixed(
          1
        )}% com ${inad.quantidadeClientesInadimplentes} clientes inadimplentes`,
        severidade,
      });
    }

    const despesas = params.despesasPorCentroCusto || [];
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    if (totalDespesas > 0 && despesas.length > 0) {
      const maior = despesas[0];
      const perc = (maior.valor / totalDespesas) * 100;
      if (perc > 60) {
        alertas.push({
          tipo: "despesas_centro_custo",
          mensagem: `Despesas concentradas em ${
            maior.centroCusto
          } (${perc.toFixed(1)}% do total)`,
          severidade: perc > 75 ? "error" : "warning",
        });
      }
    }

    const produtosPrejuizo = (params.produtosPrejuizo || []).filter(
      (p) => p.lucro < 0
    );
    if (produtosPrejuizo.length > 0) {
      alertas.push({
        tipo: "produtos_prejuizo",
        mensagem: `${produtosPrejuizo.length} produtos com prejuízo no período`,
        severidade: "warning",
      });
    }

    return alertas;
  }
}

export const analyticsRepository = new AnalyticsRepository();
