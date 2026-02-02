import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("TITULOS_RECEBER", { schema: "dbo" })
export class TituloReceber {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "COD_CLI_FOR", type: "int" })
  COD_CLI_FOR!: number;

  @PrimaryColumn({ name: "COD_TIPO_TITULO", type: "varchar", length: 3 })
  COD_TIPO_TITULO!: string;

  @PrimaryColumn({ name: "NUM_TITULO", type: "varchar", length: 15 })
  NUM_TITULO!: string;

  @PrimaryColumn({ name: "SEQ_TITULO", type: "int" })
  SEQ_TITULO!: number;

  @Column({ name: "VCT_ORIGINAL", type: "datetime" })
  VCT_ORIGINAL!: Date;

  @Column({ name: "VLR_ABERTO", type: "numeric", precision: 15, scale: 2 })
  VLR_ABERTO!: number;

  @Column({ name: "SIT_TITULO", type: "varchar", length: 2 })
  SIT_TITULO!: string;
}
