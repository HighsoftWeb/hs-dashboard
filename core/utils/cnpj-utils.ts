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
  return (
    cnpjLimpo.length === CNPJ_LENGTH && CNPJ_NUMBERS_ONLY_REGEX.test(cnpjLimpo)
  );
}

/**
 * Valida os dígitos verificadores do CNPJ
 * Implementa o algoritmo oficial de validação de CNPJ
 */
export function validarDigitosVerificadoresCnpj(cnpj: string): boolean {
  const cnpjLimpo = limparCnpj(cnpj);

  if (cnpjLimpo.length !== CNPJ_LENGTH) {
    return false;
  }

  if (/^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) {
    return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1), 10)) {
    return false;
  }

  return true;
}

/**
 * Validação completa de CNPJ (formato + dígitos verificadores)
 */
export function validarCnpjCompleto(cnpj: string): boolean {
  if (!validarFormatoCnpj(cnpj)) {
    return false;
  }
  return validarDigitosVerificadoresCnpj(cnpj);
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export function formatarCnpj(cnpj: string): string {
  const cnpjLimpo = limparCnpj(cnpj);

  if (cnpjLimpo.length !== CNPJ_LENGTH) {
    return cnpj;
  }

  return cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Valida e limpa CNPJ, retornando o CNPJ limpo ou null se inválido
 * Por padrão, valida apenas formato. Use validarDigitos: true para validação completa.
 */
export function validarELimparCnpj(
  cnpj: string | null | undefined,
  opcoes?: { validarDigitos?: boolean }
): string | null {
  if (!cnpj || typeof cnpj !== "string") {
    return null;
  }

  const cnpjLimpo = limparCnpj(cnpj);

  if (!validarFormatoCnpj(cnpjLimpo)) {
    return null;
  }

  if (opcoes?.validarDigitos && !validarDigitosVerificadoresCnpj(cnpjLimpo)) {
    return null;
  }

  return cnpjLimpo;
}
