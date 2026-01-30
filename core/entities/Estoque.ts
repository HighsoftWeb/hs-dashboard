import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("ESTOQUES", { schema: "dbo" })
export class Estoque {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "COD_PRODUTO", type: "int" })
  COD_PRODUTO!: number;

  @PrimaryColumn({ name: "COD_DEPOSITO", type: "varchar", length: 10 })
  COD_DEPOSITO!: string;

  @PrimaryColumn({ name: "COD_DERIVACAO", type: "varchar", length: 5 })
  COD_DERIVACAO!: string;

  @Column({ name: "QTD_ATUAL", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_ATUAL!: number | null;

  @Column({ name: "QTD_RESERVADA", type: "numeric", precision: 15, scale: 4, nullable: true })
  QTD_RESERVADA!: number | null;

  @Column({ name: "ACE_ESTOQUE_NEGATIVO", type: "varchar", length: 1, nullable: true })
  ACE_ESTOQUE_NEGATIVO!: string | null;
}
