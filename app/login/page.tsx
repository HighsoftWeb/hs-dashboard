"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { servicoAutenticacao } from "@/core/autenticacao/servico-autenticacao";
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
  removerCodEmpresaDoCookie,
} from "@/core/utils/cod-empresa-cookie";
import { formatarCnpj, validarELimparCnpj } from "@/core/utils/cnpj-utils";
import { clienteHttp } from "@/core/http/cliente-http";
import { ArrowDown, Building2, Lock, User, Loader2 } from "lucide-react";
import type { EmpresaBanco } from "@/core/tipos/empresa-banco";

export default function PaginaLogin(): React.JSX.Element {
  const router = useRouter();
  const [cnpj, setCnpj] = useState<string>("");
  const [cnpjValidado, setCnpjValidado] = useState<boolean>(false);
  const [empresasBanco, setEmpresasBanco] = useState<EmpresaBanco[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState<boolean>(false);
  const [credenciais, setCredenciais] = useState<CredenciaisLogin>({
    login: "",
    senha: "",
    codEmpresa: undefined,
  });
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const [validandoCnpj, setValidandoCnpj] = useState<boolean>(false);
  const [carregandoInicial, setCarregandoInicial] = useState<boolean>(true);
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");

  const limparEstadoLogin = useCallback((): void => {
    removerCnpjDoCookie();
    removerCodEmpresaDoCookie();
    setCnpj("");
    setCnpjValidado(false);
    setNomeEmpresa("");
    setEmpresasBanco([]);
    setEmpresaSelecionada(null);
    setCredenciais({ login: "", senha: "", codEmpresa: undefined });
    setErro("");
  }, []);

  const carregarEmpresasBanco = useCallback(async (cnpj: string): Promise<void> => {
    setCarregandoEmpresas(true);
    setErro("");

    try {
      const resposta = await clienteHttp.get<EmpresaBanco[]>(
        `/admin/empresas/cnpj/${cnpj}/empresas-banco`
      );
      
      if (!resposta.success || !resposta.data) {
        throw new Error(resposta.error?.message || "Erro ao carregar empresas");
      }

      if (Array.isArray(resposta.data)) {
        setEmpresasBanco(resposta.data);
        
        if (resposta.data.length === 1) {
          const codEmpresa = resposta.data[0].COD_EMPRESA;
          setEmpresaSelecionada(codEmpresa);
          setCredenciais((prev) => ({ ...prev, codEmpresa }));
        }
      }
      setCarregandoInicial(false);
    } catch (erroCarregar) {
      const mensagemErro = erroCarregar instanceof Error 
        ? erroCarregar.message 
        : "Erro ao carregar empresas";
      setErro(mensagemErro);
      setCarregandoInicial(false);
    } finally {
      setCarregandoEmpresas(false);
    }
  }, []);

  const validarCnpjAutomatico = useCallback(async (cnpjParaValidar: string): Promise<void> => {
    setValidandoCnpj(true);
    setErro("");

    try {
      const cnpjLimpo = validarELimparCnpj(cnpjParaValidar);
      if (!cnpjLimpo) {
        limparEstadoLogin();
        setCarregandoInicial(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

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
      await carregarEmpresasBanco(cnpjLimpo);
    } catch (erro) {
      console.error("Erro ao validar CNPJ:", erro);
      limparEstadoLogin();
      setCarregandoInicial(false);
      setErro(erro instanceof Error ? erro.message : "Erro ao validar CNPJ");
    } finally {
      setValidandoCnpj(false);
    }
  }, [carregarEmpresasBanco, limparEstadoLogin]);

  useEffect(() => {
    const inicializar = async (): Promise<void> => {
      setCarregandoInicial(true);
      const cnpjSalvo = obterCnpjDoCookie();
      const codEmpresaSalvo = obterCodEmpresaDoCookie();
      
      if (cnpjSalvo) {
        setCnpj(cnpjSalvo);
        if (codEmpresaSalvo) {
          setEmpresaSelecionada(codEmpresaSalvo);
        }
        await validarCnpjAutomatico(cnpjSalvo);
      } else {
        setCarregandoInicial(false);
      }
    };

    inicializar();
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

      await new Promise((resolve) => setTimeout(resolve, 100));

      const resposta = await clienteHttp.get<{ nomeEmpresa: string }>(
        `/admin/empresas/cnpj/${cnpjLimpo}`
      );
      
      if (!resposta.success || !resposta.data) {
        throw new Error(resposta.error?.message || "Empresa não encontrada");
      }

      setNomeEmpresa(resposta.data.nomeEmpresa || "");
      salvarCnpjNoCookie(cnpjLimpo);
      setCnpjValidado(true);
      await carregarEmpresasBanco(cnpjLimpo);
    } catch (erroValidacao) {
      const mensagemErro = erroValidacao instanceof Error
        ? erroValidacao.message
        : "Erro ao validar CNPJ";
      setErro(mensagemErro);
    } finally {
      setValidandoCnpj(false);
    }
  };

  const handleSubmit = async (
    evento: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const cnpjLimpo = validarELimparCnpj(cnpj);
      
      if (!cnpjLimpo) {
        setErro("CNPJ inválido.");
        setCarregando(false);
        return;
      }
      
      if (!empresaSelecionada) {
        setErro("Selecione uma empresa");
        setCarregando(false);
        return;
      }

      await servicoAutenticacao.fazerLogin({
        ...credenciais,
        codEmpresa: empresaSelecionada,
        cnpj: cnpjLimpo,
      });
      
      salvarCnpjNoCookie(cnpjLimpo);
      salvarCodEmpresaNoCookie(empresaSelecionada);
      router.push("/dashboard");
    } catch (erroLogin) {
      const mensagemErro = erroLogin instanceof Error
        ? erroLogin.message
        : "Erro ao fazer login. Verifique suas credenciais.";
      setErro(mensagemErro);
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
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-[#04B2D9]/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-[#094A73] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium mt-6 animate-pulse">Carregando...</p>
        </div>
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
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="HighSoft Sistemas"
                    width={200}
                    height={64}
                    className="h-16 w-auto object-contain"
                    unoptimized
                  />
              </div>
            </div>
          </div>

          {!cnpjValidado ? (
            <form className="space-y-6" onSubmit={handleValidarCnpj}>
              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                  <p className="text-sm text-red-800 font-medium">
                    {erro}
                  </p>
                </div>
              )}
              
              {validandoCnpj && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">
                        Validando CNPJ...
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Aguarde enquanto verificamos os dados da empresa
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNPJ da Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formatarCnpj(cnpj)}
                    onChange={(e) => {
                      const valorLimpo = e.target.value.replace(/\D/g, "");
                      if (valorLimpo.length <= 14) {
                        setCnpj(valorLimpo);
                      }
                    }}
                    placeholder="00.000.000/0000-00"
                    disabled={validandoCnpj || carregandoInicial}
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <Botao
                  type="submit"
                  variante="primario"
                  tamanho="grande"
                  carregando={validandoCnpj}
                  className="w-full bg-gradient-to-r from-[#094A73] to-[#048ABF] hover:from-[#073a5c] hover:to-[#0378a3] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {validandoCnpj ? "Validando..." : "Continuar"}
                </Botao>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                  <p className="text-sm text-red-800 font-medium">
                    {erro}
                  </p>
                </div>
              )}

              {nomeEmpresa && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    {nomeEmpresa}
                  </p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Empresa
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ArrowDown className="w-4 h-4 text-gray-400" />
                    </div>
                    {carregandoEmpresas ? (
                      <div className="w-full pl-10 pr-10 py-3 border-2 border-[#A4A5A6] rounded-xl bg-gray-50 text-gray-500">
                        Carregando empresas...
                      </div>
                    ) : (
                      <select
                        required
                        value={empresaSelecionada || ""}
                        onChange={(e) => {
                          const codEmpresa = parseInt(e.target.value, 10);
                          setEmpresaSelecionada(codEmpresa);
                          setCredenciais({ ...credenciais, codEmpresa });
                        }}
                        className="w-full pl-10 pr-10 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="">Selecione uma empresa</option>
                        {empresasBanco.map((empresa) => (
                          <option key={empresa.COD_EMPRESA} value={empresa.COD_EMPRESA}>
                           {empresa.COD_EMPRESA} - {empresa.FAN_EMPRESA || empresa.NOM_EMPRESA}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usuário
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={credenciais.login}
                      onChange={(e) =>
                        setCredenciais({ ...credenciais, login: e.target.value })
                      }
                      placeholder="Login ou nome de usuário"
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={credenciais.senha}
                      onChange={(e) =>
                        setCredenciais({ ...credenciais, senha: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Botao
                  type="submit"
                  variante="primario"
                  tamanho="grande"
                  carregando={carregando}
                  className="w-full bg-gradient-to-r from-[#094A73] to-[#048ABF] hover:from-[#073a5c] hover:to-[#0378a3] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {carregando ? "Entrando..." : "Entrar"}
                </Botao>
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={limparEstadoLogin}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Sair da empresa
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2026 HighSoft Sistemas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
