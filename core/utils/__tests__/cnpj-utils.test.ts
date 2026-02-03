import {
  limparCnpj,
  validarFormatoCnpj,
  validarDigitosVerificadoresCnpj,
  validarCnpjCompleto,
  validarELimparCnpj,
} from "../cnpj-utils";

describe("CNPJ Utils", () => {
  const CNPJ_VALIDO = "11.222.333/0001-81";
  const CNPJ_VALIDO_LIMPO = "11222333000181";
  const CNPJ_INVALIDO = "11.222.333/0001-00";

  describe("limparCnpj", () => {
    it("deve remover caracteres não numéricos", () => {
      expect(limparCnpj(CNPJ_VALIDO)).toBe(CNPJ_VALIDO_LIMPO);
    });

    it("deve retornar string vazia para entrada inválida", () => {
      expect(limparCnpj("")).toBe("");
      expect(limparCnpj(null as unknown as string)).toBe("");
    });
  });

  describe("validarFormatoCnpj", () => {
    it("deve validar CNPJ com formato correto", () => {
      expect(validarFormatoCnpj(CNPJ_VALIDO)).toBe(true);
      expect(validarFormatoCnpj(CNPJ_VALIDO_LIMPO)).toBe(true);
    });

    it("deve rejeitar CNPJ com formato incorreto", () => {
      expect(validarFormatoCnpj("123")).toBe(false);
      expect(validarFormatoCnpj("123456789012345")).toBe(false);
    });
  });

  describe("validarDigitosVerificadoresCnpj", () => {
    it("deve validar dígitos verificadores corretos", () => {
      expect(validarDigitosVerificadoresCnpj(CNPJ_VALIDO)).toBe(true);
    });

    it("deve rejeitar CNPJ com dígitos verificadores incorretos", () => {
      expect(validarDigitosVerificadoresCnpj(CNPJ_INVALIDO)).toBe(false);
    });

    it("deve rejeitar CNPJ com todos dígitos iguais", () => {
      expect(validarDigitosVerificadoresCnpj("11111111111111")).toBe(false);
    });
  });

  describe("validarCnpjCompleto", () => {
    it("deve validar CNPJ completo válido", () => {
      expect(validarCnpjCompleto(CNPJ_VALIDO)).toBe(true);
    });

    it("deve rejeitar CNPJ inválido", () => {
      expect(validarCnpjCompleto(CNPJ_INVALIDO)).toBe(false);
      expect(validarCnpjCompleto("123")).toBe(false);
    });
  });

  describe("validarELimparCnpj", () => {
    it("deve retornar CNPJ limpo para CNPJ válido", () => {
      const resultado = validarELimparCnpj(CNPJ_VALIDO, { validarDigitos: true });
      expect(resultado).toBe(CNPJ_VALIDO_LIMPO);
    });

    it("deve retornar null para CNPJ inválido", () => {
      expect(validarELimparCnpj(CNPJ_INVALIDO, { validarDigitos: true })).toBeNull();
      expect(validarELimparCnpj("123", { validarDigitos: false })).toBeNull();
    });
  });
});
