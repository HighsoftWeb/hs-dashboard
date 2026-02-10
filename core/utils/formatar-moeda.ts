/**
 * Formata um número como moeda brasileira (BRL).
 * Retorna "-" quando valor for null/undefined.
 */
export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
