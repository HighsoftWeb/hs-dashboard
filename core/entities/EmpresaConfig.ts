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
}
