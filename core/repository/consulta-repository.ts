import { poolBanco } from "../db/pool-banco";
import { ParametrosConsulta } from "../schemas/consulta-schemas";
import { PAGINACAO_PADRAO } from "../constants/paginacao";

interface ResultadoConsulta<T> {
  dados: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ConsultaRepository {
  async consultar<T>(
    tabela: string,
    colunas: string[],
    parametros: ParametrosConsulta,
    codEmpresa?: number,
    filtrosAdicionais?: Record<string, unknown>
  ): Promise<ResultadoConsulta<T>> {
    const page = parametros.page || PAGINACAO_PADRAO.PAGE_DEFAULT;
    const pageSize = Math.min(
      parametros.pageSize || PAGINACAO_PADRAO.PAGE_SIZE,
      PAGINACAO_PADRAO.PAGE_SIZE_MAX
    );
    const offset = (page - 1) * pageSize;

    let whereConditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (codEmpresa) {
      whereConditions.push("COD_EMPRESA = @codEmpresa");
      params.codEmpresa = codEmpresa;
    }

    if (parametros.search) {
      const colunasBusca = colunas.filter((col) =>
        ["RAZ_", "NOM_", "DES_", "FAN_", "ABR_", "CGC_CPF", "CGC_", "NUM_", "END_", "MAI_"].some(
          (prefixo) => col.startsWith(prefixo)
        )
      );

      if (colunasBusca.length > 0) {
        const condicoesBusca = colunasBusca
          .map((col) => `${col} LIKE @search`)
          .join(" OR ");
        whereConditions.push(`(${condicoesBusca})`);
        params.search = `%${parametros.search}%`;
      }
    }

    if (filtrosAdicionais) {
      Object.entries(filtrosAdicionais).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") {
          const nomeParam = chave.replace(/[^a-zA-Z0-9]/g, "_");
          if (
            typeof valor === "object" &&
            valor !== null &&
            !Array.isArray(valor) &&
            ("gte" in valor || "lte" in valor)
          ) {
            if ("gte" in valor && valor.gte) {
              whereConditions.push(`${chave} >= @${nomeParam}_gte`);
              params[`${nomeParam}_gte`] = valor.gte;
            }
            if ("lte" in valor && valor.lte) {
              whereConditions.push(`${chave} <= @${nomeParam}_lte`);
              params[`${nomeParam}_lte`] = valor.lte;
            }
          } else {
            whereConditions.push(`${chave} = @${nomeParam}`);
            params[nomeParam] = valor;
          }
        }
      });
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    let orderBy = "";
    if (parametros.sort) {
      const colunaValida = colunas.find((col) => col === parametros.sort);
      if (colunaValida) {
        const ordem = parametros.order === "desc" ? "DESC" : "ASC";
        orderBy = `ORDER BY ${colunaValida} ${ordem}`;
      }
    }

    if (!orderBy && colunas.length > 0) {
      orderBy = `ORDER BY ${colunas[0]} ASC`;
    }

    const queryCount = `
      SELECT COUNT(*) as total
      FROM dbo.${tabela}
      ${whereClause}
    `;

    const queryData = `
      SELECT ${colunas.join(", ")}
      FROM dbo.${tabela}
      ${whereClause}
      ${orderBy}
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY
    `;

    params.offset = offset;
    params.pageSize = pageSize;

    const [resultadoCount, resultadoData] = await Promise.all([
      poolBanco.executarConsulta<{ total: number }>(queryCount, params),
      poolBanco.executarConsulta<T>(queryData, params),
    ]);

    return {
      dados: resultadoData,
      total: resultadoCount[0]?.total || 0,
      page,
      pageSize,
    };
  }
}

export const consultaRepository = new ConsultaRepository();
