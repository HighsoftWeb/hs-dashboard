import type { EmpresaConfig } from "../entities/EmpresaConfig";

/**
 * Interface com apenas os campos seguros da empresa (sem dados sensíveis)
 */
export interface EmpresaSegura {
  id: number;
  cnpj: string;
  nomeEmpresa: string;
  corPrimaria: string;
  corSecundaria: string;
  corTerciaria: string;
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
    corPrimaria: empresa.corPrimaria || "#094a73",
    corSecundaria: empresa.corSecundaria || "#048abf",
    corTerciaria: empresa.corTerciaria || "#04b2d9",
    criadoEm: empresa.criadoEm,
    atualizadoEm: empresa.atualizadoEm,
  };
}
