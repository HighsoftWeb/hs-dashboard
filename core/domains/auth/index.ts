/**
 * Módulo de Autenticação
 * 
 * Estrutura:
 * - client/: Serviços do lado do cliente (chamadas HTTP)
 * - server/: Serviços do lado do servidor (lógica de negócio)
 * - jwt/: Utilitários JWT (geração, validação, refresh tokens)
 */

export { servicoAutenticacao } from "./client/auth-client";
export { autenticacaoService } from "./server/auth-service";
export type { DadosLogin, DadosAutenticacao } from "./server/auth-service";
