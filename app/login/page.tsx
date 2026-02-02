"use client";

import React, { useState, useEffect } from "react";
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

export default function PaginaLogin(): React.JSX.Element {
  const router = useRouter();
  const [cnpj, setCnpj] = useState<string>("");
  const [cnpjValidado, setCnpjValidado] = useState<boolean>(false);
  const [credenciais, setCredenciais] = useState<CredenciaisLogin>({
    login: "",
    senha: "",
    codEmpresa: undefined,
  });
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);
  const [validandoCnpj, setValidandoCnpj] = useState<boolean>(false);
  const [nomeEmpresa, setNomeEmpresa] = useState<string>("");

  useEffect(() => {
    const cnpjSalvo = obterCnpjDoCookie();
    if (cnpjSalvo) {
      setCnpj(cnpjSalvo);
      validarCnpjAutomatico(cnpjSalvo);
    }
  }, []);

  const validarCnpjAutomatico = async (cnpjParaValidar: string): Promise<void> => {
    setValidandoCnpj(true);
    setErro("");

    try {
      const resposta = await fetch(`/api/admin/empresas/cnpj/${cnpjParaValidar}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        if (dados.success && dados.data) {
          setNomeEmpresa(dados.data.nomeEmpresa || "");
          setCnpjValidado(true);
        } else {
          removerCnpjDoCookie();
          setCnpj("");
        }
      } else {
        removerCnpjDoCookie();
        setCnpj("");
      }
    } catch {
      removerCnpjDoCookie();
      setCnpj("");
    } finally {
      setValidandoCnpj(false);
    }
  };

  const handleValidarCnpj = async (
    evento: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    evento.preventDefault();
    setErro("");
    setValidandoCnpj(true);

    try {
      if (!cnpj || typeof cnpj !== "string") {
        setErro("CNPJ não informado.");
        setValidandoCnpj(false);
        return;
      }
      
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      if (cnpjLimpo.length !== 14) {
        setErro("CNPJ inválido. Deve conter 14 dígitos.");
        setValidandoCnpj(false);
        return;
      }

      const resposta = await fetch(`/api/admin/empresas/cnpj/${cnpjLimpo}`);
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.error?.message || "Empresa não encontrada");
      }

      const dados = await resposta.json();
      if (dados.success && dados.data) {
        setNomeEmpresa(dados.data.nomeEmpresa || "");
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
    setCarregando(true);

    try {
      if (!cnpj || typeof cnpj !== "string") {
        setErro("CNPJ não informado.");
        setCarregando(false);
        return;
      }
      
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      if (cnpjLimpo.length !== 14) {
        setErro("CNPJ inválido.");
        setCarregando(false);
        return;
      }
      
      await servicoAutenticacao.fazerLogin({
        ...credenciais,
        cnpj: cnpjLimpo,
      });
      salvarCnpjNoCookie(cnpjLimpo);
      router.push("/dashboard");
    } catch (erroLogin) {
      setErro(
        erroLogin instanceof Error
          ? erroLogin.message
          : "Erro ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setCarregando(false);
    }
  };

  const formatarCnpj = (valor: string): string => {
    if (!valor || typeof valor !== "string") {
      return "";
    }
    
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 14) {
      return apenasNumeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    }
    return valor;
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04B2D9]/10 via-[#048ABF]/10 to-[#094A73]/10 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#04B2D9] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#048ABF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#094A73] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8 transform transition-all duration-300 hover:scale-[1.02]">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNPJ da Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🏢</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formatarCnpj(cnpj)}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, "");
                      if (valor.length <= 14) {
                        setCnpj(valor);
                      }
                    }}
                    placeholder="00.000.000/0000-00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all duration-200"
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
                    Usuário
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">👤</span>
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
                      <span className="text-gray-400 text-sm">🔒</span>
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
                    onClick={() => {
                      removerCnpjDoCookie();
                      setCnpjValidado(false);
                      setCnpj("");
                      setNomeEmpresa("");
                      setCredenciais({ login: "", senha: "", codEmpresa: undefined });
                      setErro("");
                    }}
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
              © 2024 HighSoft Sistemas. Todos os direitos reservados.
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
