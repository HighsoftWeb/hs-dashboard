/**
 * Utilitários para manipulação e validação de CNPJ
 */

const CNPJ_LENGTH = 14;
const CNPJ_NUMBERS_ONLY_REGEX = /^\d{14}$/;

/**
 * Remove caracteres não numéricos do CNPJ
 */
export function limparCnpj(cnpj: string): string {
  if (!cnpj || typeof cnpj !== "string") {
    return "";
  }
  return cnpj.replace(/\D/g, "");
}

/**
 * Valida se o CNPJ tem o formato correto (14 dígitos)
 */
export function validarFormatoCnpj(cnpj: string): boolean {
  const cnpjLimpo = limparCnpj(cnpj);
  return cnpjLimpo.length === CNPJ_LENGTH && CNPJ_NUMBERS_ONLY_REGEX.test(cnpjLimpo);
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export function formatarCnpj(cnpj: string): string {
  const cnpjLimpo = limparCnpj(cnpj);
  
  if (cnpjLimpo.length !== CNPJ_LENGTH) {
    return cnpj;
  }
  
  return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/**
 * Valida e limpa CNPJ, retornando o CNPJ limpo ou null se inválido
 */
export function validarELimparCnpj(cnpj: string | null | undefined): string | null {
  if (!cnpj || typeof cnpj !== "string") {
    return null;
  }
  
  const cnpjLimpo = limparCnpj(cnpj);
  
  if (!validarFormatoCnpj(cnpjLimpo)) {
    return null;
  }
  
  return cnpjLimpo;
}
