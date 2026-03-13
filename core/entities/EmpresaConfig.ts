export interface EmpresaConfig {
  id: number;
  cnpj: string;
  nomeEmpresa: string;
  host: string;
  porta: number;
  nomeBase: string;
  usuario: string;
  senha: string;
  codigosUsuariosPermitidos: string | null;
  corPrimaria: string;
  corSecundaria: string;
  corTerciaria: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface EmpresaConfigInput {
  cnpj: string;
  nomeEmpresa: string;
  host: string;
  porta: number;
  nomeBase: string;
  usuario: string;
  senha: string;
  codigosUsuariosPermitidos?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corTerciaria?: string;
}
