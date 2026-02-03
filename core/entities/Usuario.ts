import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("USUARIOS", { schema: "dbo" })
export class Usuario {
  @PrimaryColumn({ name: "COD_USUARIO", type: "smallint" })
  COD_USUARIO!: number;

  @Column({ name: "NOM_USUARIO", type: "varchar", length: 40, nullable: true })
  NOM_USUARIO!: string | null;

  @Column({ name: "ABR_USUARIO", type: "varchar", length: 10, nullable: true })
  ABR_USUARIO!: string | null;

  @Column({ name: "SEN_USUARIO", type: "varchar", length: 20, nullable: true })
  SEN_USUARIO!: string | null;

  @Column({
    name: "IND_CRIPTOGRAFADO",
    type: "varchar",
    length: 1,
    nullable: true,
  })
  IND_CRIPTOGRAFADO!: string | null;

  @Column({ name: "SIT_USUARIO", type: "varchar", length: 1, nullable: true })
  SIT_USUARIO!: string | null;

  @Column({ name: "COD_GRUPO_USUARIO", type: "smallint", nullable: true })
  COD_GRUPO_USUARIO!: number | null;
}
