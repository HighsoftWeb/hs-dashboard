import Cookies from "js-cookie";

const CNPJ_COOKIE_NAME = "empresa_cnpj";

export function salvarCnpjNoCookie(cnpj: string): void {
  if (!cnpj || typeof cnpj !== "string") {
    return;
  }
  
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length === 14) {
    Cookies.set(CNPJ_COOKIE_NAME, cnpjLimpo, {
      expires: 365 * 10,
      sameSite: "strict",
    });
  }
}

export function obterCnpjDoCookie(): string | null {
  const cnpj = Cookies.get(CNPJ_COOKIE_NAME);
  return cnpj && cnpj.length === 14 ? cnpj : null;
}

export function removerCnpjDoCookie(): void {
  Cookies.remove(CNPJ_COOKIE_NAME);
}
