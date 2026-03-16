import { coresHighSoft } from "@/core/temas/cores-highsoft";

export const CORES_FINANCEIRAS = {
  receita: "#3b82f6",
  despesa: "#ef4444",
  lucro: "#22c55e",
  positivo: "#3b82f6",
  negativo: "#ef4444",
} as const;

export function obterCorFinanceira(
  tipo: "receita" | "despesa" | "lucro" | "positivo" | "negativo"
): string {
  return CORES_FINANCEIRAS[tipo];
}

export function obterCorPorNomeGrafico(nome: string, valor?: number): string {
  const n = (nome || "").toLowerCase();
  if (n.includes("lucro")) {
    return valor !== undefined && valor < 0
      ? CORES_FINANCEIRAS.negativo
      : CORES_FINANCEIRAS.lucro;
  }
  if (n.includes("receita") || n.includes("receber")) {
    return valor !== undefined && valor < 0
      ? CORES_FINANCEIRAS.negativo
      : CORES_FINANCEIRAS.receita;
  }
  if (n.includes("despesa") || n.includes("pagar"))
    return CORES_FINANCEIRAS.despesa;
  return valor !== undefined && valor < 0
    ? CORES_FINANCEIRAS.negativo
    : CORES_FINANCEIRAS.positivo;
}

export const CORES_GRAFICOS = {
  primario: coresHighSoft.primario,
  secundario: coresHighSoft.secundario,
  terciario: coresHighSoft.terciario,
  sucesso: coresHighSoft.sucesso,
  erro: coresHighSoft.erro,
  aviso: coresHighSoft.aviso,
} as const;

export type CoresGraficos = typeof CORES_GRAFICOS;

export function obterCoresGraficos(coresEmpresa?: {
  primaria: string;
  secundaria: string;
  terciaria: string;
}): CoresGraficos {
  if (!coresEmpresa) return CORES_GRAFICOS;
  return {
    ...CORES_GRAFICOS,
    primario: coresEmpresa.primaria,
    secundario: coresEmpresa.secundaria,
    terciario: coresEmpresa.terciaria,
  };
}
