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

interface CoresEmpresa {
  primaria: string;
  secundaria: string;
  terciaria: string;
}

function aplicarCoresNoDocumento(cores: CoresEmpresa): void {
  const root = document.documentElement;
  root.style.setProperty("--highsoft-primario", cores.primaria);
  root.style.setProperty("--highsoft-primario-hover", cores.primaria + "ee");
  root.style.setProperty("--highsoft-secundario", cores.secundaria);
  root.style.setProperty("--highsoft-terciario", cores.terciaria);
}

export default function PaginaLogin(): React.JSX.Element {
  const router = useRouter();
  const [cnpj, setCnpj] = useState<string>("");
  const [cnpjValidado, setCnpjValidado] = useState<boolean>(false);
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");
  const [coresEmpresa, setCoresEmpresa] = useState<CoresEmpresa | null>(null);
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
    setCoresEmpresa(null);
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

        const resposta = await clienteHttp.get<{
          nomeEmpresa: string;
          corPrimaria?: string;
          corSecundaria?: string;
          corTerciaria?: string;
        }>(`/admin/empresas/cnpj/${cnpjLimpo}`);

        if (!resposta.success || !resposta.data) {
          limparEstadoLogin();
          setCarregandoInicial(false);
          return;
        }

        const d = resposta.data;
        setNomeEmpresa(d.nomeEmpresa || "");
        if (d.corPrimaria && d.corSecundaria && d.corTerciaria) {
          setCoresEmpresa({
            primaria: d.corPrimaria,
            secundaria: d.corSecundaria,
            terciaria: d.corTerciaria,
          });
        }
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

  useEffect(() => {
    if (coresEmpresa) {
      aplicarCoresNoDocumento(coresEmpresa);
    } else {
      aplicarCoresNoDocumento({
        primaria: "#64748b",
        secundaria: "#94a3b8",
        terciaria: "#cbd5e1",
      });
    }
  }, [coresEmpresa]);

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

      const resposta = await clienteHttp.get<{
        nomeEmpresa: string;
        corPrimaria?: string;
        corSecundaria?: string;
        corTerciaria?: string;
      }>(`/admin/empresas/cnpj/${cnpjLimpo}`);

      if (!resposta.success || !resposta.data) {
        throw new Error(resposta.error?.message || "Empresa não encontrada");
      }

      const d = resposta.data;
      setNomeEmpresa(d.nomeEmpresa || "");
      if (d.corPrimaria && d.corSecundaria && d.corTerciaria) {
        setCoresEmpresa({
          primaria: d.corPrimaria,
          secundaria: d.corSecundaria,
          terciaria: d.corTerciaria,
        });
      }
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

  const cores = coresEmpresa ?? {
    primaria: "#64748b",
    secundaria: "#94a3b8",
    terciaria: "#cbd5e1",
  };
  const bgGradient = {
    background: `linear-gradient(to bottom right, ${cores.terciaria}1a, ${cores.secundaria}1a, ${cores.primaria}1a)`,
  };
  const blobStyle = (c: string, opacity: number) => ({
    background: c,
    opacity,
  });

  if (carregandoInicial) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center overflow-hidden"
        style={bgGradient}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob"
            style={blobStyle(cores.terciaria, 0.2)}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
            style={blobStyle(cores.secundaria, 0.2)}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
            style={blobStyle(cores.primaria, 0.15)}
          />
        </div>
        <Loader2
          className="w-8 h-8 animate-spin relative z-10"
          style={{ color: cores.primaria }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden px-4"
      style={bgGradient}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob"
          style={blobStyle(cores.terciaria, 0.2)}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
          style={blobStyle(cores.secundaria, 0.2)}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
          style={blobStyle(cores.primaria, 0.15)}
        />
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
