import type { EmpresaConfig } from "../entities/EmpresaConfig";

/**
 * Interface com apenas os campos seguros da empresa (sem dados sensíveis)
 */
export interface EmpresaSegura {
  id: number;
  cnpj: string;
  nomeEmpresa: string;
  criadoEm: string;
  atualizadoEm: string;
}

/**
 * Remove dados sensíveis de conexão do objeto EmpresaConfig
 * Retorna apenas campos seguros para exposição no frontend
 */
export function filtrarEmpresaSegura(empresa: EmpresaConfig): EmpresaSegura {
  return {
    id: empresa.id,
    cnpj: empresa.cnpj,
    nomeEmpresa: empresa.nomeEmpresa,
    criadoEm: empresa.criadoEm,
    atualizadoEm: empresa.atualizadoEm,
  };
}
