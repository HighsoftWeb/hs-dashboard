import { BaseHttpService } from "./base-http-service";
import { HttpClient } from "../client/http-client";
import { Cliente } from "@/core/tipos/comercial";

/**
 * Serviço HTTP para gerenciamento de clientes
 */
export class ClienteHttpService extends BaseHttpService<
  Cliente,
  Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">,
  Partial<Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, "/comercial/clientes", {
      dateFields: ["criadoEm", "atualizadoEm"],
    });
  }

  protected getEntityName(): string {
    return "cliente";
  }
}
