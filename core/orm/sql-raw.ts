import { AppDataSource, inicializarDataSource } from "./data-source";

export async function executarSQL<T extends Record<string, string | number | boolean | Date | null>>(
  query: string,
  parametros?: Array<string | number | boolean | Date | null>
): Promise<T[]> {
  await inicializarDataSource();
  return AppDataSource.query(query, parametros || []);
}

export async function executarSQLComParametros<T extends Record<string, string | number | boolean | Date | null>>(
  query: string,
  parametros?: Record<string, string | number | boolean | Date | null>
): Promise<T[]> {
  await inicializarDataSource();
  
  if (!parametros) {
    return AppDataSource.query(query);
  }

  let queryFinal = query;
  const valores: Array<string | number | boolean | Date | null> = [];
  let index = 0;

  Object.entries(parametros).forEach(([chave, valor]) => {
    const placeholder = `@${chave}`;
    if (queryFinal.includes(placeholder)) {
      queryFinal = queryFinal.replace(new RegExp(`@${chave}`, "g"), `@p${index}`);
      valores.push(valor);
      index++;
    }
  });

  return AppDataSource.query(queryFinal, valores);
}
