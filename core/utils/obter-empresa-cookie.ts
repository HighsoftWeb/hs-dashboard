import { NextRequest } from "next/server";
import { empresaConfigRepository } from "../repository/empresa-config-repository";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

export function obterEmpresaConfigDoCookie(
  request: NextRequest
): EmpresaConfig {
  const cnpjCookie = request.cookies.get("empresa_cnpj")?.value;
  
  if (!cnpjCookie || cnpjCookie.length !== 14) {
    throw new Error("CNPJ da empresa não encontrado no cookie");
  }

  const empresaConfig = empresaConfigRepository.obterPorCnpj(cnpjCookie);
  
  if (!empresaConfig) {
    throw new Error("Empresa não encontrada");
  }

  return empresaConfig;
}
