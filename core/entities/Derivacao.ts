import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("DERIVACOES", { schema: "dbo" })
export class Derivacao {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "COD_PRODUTO", type: "int" })
  COD_PRODUTO!: number;

  @PrimaryColumn({ name: "COD_DERIVACAO", type: "varchar", length: 5 })
  COD_DERIVACAO!: string;

  @Column({ name: "DES_DERIVACAO", type: "varchar", length: 50, nullable: true })
  DES_DERIVACAO!: string | null;

  @Column({ name: "COD_BARRA", type: "varchar", length: 20, nullable: true })
  COD_BARRA!: string | null;

  @Column({ name: "SIT_DERIVACAO", type: "varchar", length: 1, nullable: true })
  SIT_DERIVACAO!: string | null;

  @Column({ name: "OBS_DERIVACAO", type: "varchar", length: 200, nullable: true })
  OBS_DERIVACAO!: string | null;
}
