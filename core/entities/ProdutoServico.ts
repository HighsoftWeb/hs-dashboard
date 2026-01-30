import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("PRODUTOS_SERVICOS", { schema: "dbo" })
export class ProdutoServico {
  @PrimaryColumn({ name: "COD_EMPRESA", type: "smallint" })
  COD_EMPRESA!: number;

  @PrimaryColumn({ name: "COD_PRODUTO", type: "int" })
  COD_PRODUTO!: number;

  @Column({ name: "DES_PRODUTO", type: "varchar", length: 200, nullable: true })
  DES_PRODUTO!: string | null;

  @Column({ name: "COD_UNIDADE_MEDIDA", type: "varchar", length: 5, nullable: true })
  COD_UNIDADE_MEDIDA!: string | null;

  @Column({ name: "IND_PRODUTO_SERVICO", type: "varchar", length: 1, nullable: true })
  IND_PRODUTO_SERVICO!: string | null;

  @Column({ name: "SIT_PRODUTO", type: "varchar", length: 1, nullable: true })
  SIT_PRODUTO!: string | null;

  @Column({ name: "OBS_PRODUTO", type: "varchar", length: 200, nullable: true })
  OBS_PRODUTO!: string | null;

  @Column({ name: "DAT_CADASTRO", type: "datetime", nullable: true })
  DAT_CADASTRO!: Date | null;

  @Column({ name: "DAT_ALTERACAO", type: "datetime", nullable: true })
  DAT_ALTERACAO!: Date | null;

  @Column({ name: "COD_USUARIO", type: "smallint", nullable: true })
  COD_USUARIO!: number | null;
}
