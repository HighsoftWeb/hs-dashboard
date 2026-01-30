import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("ITENS_ORCAMENTO_OS", { schema: "dbo" })
export class ItemOrcamentoOS {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "IND_ORCAMENTO_OS", type: "varchar", length: 2 })
  IND_ORCAMENTO_OS!: string;

  @PrimaryColumn({ name: "NUM_ORCAMENTO_OS", type: "int" })
  NUM_ORCAMENTO_OS!: number;

  @PrimaryColumn({ name: "SEQ_ITEM_ORCAMENTO_OS", type: "int" })
  SEQ_ITEM_ORCAMENTO_OS!: number;

  @Column({ name: "COD_SERIE_ORC_OS", type: "varchar", length: 3 })
  COD_SERIE_ORC_OS!: string;

  @Column({ name: "COD_PRODUTO", type: "int", nullable: true })
  COD_PRODUTO!: number | null;

  @Column({ name: "IND_PRODUTO_SERVICO", type: "varchar", length: 1, nullable: true })
  IND_PRODUTO_SERVICO!: string | null;

  @Column({ name: "COD_DERIVACAO", type: "varchar", length: 5, nullable: true })
  COD_DERIVACAO!: string | null;

  @Column({ name: "COD_DEPOSITO", type: "varchar", length: 10, nullable: true })
  COD_DEPOSITO!: string | null;

  @Column({ name: "DES_ITEM", type: "varchar", length: 200, nullable: true })
  DES_ITEM!: string | null;

  @Column({ name: "IND_RESERVA_ESTOQUE", type: "varchar", length: 1 })
  IND_RESERVA_ESTOQUE!: string;

  @Column({ name: "QTD_PEDIDA", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_PEDIDA!: number | null;

  @Column({ name: "QTD_FATURADA", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_FATURADA!: number | null;

  @Column({ name: "QTD_CANCELADA", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_CANCELADA!: number | null;

  @Column({ name: "QTD_ABERTO", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_ABERTO!: number | null;

  @Column({ name: "COD_UNIDADE_MEDIDA", type: "varchar", length: 5 })
  COD_UNIDADE_MEDIDA!: string;

  @Column({ name: "COD_TABELA_PRECO", type: "varchar", length: 6, nullable: true })
  COD_TABELA_PRECO!: string | null;

  @Column({ name: "VLR_PRECO_UNITARIO", type: "numeric", precision: 15, scale: 6, nullable: true })
  VLR_PRECO_UNITARIO!: number | null;

  @Column({ name: "PER_IPI", type: "numeric", precision: 9, scale: 2, nullable: true })
  PER_IPI!: number | null;

  @Column({ name: "COD_SITUACAO_TRIBUTARIA", type: "varchar", length: 5, nullable: true })
  COD_SITUACAO_TRIBUTARIA!: string | null;

  @Column({ name: "VLR_IPI", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_IPI!: number | null;

  @Column({ name: "VLR_BASE_IPI", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_BASE_IPI!: number | null;

  @Column({ name: "PER_ICMS", type: "numeric", precision: 9, scale: 2, nullable: true })
  PER_ICMS!: number | null;

  @Column({ name: "VLR_ISENTAS_IPI", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_ISENTAS_IPI!: number | null;

  @Column({ name: "VLR_BASE_ICMS", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_BASE_ICMS!: number | null;

  @Column({ name: "VLR_OUTRAS_IPI", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_OUTRAS_IPI!: number | null;

  @Column({ name: "VLR_ICMS", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_ICMS!: number | null;

  @Column({ name: "VLR_BASE_ICMS_SUB_DEST", type: "numeric", precision: 15, scale: 4, nullable: true })
  VLR_BASE_ICMS_SUB_DEST!: number | null;

  @Column({ name: "VLR_ICMS_SUB_DEST", type: "numeric", precision: 15, scale: 4, nullable: true })
  VLR_ICMS_SUB_DEST!: number | null;

  @Column({ name: "PER_COMISSAO_FAT", type: "numeric", precision: 9, scale: 2, nullable: true })
  PER_COMISSAO_FAT!: number | null;

  @Column({ name: "VLR_ISENTAS_ICMS", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_ISENTAS_ICMS!: number | null;

  @Column({ name: "PER_COMISSAO_REC", type: "numeric", precision: 9, scale: 2, nullable: true })
  PER_COMISSAO_REC!: number | null;

  @Column({ name: "VLR_OUTRAS_ICMS", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_OUTRAS_ICMS!: number | null;

  @Column({ name: "DAT_ENTREGA", type: "datetime", nullable: true })
  DAT_ENTREGA!: Date | null;

  @Column({ name: "VLR_BRUTO", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_BRUTO!: number | null;

  @Column({ name: "PER_DESCONTO_ACRESCIMO", type: "numeric", precision: 15, scale: 4, nullable: true })
  PER_DESCONTO_ACRESCIMO!: number | null;

  @Column({ name: "COD_REP_PREST_SERV", type: "int", nullable: true })
  COD_REP_PREST_SERV!: number | null;

  @Column({ name: "VLR_BASE_ISS", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_BASE_ISS!: number | null;

  @Column({ name: "VLR_DESCONTO_ACRESCIMO", type: "numeric", precision: 15, scale: 4, nullable: true })
  VLR_DESCONTO_ACRESCIMO!: number | null;

  @Column({ name: "PER_COMISSAO_PREST_SERV", type: "numeric", precision: 9, scale: 2, nullable: true })
  PER_COMISSAO_PREST_SERV!: number | null;

  @Column({ name: "HOR_ENTREGA", type: "datetime", nullable: true })
  HOR_ENTREGA!: Date | null;

  @Column({ name: "VLR_LIQUIDO", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_LIQUIDO!: number | null;

  @Column({ name: "VLR_BASE_IRRF", type: "numeric", precision: 15, scale: 2, nullable: true })
  VLR_BASE_IRRF!: number | null;

  @Column({ name: "SIT_ITEM", type: "varchar", length: 2, nullable: true })
  SIT_ITEM!: string | null;

  @Column({ name: "VLR_IRRF", type: "numeric", precision: 15, scale: 4, nullable: true })
  VLR_IRRF!: number | null;

  @Column({ name: "DAT_VENCIMENTO_GARANTIA", type: "datetime", nullable: true })
  DAT_VENCIMENTO_GARANTIA!: Date | null;

  @Column({ name: "NUM_SERIE_PRODUTO", type: "varchar", length: 100, nullable: true })
  NUM_SERIE_PRODUTO!: string | null;

  @Column({ name: "PES_BRUTO", type: "numeric", precision: 15, scale: 4, nullable: true })
  PES_BRUTO!: number | null;

  @Column({ name: "PES_LIQUIDO", type: "numeric", precision: 15, scale: 4, nullable: true })
  PES_LIQUIDO!: number | null;

  @Column({ name: "TIP_ITEM", type: "varchar", length: 1, nullable: true })
  TIP_ITEM!: string | null;

  @Column({ name: "OBS_ITEM", type: "varchar", length: 255, nullable: true })
  OBS_ITEM!: string | null;
}
