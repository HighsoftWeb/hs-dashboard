import Cookies from "js-cookie";

const COD_EMPRESA_COOKIE_NAME = "cod_empresa";
const COOKIE_EXPIRES_DAYS = 365 * 10;
const RADIX_DECIMAL = 10;

function validarCodEmpresa(codEmpresa: number): boolean {
  return (
    typeof codEmpresa === "number" &&
    Number.isInteger(codEmpresa) &&
    codEmpresa > 0
  );
}

export function salvarCodEmpresaNoCookie(codEmpresa: number): void {
  if (!validarCodEmpresa(codEmpresa)) {
    return;
  }

  Cookies.set(COD_EMPRESA_COOKIE_NAME, codEmpresa.toString(RADIX_DECIMAL), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: "strict",
    path: "/",
  });
}

export function obterCodEmpresaDoCookie(): number | null {
  const codEmpresaStr = Cookies.get(COD_EMPRESA_COOKIE_NAME);

  if (!codEmpresaStr) {
    return null;
  }

  const codEmpresa = parseInt(codEmpresaStr, RADIX_DECIMAL);

  return validarCodEmpresa(codEmpresa) ? codEmpresa : null;
}

export function removerCodEmpresaDoCookie(): void {
  Cookies.remove(COD_EMPRESA_COOKIE_NAME);
}
