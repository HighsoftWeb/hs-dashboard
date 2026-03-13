import { coresHighSoft } from "@/core/temas/cores-highsoft";

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
