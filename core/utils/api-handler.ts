/**
 * Utilitário para padronizar handlers de API
 * Facilita tratamento de erros e autenticação consistente
 */

import { NextRequest, NextResponse } from "next/server";
import { tratarErroAPI } from "./tratar-erro";
import { validarAutenticacao } from "../middleware/auth-middleware";

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: T | { params?: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export interface OpcoesHandler {
  requerAutenticacao?: boolean;
}

/**
 * Cria um handler de API com tratamento de erros padronizado
 * e opcionalmente valida autenticação
 */
export function criarHandler<T = unknown>(
  handler: ApiHandler<T>,
  opcoes?: OpcoesHandler
): ApiHandler<T> {
  return async (
    request: NextRequest,
    context?: T | { params?: Promise<Record<string, string>> }
  ) => {
    try {
      if (opcoes?.requerAutenticacao) {
        validarAutenticacao(request);
      }
      return await handler(request, context as T);
    } catch (erro) {
      return tratarErroAPI(erro, {
        endpoint: request.nextUrl.pathname,
        method: request.method,
      });
    }
  };
}

/**
 * Wrapper para rotas GET
 */
export function criarHandlerGET(
  handler: ApiHandler,
  opcoes?: OpcoesHandler
): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
  return criarHandler(handler, opcoes);
}

/**
 * Wrapper para rotas POST
 */
export function criarHandlerPOST(
  handler: ApiHandler,
  opcoes?: OpcoesHandler
): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
  return criarHandler(handler, opcoes);
}

/**
 * Wrapper para rotas PUT
 */
export function criarHandlerPUT(
  handler: ApiHandler,
  opcoes?: OpcoesHandler
): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
  return criarHandler(handler, opcoes);
}

/**
 * Wrapper para rotas DELETE
 */
export function criarHandlerDELETE(
  handler: ApiHandler,
  opcoes?: OpcoesHandler
): (request: NextRequest, context?: unknown) => Promise<NextResponse> {
  return criarHandler(handler, opcoes);
}
