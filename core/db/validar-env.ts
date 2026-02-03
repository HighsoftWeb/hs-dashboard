const variaveisObrigatorias = ["JWT_SECRET"] as const;

export function validarVariaveisAmbiente(): void {
  const variaveisFaltantes: string[] = [];

  for (const variavel of variaveisObrigatorias) {
    if (!process.env[variavel]) {
      variaveisFaltantes.push(variavel);
    }
  }

  if (variaveisFaltantes.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não definidas: ${variaveisFaltantes.join(", ")}`
    );
  }
}

export const DEFAULT_COD_EMPRESA = parseInt(
  process.env.DEFAULT_COD_EMPRESA || "1",
  10
);
