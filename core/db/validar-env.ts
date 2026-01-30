const variaveisObrigatorias = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "DEFAULT_COD_EMPRESA",
] as const;

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
