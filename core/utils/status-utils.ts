export function obterStatus(sit: string | null | undefined): string {
  if (!sit) return "-";
  const status: Record<string, string> = {
    AB: "Aberto",
    AP: "Aprovado",
    PR: "Processado",
    CA: "Cancelado",
    RO: "Romaneio",
    AA: "Aguardando Aprovação",
    FP: "Faturado Parcial",
    OP: "Ordem de Produção",
    DG: "Digitada",
  };
  return status[String(sit)] || String(sit);
}

export function obterCorStatus(sit: string | null | undefined): string {
  if (!sit) return "bg-gray-100 text-gray-800";
  const sitUpper = String(sit).toUpperCase();
  if (sitUpper === "AP" || sitUpper === "PR") {
    return "bg-blue-100 text-blue-800";
  }
  if (sitUpper === "CA") {
    return "bg-red-100 text-red-800";
  }
  return "bg-yellow-100 text-yellow-800";
}
