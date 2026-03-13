/**
 * Cores do tema HighSoft para gráficos (Recharts precisa de hex)
 * Consistente com globals.css e tema da aplicação
 */
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

/**
 * Gera objeto de cores para gráficos com cores personalizadas da empresa.
 * Use em dashboards dentro do EmpresaProvider.
 */
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
