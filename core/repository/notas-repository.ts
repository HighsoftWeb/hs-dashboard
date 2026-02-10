import { poolBanco } from "../db/pool-banco";
import { logger } from "../utils/logger";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export interface NotaFiscalVendaDB {
  COD_EMPRESA: number;
  COD_SERIE_NF_VENDA: string;
  NUM_NF_VENDA: number;
  COD_CONDICAO_PAG: string | null;
  COD_CLI_FOR: number;
  COD_TIPO_TITULO: string | null;
  NUM_DOCUMENTO: string | null;
  COD_REPRESENTANTE: number | null;
  COD_OPERACAO: string | null;
  DAT_EMISSAO: Date | null;
  HOR_EMISSAO: Date | null;
  NUM_PEDIDO_CLIENTE: string | null;
  NUM_PLACA_VEICULO: string | null;
  VLR_FRETE: number | null;
  CIF_FOB: string | null;
  VLR_SEGURO: number | null;
  VLR_OUTROS: number | null;
  PER_DESCONTO: number | null;
  VLR_DESCONTO: number | null;
  VLR_IPI: number | null;
  VLR_ICMS: number | null;
  VLR_PRODUTOS: number | null;
  VLR_SERVICOS: number | null;
  VLR_LIQUIDO: number | null;
  SIT_NF: string | null;
  DAT_GERACAO: Date | null;
  COD_TRANSPORTADORA: number | null;
  DAT_ALTERACAO: Date | null;
  COD_USUARIO: number | null;
  DAT_SAIDA: Date | null;
  IND_ORCAMENTO_OS: string | null;
  NUM_ORCAMENTO_OS: number | null;
  VLR_BRUTO: number | null;
  RAZ_CLI_FOR: string | null;
  DES_REPRESENTANTE: string | null;
  DES_TRANSPORTADORA: string | null;
  NOM_USUARIO: string | null;
  NOM_CIDADE_CLIENTE: string | null;
  SIG_ESTADO_CLIENTE: string | null;
}

export interface ItemNotaFiscalVendaDB {
  COD_EMPRESA: number;
  COD_SERIE_NF_VENDA: string;
  NUM_NF_VENDA: number;
  SEQ_ITEM_NF_VENDA: number;
  COD_PRODUTO: number | null;
  IND_PRODUTO_SERVICO: string | null;
  COD_DERIVACAO: string | null;
  COD_DEPOSITO: string | null;
  DES_ITEM: string | null;
  QTD_FATURADA: number | null;
  COD_UNIDADE_MEDIDA: string | null;
  VLR_PRECO_UNITARIO: number | null;
  VLR_BRUTO: number | null;
  VLR_LIQUIDO: number | null;
  VLR_IPI: number | null;
  VLR_ICMS: number | null;
  DES_PRODUTO: string | null;
  DES_UNIDADE_MEDIDA: string | null;
  DES_TABELA_PRECO: string | null;
  DES_DEPOSITO: string | null;
}

export class NotasRepository {
  async obterNotaCompleta(
    codEmpresa: number,
    codSerie: string,
    numNf: number,
    empresaConfig: EmpresaConfig
  ): Promise<{ nota: NotaFiscalVendaDB; itens: ItemNotaFiscalVendaDB[] }> {
    try {
      const queryNota = `
        SELECT
          n.COD_EMPRESA, n.COD_SERIE_NF_VENDA, n.NUM_NF_VENDA,
          n.COD_CONDICAO_PAG, n.COD_CLI_FOR, n.COD_TIPO_TITULO,
          n.NUM_DOCUMENTO, n.COD_REPRESENTANTE, n.COD_OPERACAO,
          n.DAT_EMISSAO, n.HOR_EMISSAO, n.NUM_PEDIDO_CLIENTE,
          n.NUM_PLACA_VEICULO, n.VLR_FRETE, n.CIF_FOB, n.VLR_SEGURO,
          n.VLR_OUTROS, n.PER_DESCONTO, n.VLR_DESCONTO, n.VLR_IPI,
          n.VLR_ICMS, n.VLR_PRODUTOS, n.VLR_SERVICOS, n.VLR_LIQUIDO,
          n.SIT_NF, n.DAT_GERACAO, n.COD_TRANSPORTADORA, n.DAT_ALTERACAO,
          n.COD_USUARIO, n.DAT_SAIDA, n.IND_ORCAMENTO_OS, n.NUM_ORCAMENTO_OS,
          n.VLR_BRUTO, n.RAZ_CLI_FOR,
          r.RAZ_REPRESENTANTE AS DES_REPRESENTANTE,
          tr.RAZ_TRANSPORTADORA AS DES_TRANSPORTADORA,
          u.NOM_USUARIO,
          c.NOM_CIDADE AS NOM_CIDADE_CLIENTE,
          c.SIG_ESTADO AS SIG_ESTADO_CLIENTE
        FROM dbo.NOTAS_FISCAIS_VENDA n
        LEFT JOIN dbo.REPRESENTANTES r ON r.COD_REPRESENTANTE = n.COD_REPRESENTANTE
        LEFT JOIN dbo.TRANSPORTADORAS tr ON tr.COD_EMPRESA = n.COD_EMPRESA AND tr.COD_TRANSPORTADORA = n.COD_TRANSPORTADORA
        LEFT JOIN dbo.USUARIOS u ON u.COD_USUARIO = n.COD_USUARIO
        LEFT JOIN dbo.CLIENTES_FORNECEDORES cf ON cf.COD_CLI_FOR = n.COD_CLI_FOR
        LEFT JOIN dbo.CIDADES c ON c.COD_CIDADE = cf.COD_CIDADE
        WHERE n.COD_EMPRESA = @codEmpresa
          AND n.COD_SERIE_NF_VENDA = @codSerie
          AND n.NUM_NF_VENDA = @numNf
      `;

      const queryItens = `
        SELECT
          i.COD_EMPRESA, i.COD_SERIE_NF_VENDA, i.NUM_NF_VENDA,
          i.SEQ_ITEM_NF_VENDA, i.COD_PRODUTO, i.IND_PRODUTO_SERVICO,
          i.COD_DERIVACAO, i.COD_DEPOSITO, i.DES_ITEM,
          i.QTD_FATURADA, i.COD_UNIDADE_MEDIDA, i.VLR_PRECO_UNITARIO,
          i.VLR_BRUTO, i.VLR_LIQUIDO, i.VLR_IPI, i.VLR_ICMS,
          p.DES_PRODUTO, um.DES_UNIDADE_MEDIDA, tp.DES_TABELA_PRECO, d.DES_DEPOSITO
        FROM dbo.ITENS_NF_VENDA i
        LEFT JOIN dbo.PRODUTOS_SERVICOS p ON p.COD_EMPRESA = i.COD_EMPRESA AND p.COD_PRODUTO = i.COD_PRODUTO
        LEFT JOIN dbo.UNIDADES_MEDIDA um ON um.COD_UNIDADE_MEDIDA = i.COD_UNIDADE_MEDIDA
        LEFT JOIN dbo.TABELAS_PRECOS tp ON tp.COD_EMPRESA = i.COD_EMPRESA AND tp.COD_TABELA_PRECO = i.COD_TABELA_PRECO
        LEFT JOIN dbo.DEPOSITOS d ON d.COD_DEPOSITO = i.COD_DEPOSITO
        WHERE i.COD_EMPRESA = @codEmpresa
          AND i.COD_SERIE_NF_VENDA = @codSerie
          AND i.NUM_NF_VENDA = @numNf
        ORDER BY i.SEQ_ITEM_NF_VENDA
      `;

      const [notaResult, itensResult] = await Promise.all([
        poolBanco.executarConsulta<NotaFiscalVendaDB>(
          queryNota,
          { codEmpresa, codSerie, numNf },
          empresaConfig
        ),
        poolBanco.executarConsulta<ItemNotaFiscalVendaDB>(
          queryItens,
          { codEmpresa, codSerie, numNf },
          empresaConfig
        ),
      ]);

      if (!notaResult || notaResult.length === 0) {
        throw new Error("Nota fiscal não encontrada");
      }

      return {
        nota: notaResult[0],
        itens: itensResult || [],
      };
    } catch (erro) {
      logger.error("Erro ao obter nota fiscal completa", erro, {
        codEmpresa,
        codSerie,
        numNf,
      });
      throw erro;
    }
  }
}

export const notasRepository = new NotasRepository();
