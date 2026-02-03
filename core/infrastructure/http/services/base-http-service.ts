import { HttpClient } from "../client/http-client";
import { RespostaApi } from "@/core/tipos/resposta-api";
import { HttpServiceError } from "../exceptions/http-service-error";

export interface BaseServiceOptions {
  dateFields?: string[];
  transformResponse?: <T>(data: T) => T;
}

/**
 * Classe base abstrata para serviços HTTP
 * Elimina duplicação de código entre serviços similares
 */
export abstract class BaseHttpService<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
> {
  protected readonly dateFields: string[];

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly basePath: string,
    options: BaseServiceOptions = {}
  ) {
    this.dateFields = options.dateFields || ["criadoEm", "atualizadoEm"];
  }

  /**
   * Lista todas as entidades
   */
  async listar(): Promise<TEntity[]> {
    const response = await this.httpClient.get<TEntity[]>(this.basePath);

    this.validateResponse(response, "listar");

    const data = response.data as TEntity[];
    return this.transformDates(data) as TEntity[];
  }

  /**
   * Obtém uma entidade por ID
   */
  async obterPorId(id: string | number): Promise<TEntity> {
    const response = await this.httpClient.get<TEntity>(
      `${this.basePath}/${id}`
    );

    this.validateResponse(response, "obter");

    const data = response.data as TEntity;
    return this.transformDates(data) as TEntity;
  }

  /**
   * Cria uma nova entidade
   */
  async criar(dados: TCreateDto): Promise<TEntity> {
    const response = await this.httpClient.post<TEntity>(this.basePath, dados);

    this.validateResponse(response, "criar");

    const data = response.data as TEntity;
    return this.transformDates(data) as TEntity;
  }

  /**
   * Atualiza uma entidade existente
   */
  async atualizar(id: string | number, dados: TUpdateDto): Promise<TEntity> {
    const response = await this.httpClient.put<TEntity>(
      `${this.basePath}/${id}`,
      dados
    );

    this.validateResponse(response, "atualizar");

    const data = response.data as TEntity;
    return this.transformDates(data) as TEntity;
  }

  /**
   * Exclui uma entidade
   */
  async excluir(id: string | number): Promise<void> {
    const response = await this.httpClient.delete<void>(
      `${this.basePath}/${id}`
    );

    if (!response.success) {
      throw new HttpServiceError(
        response.error?.message || `Erro ao excluir ${this.getEntityName()}`,
        response.error?.code
      );
    }
  }

  /**
   * Transforma campos de data de string para Date
   */
  protected transformDates(data: TEntity | TEntity[]): TEntity | TEntity[] {
    if (Array.isArray(data)) {
      return data.map((item) =>
        this.transformSingleDate(item as Record<string, unknown>)
      ) as TEntity[];
    }
    return this.transformSingleDate(data as Record<string, unknown>);
  }

  /**
   * Transforma datas de um único objeto
   */
  protected transformSingleDate(item: Record<string, unknown>): TEntity {
    const transformed = { ...item };
    this.dateFields.forEach((field) => {
      if (transformed[field] && typeof transformed[field] === "string") {
        transformed[field] = new Date(transformed[field] as string);
      }
    });
    return transformed as TEntity;
  }

  /**
   * Valida resposta HTTP
   */
  protected validateResponse(
    response: RespostaApi<unknown>,
    action: string
  ): void {
    if (!response.success || !response.data) {
      throw new HttpServiceError(
        response.error?.message || `Erro ao ${action} ${this.getEntityName()}`,
        response.error?.code
      );
    }
  }

  /**
   * Retorna o nome da entidade (para mensagens de erro)
   * Deve ser implementado pelas classes filhas
   */
  protected abstract getEntityName(): string;
}
