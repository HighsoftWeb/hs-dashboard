import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("CLIENTES_FORNECEDORES", { schema: "dbo" })
export class ClienteFornecedor {
  @PrimaryColumn({ name: "COD_CLI_FOR", type: "int" })
  COD_CLI_FOR!: number;

  @Column({ name: "RAZ_CLI_FOR", type: "varchar", length: 60, nullable: true })
  RAZ_CLI_FOR!: string | null;

  @Column({ name: "SIT_CLI_FOR", type: "varchar", length: 1, nullable: true })
  SIT_CLI_FOR!: string | null;

  @Column({ name: "CLI_FOR_AMBOS", type: "varchar", length: 1, nullable: true })
  CLI_FOR_AMBOS!: string | null;
}
