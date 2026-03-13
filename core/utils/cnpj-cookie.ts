import Cookies from "js-cookie";
import { validarELimparCnpj } from "./cnpj-utils";

const CNPJ_COOKIE_NAME = "empresa_cnpj";
const COOKIE_EXPIRES_DAYS = 365 * 10;

export function salvarCnpjNoCookie(cnpj: string): void {
  const cnpjLimpo = validarELimparCnpj(cnpj);

  if (!cnpjLimpo) {
    return;
  }

  Cookies.set(CNPJ_COOKIE_NAME, cnpjLimpo, {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: "strict",
    path: "/",
  });
}

export function obterCnpjDoCookie(): string | null {
  const cnpj = Cookies.get(CNPJ_COOKIE_NAME);
  return validarELimparCnpj(cnpj);
}

export function removerCnpjDoCookie(): void {
  Cookies.remove(CNPJ_COOKIE_NAME);
}
