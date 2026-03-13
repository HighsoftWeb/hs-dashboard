import type { EmpresaConfig } from "../entities/EmpresaConfig";

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

export function filtrarEmpresaSegura(empresa: EmpresaConfig): EmpresaSegura {
  return {
    id: empresa.id,
    cnpj: empresa.cnpj,
    nomeEmpresa: empresa.nomeEmpresa,
    corPrimaria: empresa.corPrimaria || "#64748b",
    corSecundaria: empresa.corSecundaria || "#94a3b8",
    corTerciaria: empresa.corTerciaria || "#cbd5e1",
    criadoEm: empresa.criadoEm,
    atualizadoEm: empresa.atualizadoEm,
  };
}
