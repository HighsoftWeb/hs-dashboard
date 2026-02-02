declare module "jsonwebtoken" {
  export interface SignOptions {
    expiresIn?: string | number;
    algorithm?: string;
    [key: string]: unknown;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    [key: string]: unknown;
  }

  export class JsonWebTokenError extends Error {
    name: string;
    message: string;
  }

  export class TokenExpiredError extends JsonWebTokenError {
    expiredAt: Date;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): string | object;

  export function decode(
    token: string,
    options?: { complete?: boolean; json?: boolean }
  ): string | object | null;
}
