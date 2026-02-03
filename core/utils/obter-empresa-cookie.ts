import { NextRequest } from "next/server";
import { empresaConfigRepository } from "../repository/empresa-config-repository";
import { validarELimparCnpj } from "./cnpj-utils";
import type { EmpresaConfig } from "../entities/EmpresaConfig";

const CNPJ_COOKIE_NAME = "empresa_cnpj";
const COD_EMPRESA_COOKIE_NAME = "cod_empresa";
const RADIX_DECIMAL = 10;

/**
 * Obtém a configuração da empresa a partir do cookie CNPJ
 * @throws {Error} Se o CNPJ não for encontrado ou a empresa não existir
 */
export function obterEmpresaConfigDoCookie(
  request: NextRequest
): EmpresaConfig {
  const cnpjCookie = request.cookies.get(CNPJ_COOKIE_NAME)?.value;
  const cnpjLimpo = validarELimparCnpj(cnpjCookie);

  if (!cnpjLimpo) {
    throw new Error("CNPJ da empresa não encontrado no cookie");
  }

  const empresaConfig = empresaConfigRepository.obterPorCnpj(cnpjLimpo);

  if (!empresaConfig) {
    throw new Error("Empresa não encontrada");
  }

  return empresaConfig;
}

/**
 * Obtém o código da empresa a partir do cookie
 * @returns O código da empresa ou null se não encontrado/inválido
 */
export function obterCodEmpresaDoCookie(request: NextRequest): number | null {
  const codEmpresaCookie = request.cookies.get(COD_EMPRESA_COOKIE_NAME)?.value;

  if (!codEmpresaCookie) {
    return null;
  }

  const codEmpresa = parseInt(codEmpresaCookie, RADIX_DECIMAL);

  if (isNaN(codEmpresa) || !Number.isInteger(codEmpresa) || codEmpresa <= 0) {
    return null;
  }

  return codEmpresa;
}
