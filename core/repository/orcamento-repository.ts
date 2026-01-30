import { poolBanco } from "../db/pool-banco";
import { logger } from "../utils/logger";

export interface OrcamentoCompletoDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_CLI_FOR: number;
  COD_SERIE_ORC_OS: string;
  NUM_DOCUMENTO: string | null;
  COD_TIPO_TITULO: string | null;
  COD_CONDICAO_PAG: string | null;
  COD_REPRESENTANTE: number | null;
  COD_OPERACAO: string | null;
  DAT_EMISSAO: Date | null;
  NUM_PEDIDO_CLIENTE: string | null;
  HOR_EMISSAO: Date | null;
  NUM_PLACA_VEICULO: string | null;
  VLR_FRETE: number | null;
  CIF_FOB: string | null;
  VLR_SEGURO: number | null;
  VLR_OUTROS: number | null;
  PER_DESCONTO: number | null;
  VLR_DESCONTO: number | null;
  VLR_BASE_IPI: number | null;
  VLR_IPI: number | null;
  VLR_BASE_ICMS: number | null;
  VLR_ISENTAS_IPI: number | null;
  VLR_ICMS: number | null;
  VLR_OUTRAS_IPI: number | null;
  VLR_BASE_ICMS_SUB_DEST: number | null;
  VLR_ICMS_SUB_DEST: number | null;
  VLR_BASE_ISS: number | null;
  VLR_ISENTAS_ICMS: number | null;
  VLR_OUTRAS_ICMS: number | null;
  VLR_ISS: number | null;
  VLR_PRODUTOS: number | null;
  VLR_SERVICOS: number | null;
  VLR_LIQUIDO: number | null;
  SIT_ORCAMENTO_OS: string | null;
  DAT_GERACAO: Date | null;
  VLR_BASE_IRRF: number | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
  VLR_IRRF: number | null;
  DAT_PREVISAO: Date | null;
  VLR_BRUTO: number | null;
  HOR_PREVISAO: Date | null;
  COD_TRANS_REDESPACHO: number | null;
  COD_TRANSPORTADORA: number | null;
  QTD_DIAS_VALIDADE: number | null;
  PES_BRUTO: number | null;
  PES_LIQUIDO: number | null;
  RAZ_CLI_FOR: string | null;
  DES_REPRESENTANTE: string | null;
  DES_CONDICAO_PAG: string | null;
  DES_TIPO_TITULO: string | null;
  DES_OPERACAO: string | null;
  DES_TRANSPORTADORA: string | null;
  NOM_USUARIO: string | null;
  NOM_CIDADE_CLIENTE: string | null;
  SIG_ESTADO_CLIENTE: string | null;
}

export interface ItemOrcamentoDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  SEQ_ITEM_ORCAMENTO_OS: number;
  COD_SERIE_ORC_OS: string;
  COD_PRODUTO: number | null;
  IND_PRODUTO_SERVICO: string | null;
  COD_DERIVACAO: string | null;
  COD_DEPOSITO: string | null;
  DES_ITEM: string | null;
  IND_RESERVA_ESTOQUE: string;
  QTD_PEDIDA: number | null;
  QTD_FATURADA: number | null;
  QTD_CANCELADA: number | null;
  QTD_ABERTO: number | null;
  COD_UNIDADE_MEDIDA: string;
  COD_TABELA_PRECO: string | null;
  VLR_PRECO_UNITARIO: number | null;
  PER_IPI: number | null;
  COD_SITUACAO_TRIBUTARIA: string | null;
  VLR_IPI: number | null;
  VLR_BASE_IPI: number | null;
  PER_ICMS: number | null;
  VLR_ISENTAS_IPI: number | null;
  VLR_BASE_ICMS: number | null;
  VLR_OUTRAS_IPI: number | null;
  VLR_ICMS: number | null;
  VLR_BASE_ICMS_SUB_DEST: number | null;
  VLR_ICMS_SUB_DEST: number | null;
  PER_COMISSAO_FAT: number | null;
  VLR_ISENTAS_ICMS: number | null;
  PER_COMISSAO_REC: number | null;
  VLR_OUTRAS_ICMS: number | null;
  DAT_ENTREGA: Date | null;
  VLR_BRUTO: number | null;
  PER_DESCONTO_ACRESCIMO: number | null;
  COD_REP_PREST_SERV: number | null;
  VLR_BASE_ISS: number | null;
  VLR_DESCONTO_ACRESCIMO: number | null;
  PER_COMISSAO_PREST_SERV: number | null;
  HOR_ENTREGA: Date | null;
  VLR_LIQUIDO: number | null;
  VLR_BASE_IRRF: number | null;
  SIT_ITEM: string | null;
  VLR_IRRF: number | null;
  DAT_VENCIMENTO_GARANTIA: Date | null;
  NUM_SERIE_PRODUTO: string | null;
  PES_BRUTO: number | null;
  PES_LIQUIDO: number | null;
  TIP_ITEM: string | null;
  OBS_ITEM: string | null;
  DES_PRODUTO: string | null;
  DES_UNIDADE_MEDIDA: string | null;
  DES_TABELA_PRECO: string | null;
  DES_DEPOSITO: string | null;
  DES_REP_PREST_SERV: string | null;
}

export interface ItemApontamentoOSDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_SERIE_ORC_OS: string;
  SEQ_ITEM_ORCAMENTO_OS: number;
  SEQ_APONTAMENTO_OS: number;
  COD_REPRESENTANTE: number;
  HORA_INICIO: Date | null;
  HORA_TERMINO: Date | null;
  DES_REPRESENTANTE: string | null;
}

export interface ItemReceituarioDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  SEQ_ITEM_ORCAMENTO_OS: number;
  COD_SERIE_ORC_OS: string;
  COD_LABORATORIO: number | null;
  COD_PROFISSIONAL: number | null;
  DAT_RECEITA: Date | null;
  PRE_ENTREGA: Date | null;
  TIP_LENTE: string | null;
  LON_OD_ESF: number | null;
  LON_OE_ESF: number | null;
  LON_OD_CIL: number | null;
  LON_OE_CIL: number | null;
  LON_OD_EIXO: number | null;
  LON_OE_EIXO: number | null;
  LON_OD_DNP: number | null;
  LON_OE_DNP: number | null;
  LON_OD_ALT: number | null;
  LON_OE_ALT: number | null;
  PER_OD_ESF: number | null;
  PER_OE_ESF: number | null;
  PER_OD_CIL: number | null;
  PER_OE_CIL: number | null;
  PER_OD_EIXO: number | null;
  PER_OE_EIXO: number | null;
  PER_OD_DNP: number | null;
  PER_OE_DNP: number | null;
  PER_OD_ALT: number | null;
  PER_OE_ALT: number | null;
  OBS_RECEITA: string | null;
  VLR_TRATAMENTO: number | null;
  MUL_ADICAO: number | null;
  COD_USUARIO_ENVIO_LAB: number | null;
  COD_USUARIO_RETORNO_LAB: number | null;
  COD_USUARIO_ENTREGA: number | null;
  DAT_ENVIO_LAB: Date | null;
  DAT_RETORNO_LAB: Date | null;
  DAT_ENTREGA: Date | null;
  COD_TIPO_LENTE: number | null;
  DES_TIP_ARMACAO: string | null;
}

export interface ItemTrocaOrcamentoDB {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_PRODUTO: number | null;
  COD_SERIE_ORC_OS: string;
  SEQ_ITEM_TROCA: number;
  COD_DEPOSITO: string | null;
  COD_DERIVACAO: string | null;
  DES_ITEM: string | null;
  QTD_TROCADA: number | null;
  COD_UNIDADE_MEDIDA: string | null;
  COD_TABELA_PRECO: string | null;
  VLR_PRECO_UNITARIO: number | null;
  VLR_BRUTO: number | null;
  PER_DESCONTO: number | null;
  VLR_LIQUIDO: number | null;
  SEQ_TROCA: number | null;
  COD_USUARIO: number | null;
  DAT_TROCA: Date | null;
  DES_PRODUTO: string | null;
  DES_UNIDADE_MEDIDA: string | null;
  DES_TABELA_PRECO: string | null;
  DES_DEPOSITO: string | null;
  NOM_USUARIO: string | null;
}

export class OrcamentoRepository {
  async obterOrcamentoCompleto(
    codEmpresa: number,
    indOrcamentoOS: string,
    numOrcamentoOS: number
  ): Promise<{ orcamento: OrcamentoCompletoDB; itens: ItemOrcamentoDB[] }> {
    try {
      const queryOrcamento = `
        SELECT 
          o.COD_EMPRESA, o.IND_ORCAMENTO_OS, o.NUM_ORCAMENTO_OS,
          o.COD_CLI_FOR, o.COD_SERIE_ORC_OS, o.NUM_DOCUMENTO,
          o.COD_TIPO_TITULO, o.COD_CONDICAO_PAG, o.COD_REPRESENTANTE,
          o.COD_OPERACAO, o.DAT_EMISSAO, o.NUM_PEDIDO_CLIENTE,
          o.HOR_EMISSAO, o.NUM_PLACA_VEICULO, o.VLR_FRETE,
          o.CIF_FOB, o.VLR_SEGURO, o.VLR_OUTROS,
          o.PER_DESCONTO, o.VLR_DESCONTO, o.VLR_BASE_IPI,
          o.VLR_IPI, o.VLR_BASE_ICMS, o.VLR_ISENTAS_IPI,
          o.VLR_ICMS, o.VLR_OUTRAS_IPI, o.VLR_BASE_ICMS_SUB_DEST,
          o.VLR_ICMS_SUB_DEST, o.VLR_BASE_ISS, o.VLR_ISENTAS_ICMS,
          o.VLR_OUTRAS_ICMS, o.VLR_ISS, o.VLR_PRODUTOS,
          o.VLR_SERVICOS, o.VLR_LIQUIDO, o.SIT_ORCAMENTO_OS,
          o.DAT_GERACAO, o.VLR_BASE_IRRF, o.DAT_ALTERACAO,
          o.COD_USUARIO, o.VLR_IRRF, o.DAT_PREVISAO,
          o.VLR_BRUTO, o.HOR_PREVISAO, o.COD_TRANS_REDESPACHO,
          o.COD_TRANSPORTADORA, o.QTD_DIAS_VALIDADE, o.PES_BRUTO,
          o.PES_LIQUIDO, o.RAZ_CLI_FOR,
          r.RAZ_REPRESENTANTE AS DES_REPRESENTANTE,
          cp.DES_CONDICAO AS DES_CONDICAO_PAG,
          tt.DES_TIPO_TITULO AS DES_TIPO_TITULO,
          op.DES_OPERACAO AS DES_OPERACAO,
          tr.RAZ_TRANSPORTADORA AS DES_TRANSPORTADORA,
          u.NOM_USUARIO,
          c.NOM_CIDADE AS NOM_CIDADE_CLIENTE,
          c.SIG_ESTADO AS SIG_ESTADO_CLIENTE
        FROM dbo.ORCAMENTOS_OS o
        LEFT JOIN dbo.REPRESENTANTES r ON r.COD_REPRESENTANTE = o.COD_REPRESENTANTE
        LEFT JOIN dbo.CONDICOES_PAGAMENTO cp ON cp.COD_EMPRESA = o.COD_EMPRESA AND cp.COD_CONDICAO_PAG = o.COD_CONDICAO_PAG
        LEFT JOIN dbo.TIPOS_TITULOS tt ON tt.COD_TIPO_TITULO = o.COD_TIPO_TITULO
        LEFT JOIN dbo.OPERACOES op ON op.COD_EMPRESA = o.COD_EMPRESA AND op.COD_OPERACAO = o.COD_OPERACAO
        LEFT JOIN dbo.TRANSPORTADORAS tr ON tr.COD_EMPRESA = o.COD_EMPRESA AND tr.COD_TRANSPORTADORA = o.COD_TRANSPORTADORA
        LEFT JOIN dbo.USUARIOS u ON u.COD_USUARIO = o.COD_USUARIO
        LEFT JOIN dbo.CLIENTES_FORNECEDORES cf ON cf.COD_CLI_FOR = o.COD_CLI_FOR
        LEFT JOIN dbo.CIDADES c ON c.COD_CIDADE = cf.COD_CIDADE
        WHERE o.COD_EMPRESA = @codEmpresa
          AND o.IND_ORCAMENTO_OS = @indOrcamentoOS
          AND o.NUM_ORCAMENTO_OS = @numOrcamentoOS
      `;

      const queryItens = `
        SELECT 
          i.COD_EMPRESA, i.IND_ORCAMENTO_OS, i.NUM_ORCAMENTO_OS,
          i.SEQ_ITEM_ORCAMENTO_OS, i.COD_SERIE_ORC_OS, i.COD_PRODUTO,
          i.IND_PRODUTO_SERVICO, i.COD_DERIVACAO, i.COD_DEPOSITO,
          i.DES_ITEM, i.IND_RESERVA_ESTOQUE, i.QTD_PEDIDA,
          i.QTD_FATURADA, i.QTD_CANCELADA, i.QTD_ABERTO,
          i.COD_UNIDADE_MEDIDA, i.COD_TABELA_PRECO, i.VLR_PRECO_UNITARIO,
          i.PER_IPI, i.COD_SITUACAO_TRIBUTARIA, i.VLR_IPI,
          i.VLR_BASE_IPI, i.PER_ICMS, i.VLR_ISENTAS_IPI,
          i.VLR_BASE_ICMS, i.VLR_OUTRAS_IPI, i.VLR_ICMS,
          i.VLR_BASE_ICMS_SUB_DEST, i.VLR_ICMS_SUB_DEST, i.PER_COMISSAO_FAT,
          i.VLR_ISENTAS_ICMS, i.PER_COMISSAO_REC, i.VLR_OUTRAS_ICMS,
          i.DAT_ENTREGA, i.VLR_BRUTO, i.PER_DESCONTO_ACRESCIMO,
          i.COD_REP_PREST_SERV, i.VLR_BASE_ISS, i.VLR_DESCONTO_ACRESCIMO,
          i.PER_COMISSAO_PREST_SERV, i.HOR_ENTREGA, i.VLR_LIQUIDO,
          i.VLR_BASE_IRRF, i.SIT_ITEM, i.VLR_IRRF,
          i.DAT_VENCIMENTO_GARANTIA, i.NUM_SERIE_PRODUTO, i.PES_BRUTO,
          i.PES_LIQUIDO, i.TIP_ITEM, i.OBS_ITEM,
          p.DES_PRODUTO,
          um.DES_UNIDADE_MEDIDA,
          tp.DES_TABELA_PRECO,
          d.DES_DEPOSITO,
          rp.RAZ_REPRESENTANTE AS DES_REP_PREST_SERV
        FROM dbo.ITENS_ORCAMENTO_OS i
        LEFT JOIN dbo.PRODUTOS_SERVICOS p ON p.COD_EMPRESA = i.COD_EMPRESA AND p.COD_PRODUTO = i.COD_PRODUTO
        LEFT JOIN dbo.UNIDADES_MEDIDA um ON um.COD_UNIDADE_MEDIDA = i.COD_UNIDADE_MEDIDA
        LEFT JOIN dbo.TABELAS_PRECOS tp ON tp.COD_EMPRESA = i.COD_EMPRESA AND tp.COD_TABELA_PRECO = i.COD_TABELA_PRECO
        LEFT JOIN dbo.DEPOSITOS d ON d.COD_DEPOSITO = i.COD_DEPOSITO
        LEFT JOIN dbo.REPRESENTANTES rp ON rp.COD_REPRESENTANTE = i.COD_REP_PREST_SERV
        WHERE i.COD_EMPRESA = @codEmpresa
          AND i.IND_ORCAMENTO_OS = @indOrcamentoOS
          AND i.NUM_ORCAMENTO_OS = @numOrcamentoOS
        ORDER BY i.SEQ_ITEM_ORCAMENTO_OS
      `;

      const [orcamentoResult, itensResult] = await Promise.all([
        poolBanco.executarConsulta<OrcamentoCompletoDB>(queryOrcamento, {
          codEmpresa,
          indOrcamentoOS,
          numOrcamentoOS,
        }),
        poolBanco.executarConsulta<ItemOrcamentoDB>(queryItens, {
          codEmpresa,
          indOrcamentoOS,
          numOrcamentoOS,
        }),
      ]);

      if (!orcamentoResult || orcamentoResult.length === 0) {
        throw new Error("Orçamento não encontrado");
      }

      return {
        orcamento: orcamentoResult[0],
        itens: itensResult || [],
      };
    } catch (erro) {
      logger.error("Erro ao obter orçamento completo", erro, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });
      throw erro;
    }
  }

  async obterApontamentosOS(
    codEmpresa: number,
    indOrcamentoOS: string,
    numOrcamentoOS: number
  ): Promise<ItemApontamentoOSDB[]> {
    try {
      const query = `
        SELECT 
          a.COD_EMPRESA, a.IND_ORCAMENTO_OS, a.NUM_ORCAMENTO_OS,
          a.COD_SERIE_ORC_OS, a.SEQ_ITEM_ORCAMENTO_OS, a.SEQ_APONTAMENTO_OS,
          a.COD_REPRESENTANTE, a.HORA_INICIO, a.HORA_TERMINO,
          r.RAZ_REPRESENTANTE AS DES_REPRESENTANTE
        FROM dbo.ITENS_APONTAMENTO_OS a
        LEFT JOIN dbo.REPRESENTANTES r ON r.COD_REPRESENTANTE = a.COD_REPRESENTANTE
        WHERE a.COD_EMPRESA = @codEmpresa
          AND a.IND_ORCAMENTO_OS = @indOrcamentoOS
          AND a.NUM_ORCAMENTO_OS = @numOrcamentoOS
        ORDER BY a.SEQ_ITEM_ORCAMENTO_OS, a.SEQ_APONTAMENTO_OS
      `;

      const resultado = await poolBanco.executarConsulta<ItemApontamentoOSDB>(query, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });

      return resultado || [];
    } catch (erro) {
      logger.error("Erro ao obter apontamentos OS", erro, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });
      throw erro;
    }
  }

  async obterReceituarios(
    codEmpresa: number,
    indOrcamentoOS: string,
    numOrcamentoOS: number
  ): Promise<ItemReceituarioDB[]> {
    try {
      const query = `
        SELECT 
          r.COD_EMPRESA, r.IND_ORCAMENTO_OS, r.NUM_ORCAMENTO_OS,
          r.SEQ_ITEM_ORCAMENTO_OS, r.COD_SERIE_ORC_OS, r.COD_LABORATORIO,
          r.COD_PROFISSIONAL, r.DAT_RECEITA, r.PRE_ENTREGA,
          r.TIP_LENTE, r.LON_OD_ESF, r.LON_OE_ESF,
          r.LON_OD_CIL, r.LON_OE_CIL, r.LON_OD_EIXO,
          r.LON_OE_EIXO, r.LON_OD_DNP, r.LON_OE_DNP,
          r.LON_OD_ALT, r.LON_OE_ALT, r.PER_OD_ESF,
          r.PER_OE_ESF, r.PER_OD_CIL, r.PER_OE_CIL,
          r.PER_OD_EIXO, r.PER_OE_EIXO, r.PER_OD_DNP,
          r.PER_OE_DNP, r.PER_OD_ALT, r.PER_OE_ALT,
          r.OBS_RECEITA, r.VLR_TRATAMENTO, r.MUL_ADICAO,
          r.COD_USUARIO_ENVIO_LAB, r.COD_USUARIO_RETORNO_LAB, r.COD_USUARIO_ENTREGA,
          r.DAT_ENVIO_LAB, r.DAT_RETORNO_LAB, r.DAT_ENTREGA,
          r.COD_TIPO_LENTE, r.DES_TIP_ARMACAO
        FROM dbo.ITENS_RECEITUARIOS r
        WHERE r.COD_EMPRESA = @codEmpresa
          AND r.IND_ORCAMENTO_OS = @indOrcamentoOS
          AND r.NUM_ORCAMENTO_OS = @numOrcamentoOS
        ORDER BY r.SEQ_ITEM_ORCAMENTO_OS
      `;

      const resultado = await poolBanco.executarConsulta<ItemReceituarioDB>(query, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });

      return resultado || [];
    } catch (erro) {
      logger.error("Erro ao obter receituários", erro, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });
      throw erro;
    }
  }

  async obterTrocasOrcamento(
    codEmpresa: number,
    indOrcamentoOS: string,
    numOrcamentoOS: number
  ): Promise<ItemTrocaOrcamentoDB[]> {
    try {
      const query = `
        SELECT 
          t.COD_EMPRESA, t.IND_ORCAMENTO_OS, t.NUM_ORCAMENTO_OS,
          t.COD_PRODUTO, t.COD_SERIE_ORC_OS, t.SEQ_ITEM_TROCA,
          t.COD_DEPOSITO, t.COD_DERIVACAO, t.DES_ITEM,
          t.QTD_TROCADA, t.COD_UNIDADE_MEDIDA, t.COD_TABELA_PRECO,
          t.VLR_PRECO_UNITARIO, t.VLR_BRUTO, t.PER_DESCONTO,
          t.VLR_LIQUIDO, t.SEQ_TROCA, t.COD_USUARIO, t.DAT_TROCA,
          p.DES_PRODUTO,
          um.DES_UNIDADE_MEDIDA,
          tp.DES_TABELA_PRECO,
          d.DES_DEPOSITO,
          u.NOM_USUARIO
        FROM dbo.ITENS_TROCA_ORCAMENTO t
        LEFT JOIN dbo.PRODUTOS_SERVICOS p ON p.COD_EMPRESA = t.COD_EMPRESA AND p.COD_PRODUTO = t.COD_PRODUTO
        LEFT JOIN dbo.UNIDADES_MEDIDA um ON um.COD_UNIDADE_MEDIDA = t.COD_UNIDADE_MEDIDA
        LEFT JOIN dbo.TABELAS_PRECOS tp ON tp.COD_EMPRESA = t.COD_EMPRESA AND tp.COD_TABELA_PRECO = t.COD_TABELA_PRECO
        LEFT JOIN dbo.DEPOSITOS d ON d.COD_DEPOSITO = t.COD_DEPOSITO
        LEFT JOIN dbo.USUARIOS u ON u.COD_USUARIO = t.COD_USUARIO
        WHERE t.COD_EMPRESA = @codEmpresa
          AND t.IND_ORCAMENTO_OS = @indOrcamentoOS
          AND t.NUM_ORCAMENTO_OS = @numOrcamentoOS
        ORDER BY t.SEQ_ITEM_TROCA
      `;

      const resultado = await poolBanco.executarConsulta<ItemTrocaOrcamentoDB>(query, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });

      return resultado || [];
    } catch (erro) {
      logger.error("Erro ao obter trocas de orçamento", erro, {
        codEmpresa,
        indOrcamentoOS,
        numOrcamentoOS,
      });
      throw erro;
    }
  }
}

export const orcamentoRepository = new OrcamentoRepository();
