"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { servicoAutenticacao } from "@/core/domains/auth/client/auth-client";
import { CredenciaisLogin } from "@/core/tipos";
import { Botao } from "@/core/componentes/botao/botao";
import {
  obterCnpjDoCookie,
  salvarCnpjNoCookie,
  removerCnpjDoCookie,
} from "@/core/utils/cnpj-cookie";
import {
  obterCodEmpresaDoCookie,
  salvarCodEmpresaNoCookie,
} from "@/core/utils/cod-empresa-cookie";
import { formatarCnpj, validarELimparCnpj } from "@/core/utils/cnpj-utils";
import { clienteHttp } from "@/core/http/cliente-http";
import { Building2, Lock, User, Loader2 } from "lucide-react";
import type { EmpresaBanco } from "@/core/tipos/empresa-banco";
import { logger } from "@/core/utils/logger";

const TOKEN_REVOGADO_KEY = "tokenRevogado";
const MENSAGEM_REVOGACAO_KEY = "mensagemRevogacao";

export default function PaginaLogin(): React.JSX.Element {
  const router = useRouter();
  const [cnpj, setCnpj] = useState<string>("");
  const [cnpjValidado, setCnpjValidado] = useState<boolean>(false);
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");
  const [credenciais, setCredenciais] = useState<CredenciaisLogin>({
    login: "",
    senha: "",
  });
  const [erro, setErro] = useState<string>("");
  const [isTokenRevogado, setIsTokenRevogado] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [validandoCnpj, setValidandoCnpj] = useState<boolean>(false);
  const [carregandoInicial, setCarregandoInicial] = useState<boolean>(true);

  const limparEstadoLogin = useCallback((): void => {
    removerCnpjDoCookie();
    setCnpj("");
    setCnpjValidado(false);
    setNomeEmpresa("");
    setCredenciais({ login: "", senha: "" });
    setErro("");
    setIsTokenRevogado(false);
  }, []);

  const validarCnpjAutomatico = useCallback(
    async (cnpjParaValidar: string): Promise<void> => {
      setValidandoCnpj(true);
      setErro("");

      try {
        const cnpjLimpo = validarELimparCnpj(cnpjParaValidar);
        if (!cnpjLimpo) {
          limparEstadoLogin();
          setCarregandoInicial(false);
          return;
        }

        const resposta = await clienteHttp.get<{ nomeEmpresa: string }>(
          `/admin/empresas/cnpj/${cnpjLimpo}`
        );

        if (!resposta.success || !resposta.data) {
          limparEstadoLogin();
          setCarregandoInicial(false);
          return;
        }

        setNomeEmpresa(resposta.data.nomeEmpresa || "");
        setCnpjValidado(true);
        salvarCnpjNoCookie(cnpjLimpo);
      } catch (err) {
        setCarregandoInicial(false);
        logger.error("Erro ao validar CNPJ", err, {
          endpoint: "/login",
          method: "validarCnpj",
        });
        limparEstadoLogin();
        setErro(err instanceof Error ? err.message : "Erro ao validar CNPJ");
      } finally {
        setValidandoCnpj(false);
        setCarregandoInicial(false);
      }
    },
    [limparEstadoLogin]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const verificarTokenRevogado = (): void => {
      const tokenRevogado = sessionStorage.getItem(TOKEN_REVOGADO_KEY);
      const mensagemRevogacao = sessionStorage.getItem(MENSAGEM_REVOGACAO_KEY);
      if (tokenRevogado === "true") {
        setErro(
          mensagemRevogacao ||
            "Outro usuário acessou o sistema. Você foi desconectado."
        );
        setIsTokenRevogado(true);
        setTimeout(() => {
          sessionStorage.removeItem(TOKEN_REVOGADO_KEY);
          sessionStorage.removeItem(MENSAGEM_REVOGACAO_KEY);
        }, 100);
      }
    };
    verificarTokenRevogado();
  }, []);

  useEffect(() => {
    const cnpjSalvo = obterCnpjDoCookie();
    if (cnpjSalvo) {
      setCnpj(cnpjSalvo);
      validarCnpjAutomatico(cnpjSalvo);
    } else {
      setCarregandoInicial(false);
    }
  }, [validarCnpjAutomatico]);

  const handleValidarCnpj = async (
    evento: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    evento.preventDefault();
    setErro("");
    setValidandoCnpj(true);

    try {
      const cnpjLimpo = validarELimparCnpj(cnpj);
      if (!cnpjLimpo) {
        setErro("CNPJ inválido. Deve conter 14 dígitos.");
        setValidandoCnpj(false);
        return;
      }

      const resposta = await clienteHttp.get<{ nomeEmpresa: string }>(
        `/admin/empresas/cnpj/${cnpjLimpo}`
      );

      if (!resposta.success || !resposta.data) {
        throw new Error(
          resposta.error?.message || "Empresa não encontrada"
        );
      }

      setNomeEmpresa(resposta.data.nomeEmpresa || "");
      salvarCnpjNoCookie(cnpjLimpo);
      setCnpjValidado(true);
    } catch (erroValidacao) {
      setErro(
        erroValidacao instanceof Error
          ? erroValidacao.message
          : "Erro ao validar CNPJ"
      );
    } finally {
      setValidandoCnpj(false);
    }
  };

  const handleSubmit = async (
    evento: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    evento.preventDefault();
    setErro("");
    setIsTokenRevogado(false);
    setCarregando(true);

    try {
      const cnpjLimpo = validarELimparCnpj(cnpj);
      if (!cnpjLimpo) {
        setErro("CNPJ inválido.");
        setCarregando(false);
        return;
      }

      const resposta = await clienteHttp.get<EmpresaBanco[]>(
        `/admin/empresas/cnpj/${cnpjLimpo}/empresas-banco`
      );

      if (!resposta.success || !resposta.data?.length) {
        setErro("Empresa não encontrada ou sem empresas ativas.");
        setCarregando(false);
        return;
      }

      const codEmpresaSalvo = obterCodEmpresaDoCookie();
      const empresaValida = resposta.data.find(
        (e) => e.COD_EMPRESA === codEmpresaSalvo
      );
      const codEmpresa =
        empresaValida?.COD_EMPRESA ?? resposta.data[0].COD_EMPRESA;

      await servicoAutenticacao.fazerLogin({
        ...credenciais,
        codEmpresa,
        cnpj: cnpjLimpo,
      });

      salvarCnpjNoCookie(cnpjLimpo);
      salvarCodEmpresaNoCookie(codEmpresa);
      router.push("/dashboard");
    } catch (erroLogin) {
      logger.error("Erro no login", erroLogin);
      setErro(
        erroLogin instanceof Error
          ? erroLogin.message
          : "Erro ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoInicial) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04B2D9]/10 via-[#048ABF]/10 to-[#094A73]/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#04B2D9] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#048ABF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#094A73] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-[#094A73] relative z-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04B2D9]/10 via-[#048ABF]/10 to-[#094A73]/10 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#04B2D9] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#048ABF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#094A73] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="HighSoft"
                width={220}
                height={64}
                className="h-16 w-auto max-w-full object-contain"
                unoptimized
              />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">
              Plataforma Analítica
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {cnpjValidado
                ? "Entre com suas credenciais"
                : "Informe o CNPJ da empresa"}
            </p>
          </div>

          {!cnpjValidado ? (
            <form className="space-y-5" onSubmit={handleValidarCnpj}>
              {(erro || isTokenRevogado) && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    isTokenRevogado
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {erro}
                </div>
              )}

              {validandoCnpj && (
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-highsoft-primario" />
                  <span className="text-sm text-slate-600">
                    Validando CNPJ...
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  CNPJ da Empresa
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formatarCnpj(cnpj)}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 14);
                      setCnpj(v);
                    }}
                    placeholder="00.000.000/0000-00"
                    disabled={validandoCnpj}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-highsoft-primario/20 focus:border-highsoft-primario outline-none transition disabled:bg-slate-50"
                  />
                </div>
              </div>

              <Botao
                type="submit"
                variante="primario"
                tamanho="grande"
                carregando={validandoCnpj}
                className="w-full font-medium py-3 rounded-lg"
              >
                {validandoCnpj ? "Validando..." : "Continuar"}
              </Botao>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {(erro || isTokenRevogado) && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    isTokenRevogado
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {erro}
                </div>
              )}

              {nomeEmpresa && (
                <div className="rounded-lg p-3 bg-slate-50 border border-slate-200">
                  <p className="text-sm font-medium text-slate-800">
                    {nomeEmpresa}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={credenciais.login}
                    onChange={(e) =>
                      setCredenciais({ ...credenciais, login: e.target.value })
                    }
                    placeholder="Login"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-highsoft-primario/20 focus:border-highsoft-primario outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={credenciais.senha}
                    onChange={(e) =>
                      setCredenciais({ ...credenciais, senha: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-highsoft-primario/20 focus:border-highsoft-primario outline-none transition"
                  />
                </div>
              </div>

              <Botao
                type="submit"
                variante="primario"
                tamanho="grande"
                carregando={carregando}
                className="w-full font-medium py-3 rounded-lg"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Botao>

              <div className="text-center">
                <button
                  type="button"
                  onClick={limparEstadoLogin}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Trocar empresa
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            © HighSoft Sistemas
          </p>
        </div>
      </div>
    </div>
  );
}
