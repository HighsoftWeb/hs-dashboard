import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("TITULOS_PAGAR", { schema: "dbo" })
export class TituloPagar {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "NUM_INTERNO", type: "int" })
  NUM_INTERNO!: number;

  @PrimaryColumn({ name: "NUM_PARCELA", type: "int" })
  NUM_PARCELA!: number;

  @Column({ name: "COD_CLI_FOR", type: "int" })
  COD_CLI_FOR!: number;

  @Column({ name: "VCT_ORIGINAL", type: "datetime" })
  VCT_ORIGINAL!: Date;

  @Column({ name: "VLR_ABERTO", type: "numeric", precision: 15, scale: 2 })
  VLR_ABERTO!: number;

  @Column({ name: "SIT_TITULO", type: "varchar", length: 2 })
  SIT_TITULO!: string;

  @Column({ name: "RAZ_CLI_FOR", type: "varchar", length: 60, nullable: true })
  RAZ_CLI_FOR!: string | null;
}
