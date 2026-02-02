import { poolBanco } from "../db/pool-banco";
import { logger } from "../utils/logger";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export interface ClienteCompletoDB {
  COD_CLI_FOR: number;
  RAZ_CLI_FOR: string | null;
  FAN_CLI_FOR: string | null;
  TIP_CLI_FOR: string | null;
  CGC_CPF: string | null;
  END_CLI_FOR: string | null;
  NUM_END_CLI_FOR: number | null;
  COM_ENDERECO: string | null;
  BAI_CLI_FOR: string | null;
  CEP_CLI_FOR: string | null;
  COD_CIDADE: number | null;
  SIG_ESTADO: string | null;
  TEL_CLI_FOR: string | null;
  FAX_CLI_FOR: string | null;
  CEL_CLI_FOR: string | null;
  END_ELETRONICO: string | null;
  SIT_CLI_FOR: string | null;
  CLI_FOR_AMBOS: string | null;
  NOM_CIDADE: string | null;
}

export interface EmpresaCompletoDB {
  COD_EMPRESA: number;
  NOM_EMPRESA: string | null;
  FAN_EMPRESA: string | null;
  END_EMPRESA: string | null;
  CEP_EMPRESA: string | null;
  BAI_EMPRESA: string | null;
  COD_CIDADE: number;
  SIG_ESTADO: string;
  TEL_EMPRESA: string | null;
  FAX_EMPRESA: string | null;
  CEL_EMPRESA: string | null;
  CGC_EMPRESA: string | null;
  IES_EMPRESA: string | null;
  IMU_EMPRESA: string | null;
  MAI_EMPRESA: string | null;
  WWW_EMPRESA: string | null;
  END_ENTREGA: string | null;
  CEP_ENTREGA: string | null;
  BAI_ENTREGA: string | null;
  COD_CIDADE_ENTREGA: number;
  SIG_ESTADO_ENTREGA: string;
  NOM_CIDADE: string | null;
  NOM_CIDADE_ENTREGA: string | null;
}

export interface TituloReceberCompletoDB {
  COD_EMPRESA: number;
  COD_CLI_FOR: number;
  COD_TIPO_TITULO: string;
  NUM_TITULO: string;
  SEQ_TITULO: number;
  VCT_ORIGINAL: Date | null;
  VLR_ABERTO: number | null;
  VLR_ORIGINAL: number | null;
  SIT_TITULO: string | null;
  DAT_EMISSAO: Date | null;
  DAT_ENTRADA: Date | null;
  COD_REPRESENTANTE: number | null;
  COD_MOEDA: string | null;
  RAZ_CLI_FOR: string | null;
  DES_TIPO_TITULO: string | null;
  DES_REPRESENTANTE: string | null;
  DES_MOEDA: string | null;
}

export interface TituloPagarCompletoDB {
  COD_EMPRESA: number;
  NUM_INTERNO: number;
  NUM_PARCELA: number;
  COD_CLI_FOR: number;
  COD_TIPO_TITULO: string | null;
  NUM_TITULO: string | null;
  NUM_DOCUMENTO: string | null;
  COD_OPERACAO: string | null;
  VCT_ORIGINAL: Date | null;
  VCT_PRORROGADO: Date | null;
  VLR_ABERTO: number | null;
  VLR_ORIGINAL: number | null;
  VLR_DESCONTO: number | null;
  PER_DESCONTO: number | null;
  PER_JUROS_MES: number | null;
  VLR_JUROS_DIA: number | null;
  PER_MULTA: number | null;
  COD_MOEDA: string | null;
  COD_PORTADOR: string | null;
  NUM_TITULO_BANCO: string | null;
  DAT_EMISSAO: Date | null;
  DAT_ENTRADA: Date | null;
  DAT_ULTIMO_PAGAMENTO: Date | null;
  DAT_PROVAVEL_PAGAMENTO: Date | null;
  SIT_TITULO: string | null;
  RAZ_CLI_FOR: string | null;
  DES_TIPO_TITULO: string | null;
  DES_OPERACAO: string | null;
  DES_MOEDA: string | null;
  DES_PORTADOR: string | null;
}

export class DetalhesRepository {
  async obterClienteCompleto(codCliFor: number, empresaConfig: EmpresaConfig): Promise<ClienteCompletoDB> {
    try {
      const query = `
        SELECT 
          c.COD_CLI_FOR, c.RAZ_CLI_FOR, c.FAN_CLI_FOR, c.TIP_CLI_FOR,
          c.CGC_CPF, c.END_CLI_FOR, c.NUM_END_CLI_FOR, c.COM_ENDERECO,
          c.BAI_CLI_FOR, c.CEP_CLI_FOR, c.COD_CIDADE, c.SIG_ESTADO,
          c.TEL_CLI_FOR, c.FAX_CLI_FOR, c.CEL_CLI_FOR, c.END_ELETRONICO,
          c.SIT_CLI_FOR, c.CLI_FOR_AMBOS,
          ci.NOM_CIDADE
        FROM dbo.CLIENTES_FORNECEDORES c
        LEFT JOIN dbo.CIDADES ci ON ci.COD_CIDADE = c.COD_CIDADE
        WHERE c.COD_CLI_FOR = @codCliFor
      `;

      const resultado = await poolBanco.executarConsulta<ClienteCompletoDB>(
        query,
        { codCliFor },
        empresaConfig
      );

      if (!resultado || resultado.length === 0) {
        throw new Error("Cliente não encontrado");
      }

      return resultado[0];
    } catch (erro) {
      logger.error("Erro ao obter cliente completo", erro, { codCliFor });
      throw erro;
    }
  }

  async obterEmpresaCompleto(codEmpresa: number, empresaConfig: EmpresaConfig): Promise<EmpresaCompletoDB> {
    try {
      const query = `
        SELECT 
          e.COD_EMPRESA, e.NOM_EMPRESA, e.FAN_EMPRESA, e.END_EMPRESA,
          e.CEP_EMPRESA, e.BAI_EMPRESA, e.COD_CIDADE, e.SIG_ESTADO,
          e.TEL_EMPRESA, e.FAX_EMPRESA, e.CEL_EMPRESA, e.CGC_EMPRESA,
          e.IES_EMPRESA, e.IMU_EMPRESA, e.MAI_EMPRESA, e.WWW_EMPRESA,
          e.END_ENTREGA, e.CEP_ENTREGA, e.BAI_ENTREGA, e.COD_CIDADE_ENTREGA,
          e.SIG_ESTADO_ENTREGA,
          ci.NOM_CIDADE,
          ce.NOM_CIDADE AS NOM_CIDADE_ENTREGA
        FROM dbo.EMPRESAS e
        LEFT JOIN dbo.CIDADES ci ON ci.COD_CIDADE = e.COD_CIDADE
        LEFT JOIN dbo.CIDADES ce ON ce.COD_CIDADE = e.COD_CIDADE_ENTREGA
        WHERE e.COD_EMPRESA = @codEmpresa
      `;

      const resultado = await poolBanco.executarConsulta<EmpresaCompletoDB>(
        query,
        { codEmpresa },
        empresaConfig
      );

      if (!resultado || resultado.length === 0) {
        throw new Error("Empresa não encontrada");
      }

      return resultado[0];
    } catch (erro) {
      logger.error("Erro ao obter empresa completo", erro, { codEmpresa });
      throw erro;
    }
  }

  async obterTituloReceberCompleto(
    codEmpresa: number,
    codCliFor: number,
    codTipoTitulo: string,
    numTitulo: string,
    seqTitulo: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloReceberCompletoDB> {
    try {
      const query = `
        SELECT 
          t.COD_EMPRESA, t.COD_CLI_FOR, t.COD_TIPO_TITULO, t.NUM_TITULO,
          t.SEQ_TITULO, t.VCT_ORIGINAL, t.VLR_ABERTO, t.VLR_ORIGINAL,
          t.SIT_TITULO, t.DAT_EMISSAO, t.DAT_ENTRADA, t.COD_REPRESENTANTE,
          t.COD_MOEDA,
          c.RAZ_CLI_FOR,
          tt.DES_TIPO_TITULO,
          r.RAZ_REPRESENTANTE AS DES_REPRESENTANTE,
          m.DES_MOEDA
        FROM dbo.TITULOS_RECEBER t
        LEFT JOIN dbo.CLIENTES_FORNECEDORES c ON c.COD_CLI_FOR = t.COD_CLI_FOR
        LEFT JOIN dbo.TIPOS_TITULOS tt ON tt.COD_TIPO_TITULO = t.COD_TIPO_TITULO
        LEFT JOIN dbo.REPRESENTANTES r ON r.COD_REPRESENTANTE = t.COD_REPRESENTANTE
        LEFT JOIN dbo.MOEDAS m ON m.COD_MOEDA = t.COD_MOEDA
        WHERE t.COD_EMPRESA = @codEmpresa
          AND t.COD_CLI_FOR = @codCliFor
          AND t.COD_TIPO_TITULO = @codTipoTitulo
          AND t.NUM_TITULO = @numTitulo
          AND t.SEQ_TITULO = @seqTitulo
      `;

      const resultado = await poolBanco.executarConsulta<TituloReceberCompletoDB>(
        query,
        { codEmpresa, codCliFor, codTipoTitulo, numTitulo, seqTitulo },
        empresaConfig
      );

      if (!resultado || resultado.length === 0) {
        throw new Error("Título a receber não encontrado");
      }

      return resultado[0];
    } catch (erro) {
      logger.error("Erro ao obter título a receber completo", erro, {
        codEmpresa,
        codCliFor,
        codTipoTitulo,
        numTitulo,
        seqTitulo,
      });
      throw erro;
    }
  }

  async obterTituloPagarCompleto(
    codEmpresa: number,
    numInterno: number,
    numParcela: number,
    empresaConfig: EmpresaConfig
  ): Promise<TituloPagarCompletoDB> {
    try {
      const query = `
        SELECT 
          t.COD_EMPRESA, t.NUM_INTERNO, t.NUM_PARCELA, t.COD_CLI_FOR,
          t.COD_TIPO_TITULO, t.NUM_TITULO, t.NUM_DOCUMENTO, t.COD_OPERACAO,
          t.VCT_ORIGINAL, t.VCT_PRORROGADO, t.VLR_ABERTO, t.VLR_ORIGINAL,
          t.VLR_DESCONTO, t.PER_DESCONTO, t.PER_JUROS_MES, t.VLR_JUROS_DIA,
          t.PER_MULTA, t.COD_MOEDA, t.COD_PORTADOR, t.NUM_TITULO_BANCO,
          t.DAT_EMISSAO, t.DAT_ENTRADA, t.DAT_ULTIMO_PAGAMENTO,
          t.DAT_PROVAVEL_PAGAMENTO, t.SIT_TITULO,
          c.RAZ_CLI_FOR,
          tt.DES_TIPO_TITULO,
          op.DES_OPERACAO,
          m.DES_MOEDA,
          p.DES_PORTADOR
        FROM dbo.TITULOS_PAGAR t
        LEFT JOIN dbo.CLIENTES_FORNECEDORES c ON c.COD_CLI_FOR = t.COD_CLI_FOR
        LEFT JOIN dbo.TIPOS_TITULOS tt ON tt.COD_TIPO_TITULO = t.COD_TIPO_TITULO
        LEFT JOIN dbo.OPERACOES op ON op.COD_EMPRESA = t.COD_EMPRESA AND op.COD_OPERACAO = t.COD_OPERACAO
        LEFT JOIN dbo.MOEDAS m ON m.COD_MOEDA = t.COD_MOEDA
        LEFT JOIN dbo.PORTADORES p ON p.COD_EMPRESA = t.COD_EMPRESA AND p.COD_PORTADOR = t.COD_PORTADOR
        WHERE t.COD_EMPRESA = @codEmpresa
          AND t.NUM_INTERNO = @numInterno
          AND t.NUM_PARCELA = @numParcela
      `;

      const resultado = await poolBanco.executarConsulta<TituloPagarCompletoDB>(
        query,
        { codEmpresa, numInterno, numParcela },
        empresaConfig
      );

      if (!resultado || resultado.length === 0) {
        throw new Error("Título a pagar não encontrado");
      }

      return resultado[0];
    } catch (erro) {
      logger.error("Erro ao obter título a pagar completo", erro, {
        codEmpresa,
        numInterno,
        numParcela,
      });
      throw erro;
    }
  }

  async obterProdutoCompleto(codEmpresa: number, codProduto: number, empresaConfig: EmpresaConfig): Promise<ProdutoCompletoDB> {
    try {
      const query = `
        SELECT 
          p.COD_EMPRESA, p.COD_PRODUTO, p.DES_PRODUTO, p.COD_UNIDADE_MEDIDA,
          p.IND_PRODUTO_SERVICO, p.SIT_PRODUTO, p.OBS_PRODUTO,
          p.DAT_CADASTRO, p.DAT_ALTERACAO, p.COD_USUARIO,
          um.DES_UNIDADE_MEDIDA
        FROM dbo.PRODUTOS_SERVICOS p
        LEFT JOIN dbo.UNIDADES_MEDIDA um ON um.COD_UNIDADE_MEDIDA = p.COD_UNIDADE_MEDIDA
        WHERE p.COD_EMPRESA = @codEmpresa
          AND p.COD_PRODUTO = @codProduto
      `;

      const resultado = await poolBanco.executarConsulta<ProdutoCompletoDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );

      if (!resultado || resultado.length === 0) {
        throw new Error("Produto não encontrado");
      }

      return resultado[0];
    } catch (erro) {
      logger.error("Erro ao obter produto completo", erro, { codEmpresa, codProduto });
      throw erro;
    }
  }

  async obterDerivacoesProduto(codEmpresa: number, codProduto: number, empresaConfig: EmpresaConfig): Promise<DerivacaoCompletaDB[]> {
    try {
      const query = `
        SELECT 
          d.COD_EMPRESA, d.COD_PRODUTO, d.COD_DERIVACAO, d.DES_DERIVACAO,
          d.COD_BARRA, d.SIT_DERIVACAO, d.OBS_DERIVACAO,
          d.DAT_CADASTRO, d.DAT_ALTERACAO, d.COD_USUARIO,
          d.VLR_PRECO_CUSTO_ULT_ENT, d.VLR_PRECO_CUSTO_MEDIO
        FROM dbo.DERIVACOES d
        WHERE d.COD_EMPRESA = @codEmpresa
          AND d.COD_PRODUTO = @codProduto
        ORDER BY d.COD_DERIVACAO
      `;

      return await poolBanco.executarConsulta<DerivacaoCompletaDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );
    } catch (erro) {
      logger.error("Erro ao obter derivações do produto", erro, { codEmpresa, codProduto });
      throw erro;
    }
  }

  async obterEstoquesProduto(codEmpresa: number, codProduto: number, empresaConfig: EmpresaConfig): Promise<EstoqueCompletoDB[]> {
    try {
      const query = `
        SELECT 
          e.COD_EMPRESA, e.COD_PRODUTO, e.COD_DEPOSITO, e.COD_DERIVACAO,
          e.QTD_ATUAL, e.QTD_BLOQUEADA, e.QTD_RESERVADA, e.QTD_ORDEM_COMPRA,
          e.QTD_CONSIGNADA_CLI, e.QTD_CONSIGNADA_FOR, e.QTD_IDEAL_REPOSICAO,
          e.QTD_MINIMA_REPOSICAO, e.QTD_MAXIMA_REPOSICAO,
          e.DAT_ULTIMA_ENTRADA, e.DAT_ULTIMA_SAIDA,
          dep.DES_DEPOSITO,
          d.DES_DERIVACAO
        FROM dbo.ESTOQUES e
        LEFT JOIN dbo.DEPOSITOS dep ON dep.COD_DEPOSITO = e.COD_DEPOSITO
        LEFT JOIN dbo.DERIVACOES d ON d.COD_EMPRESA = e.COD_EMPRESA AND d.COD_PRODUTO = e.COD_PRODUTO AND d.COD_DERIVACAO = e.COD_DERIVACAO
        WHERE e.COD_EMPRESA = @codEmpresa
          AND e.COD_PRODUTO = @codProduto
        ORDER BY e.COD_DERIVACAO, e.COD_DEPOSITO
      `;

      return await poolBanco.executarConsulta<EstoqueCompletoDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );
    } catch (erro) {
      logger.error("Erro ao obter estoques do produto", erro, { codEmpresa, codProduto });
      throw erro;
    }
  }

  async obterTabelasPrecoProduto(codEmpresa: number, codProduto: number, empresaConfig: EmpresaConfig): Promise<TabelaPrecoProdutoDB[]> {
    try {
      const query = `
        SELECT DISTINCT
          civ.COD_EMPRESA, civ.COD_TABELA_PRECO, civ.COD_PRODUTO, civ.COD_DERIVACAO,
          v.DAT_INICIAL, v.DAT_FINAL,
          NULL AS VLR_PRECO_UNITARIO,
          v.PER_DESCONTO,
          NULL AS PER_ACRESCIMO,
          tp.DES_TABELA_PRECO,
          d.DES_DERIVACAO
        FROM dbo.CLIENTES_ITENS_VAL_TAB_PR civ
        LEFT JOIN dbo.VALIDADES_TABELAS_PRECOS v ON v.COD_EMPRESA = civ.COD_EMPRESA 
          AND v.COD_TABELA_PRECO = civ.COD_TABELA_PRECO 
          AND v.DAT_INICIAL = civ.DAT_INICIAL
        LEFT JOIN dbo.TABELAS_PRECOS tp ON tp.COD_EMPRESA = civ.COD_EMPRESA 
          AND tp.COD_TABELA_PRECO = civ.COD_TABELA_PRECO
        LEFT JOIN dbo.DERIVACOES d ON d.COD_EMPRESA = civ.COD_EMPRESA 
          AND d.COD_PRODUTO = civ.COD_PRODUTO 
          AND d.COD_DERIVACAO = civ.COD_DERIVACAO
        WHERE civ.COD_EMPRESA = @codEmpresa
          AND civ.COD_PRODUTO = @codProduto
        ORDER BY civ.COD_TABELA_PRECO, civ.COD_DERIVACAO, v.DAT_INICIAL
      `;

      return await poolBanco.executarConsulta<TabelaPrecoProdutoDB>(
        query,
        { codEmpresa, codProduto },
        empresaConfig
      );
    } catch (erro) {
      logger.error("Erro ao obter tabelas de preço do produto", erro, { codEmpresa, codProduto });
      return [];
    }
  }
}

export interface ProdutoCompletoDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  DES_PRODUTO: string | null;
  COD_UNIDADE_MEDIDA: string | null;
  IND_PRODUTO_SERVICO: string | null;
  SIT_PRODUTO: string | null;
  OBS_PRODUTO: string | null;
  DAT_CADASTRO: Date | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
  DES_UNIDADE_MEDIDA: string | null;
}

export interface DerivacaoCompletaDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  COD_DERIVACAO: string;
  DES_DERIVACAO: string | null;
  COD_BARRA: string | null;
  SIT_DERIVACAO: string | null;
  OBS_DERIVACAO: string | null;
  DAT_CADASTRO: Date | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
  VLR_PRECO_CUSTO_ULT_ENT: number | null;
  VLR_PRECO_CUSTO_MEDIO: number | null;
}

export interface EstoqueCompletoDB {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  COD_DEPOSITO: string;
  COD_DERIVACAO: string;
  QTD_ATUAL: number | null;
  QTD_BLOQUEADA: number | null;
  QTD_RESERVADA: number | null;
  QTD_ORDEM_COMPRA: number | null;
  QTD_CONSIGNADA_CLI: number | null;
  QTD_CONSIGNADA_FOR: number | null;
  QTD_IDEAL_REPOSICAO: number | null;
  QTD_MINIMA_REPOSICAO: number | null;
  QTD_MAXIMA_REPOSICAO: number | null;
  DAT_ULTIMA_ENTRADA: Date | null;
  DAT_ULTIMA_SAIDA: Date | null;
  DES_DEPOSITO: string | null;
  DES_DERIVACAO: string | null;
}

export interface TabelaPrecoProdutoDB {
  COD_EMPRESA: number;
  COD_TABELA_PRECO: string;
  COD_PRODUTO: number;
  COD_DERIVACAO: string;
  DAT_INICIAL: Date | null;
  DAT_FINAL: Date | null;
  VLR_PRECO_UNITARIO: number | null;
  PER_DESCONTO: number | null;
  PER_ACRESCIMO: number | null;
  DES_TABELA_PRECO: string | null;
  DES_DERIVACAO: string | null;
}

export const detalhesRepository = new DetalhesRepository();
