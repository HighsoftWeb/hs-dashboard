import moment from "moment";

moment.locale("pt-br");

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param data - Data a ser formatada (Date, string ou null/undefined)
 * @returns String formatada ou "-" se a data for inválida
 */
export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("DD/MM/YYYY");
}

/**
 * Formata uma data com hora para o formato brasileiro (DD/MM/YYYY HH:mm)
 * @param data - Data a ser formatada (Date, string ou null/undefined)
 * @returns String formatada ou "-" se a data for inválida
 */
export function formatarDataHora(
  data: Date | string | null | undefined
): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("DD/MM/YYYY HH:mm");
}

/**
 * Formata apenas a hora (HH:mm)
 * @param data - Data a ser formatada (Date, string ou null/undefined)
 * @returns String formatada ou "-" se a data for inválida
 */
export function formatarHora(data: Date | string | null | undefined): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("HH:mm");
}
