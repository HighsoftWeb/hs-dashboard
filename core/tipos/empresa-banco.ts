/**
 * Tipos relacionados a empresas do banco de dados principal
 */

export interface EmpresaBanco {
  COD_EMPRESA: number;
  NOM_EMPRESA: string;
  FAN_EMPRESA: string | null;
  CGC_EMPRESA: string | null;
  SIT_EMPRESA: string | null;
}

export interface EmpresaBancoResponse {
  success: boolean;
  data: EmpresaBanco[];
  error?: {
    message: string;
  };
}
