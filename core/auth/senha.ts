import { hsCriptografa, hsDesCriptografa } from "./hs-criptografia";

export function validarSenhaHS(
  senha: string,
  senhaArmazenada: string,
  indCriptografado: string
): boolean {
  if (indCriptografado === "S") {
    const senhaDescriptografada = hsDesCriptografa(senhaArmazenada);
    return senha === senhaDescriptografada;
  }

  const senhaCriptografada = hsCriptografa(senha);
  return senhaCriptografada === senhaArmazenada;
}

export function criptografarSenhaHS(senha: string): string {
  return hsCriptografa(senha);
}

export function descriptografarSenhaHS(senhaCriptografada: string): string {
  return hsDesCriptografa(senhaCriptografada);
}
