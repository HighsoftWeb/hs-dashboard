import { BaseHttpService } from "./base-http-service";
import { HttpClient } from "../client/http-client";
import { Pedido } from "@/core/tipos/comercial";

/**
 * Serviço HTTP para gerenciamento de pedidos
 */
export class PedidoHttpService extends BaseHttpService<
  Pedido,
  Omit<Pedido, "id" | "criadoEm" | "atualizadoEm">,
  Partial<Omit<Pedido, "id" | "criadoEm" | "atualizadoEm">>
> {
  constructor(httpClient: HttpClient) {
    super(httpClient, "/comercial/pedidos", {
      dateFields: ["data", "criadoEm", "atualizadoEm"],
    });
  }

  protected getEntityName(): string {
    return "pedido";
  }
}
