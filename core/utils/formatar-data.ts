import moment from "moment";

moment.locale("pt-br");

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("DD/MM/YYYY");
}

export function formatarDataHora(
  data: Date | string | null | undefined
): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("DD/MM/YYYY HH:mm");
}

export function formatarHora(data: Date | string | null | undefined): string {
  if (!data) return "-";

  const momento = moment(data);

  if (!momento.isValid()) return "-";

  return momento.format("HH:mm");
}
