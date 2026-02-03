import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("ORCAMENTOS_OS", { schema: "dbo" })
export class OrcamentoOS {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "IND_ORCAMENTO_OS", type: "varchar", length: 2 })
  IND_ORCAMENTO_OS!: string;

  @PrimaryColumn({ name: "NUM_ORCAMENTO_OS", type: "int" })
  NUM_ORCAMENTO_OS!: number;

  @Column({ name: "COD_CLI_FOR", type: "int" })
  COD_CLI_FOR!: number;

  @Column({ name: "COD_SERIE_ORC_OS", type: "varchar", length: 3 })
  COD_SERIE_ORC_OS!: string;

  @Column({
    name: "NUM_DOCUMENTO",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  NUM_DOCUMENTO!: string | null;

  @Column({
    name: "COD_TIPO_TITULO",
    type: "varchar",
    length: 3,
    nullable: true,
  })
  COD_TIPO_TITULO!: string | null;

  @Column({
    name: "COD_CONDICAO_PAG",
    type: "varchar",
    length: 8,
    nullable: true,
  })
  COD_CONDICAO_PAG!: string | null;

  @Column({ name: "COD_REPRESENTANTE", type: "int", nullable: true })
  COD_REPRESENTANTE!: number | null;

  @Column({ name: "COD_OPERACAO", type: "varchar", length: 6, nullable: true })
  COD_OPERACAO!: string | null;

  @Column({ name: "DAT_EMISSAO", type: "datetime", nullable: true })
  DAT_EMISSAO!: Date | null;

  @Column({
    name: "NUM_PEDIDO_CLIENTE",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  NUM_PEDIDO_CLIENTE!: string | null;

  @Column({ name: "HOR_EMISSAO", type: "datetime", nullable: true })
  HOR_EMISSAO!: Date | null;

  @Column({
    name: "NUM_PLACA_VEICULO",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  NUM_PLACA_VEICULO!: string | null;

  @Column({
    name: "VLR_FRETE",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_FRETE!: number | null;

  @Column({ name: "CIF_FOB", type: "varchar", length: 1, nullable: true })
  CIF_FOB!: string | null;

  @Column({
    name: "VLR_SEGURO",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_SEGURO!: number | null;

  @Column({
    name: "VLR_OUTROS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_OUTROS!: number | null;

  @Column({
    name: "PER_DESCONTO",
    type: "numeric",
    precision: 15,
    scale: 4,
    nullable: true,
  })
  PER_DESCONTO!: number | null;

  @Column({
    name: "VLR_DESCONTO",
    type: "numeric",
    precision: 15,
    scale: 4,
    nullable: true,
  })
  VLR_DESCONTO!: number | null;

  @Column({
    name: "VLR_BASE_IPI",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BASE_IPI!: number | null;

  @Column({
    name: "VLR_IPI",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_IPI!: number | null;

  @Column({
    name: "VLR_BASE_ICMS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BASE_ICMS!: number | null;

  @Column({
    name: "VLR_ISENTAS_IPI",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_ISENTAS_IPI!: number | null;

  @Column({
    name: "VLR_ICMS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_ICMS!: number | null;

  @Column({
    name: "VLR_OUTRAS_IPI",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_OUTRAS_IPI!: number | null;

  @Column({
    name: "VLR_BASE_ICMS_SUB_DEST",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BASE_ICMS_SUB_DEST!: number | null;

  @Column({
    name: "VLR_ICMS_SUB_DEST",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_ICMS_SUB_DEST!: number | null;

  @Column({
    name: "VLR_BASE_ISS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BASE_ISS!: number | null;

  @Column({
    name: "VLR_ISENTAS_ICMS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_ISENTAS_ICMS!: number | null;

  @Column({
    name: "VLR_OUTRAS_ICMS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_OUTRAS_ICMS!: number | null;

  @Column({
    name: "VLR_ISS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_ISS!: number | null;

  @Column({
    name: "VLR_PRODUTOS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_PRODUTOS!: number | null;

  @Column({
    name: "VLR_SERVICOS",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_SERVICOS!: number | null;

  @Column({
    name: "VLR_LIQUIDO",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_LIQUIDO!: number | null;

  @Column({
    name: "SIT_ORCAMENTO_OS",
    type: "varchar",
    length: 2,
    nullable: true,
  })
  SIT_ORCAMENTO_OS!: string | null;

  @Column({ name: "DAT_GERACAO", type: "datetime", nullable: true })
  DAT_GERACAO!: Date | null;

  @Column({
    name: "VLR_BASE_IRRF",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BASE_IRRF!: number | null;

  @Column({ name: "DAT_ALTERACAO", type: "datetime", nullable: true })
  DAT_ALTERACAO!: Date | null;

  @Column({ name: "COD_USUARIO", type: "smallint", nullable: true })
  COD_USUARIO!: number | null;

  @Column({
    name: "VLR_IRRF",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_IRRF!: number | null;

  @Column({ name: "DAT_PREVISAO", type: "datetime", nullable: true })
  DAT_PREVISAO!: Date | null;

  @Column({
    name: "VLR_BRUTO",
    type: "numeric",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  VLR_BRUTO!: number | null;

  @Column({ name: "HOR_PREVISAO", type: "datetime", nullable: true })
  HOR_PREVISAO!: Date | null;

  @Column({ name: "COD_TRANS_REDESPACHO", type: "smallint", nullable: true })
  COD_TRANS_REDESPACHO!: number | null;

  @Column({ name: "COD_TRANSPORTADORA", type: "smallint", nullable: true })
  COD_TRANSPORTADORA!: number | null;

  @Column({ name: "QTD_DIAS_VALIDADE", type: "int", nullable: true })
  QTD_DIAS_VALIDADE!: number | null;

  @Column({
    name: "PES_BRUTO",
    type: "numeric",
    precision: 15,
    scale: 4,
    nullable: true,
  })
  PES_BRUTO!: number | null;

  @Column({
    name: "PES_LIQUIDO",
    type: "numeric",
    precision: 15,
    scale: 4,
    nullable: true,
  })
  PES_LIQUIDO!: number | null;

  @Column({ name: "RAZ_CLI_FOR", type: "varchar", length: 60, nullable: true })
  RAZ_CLI_FOR!: string | null;
}
