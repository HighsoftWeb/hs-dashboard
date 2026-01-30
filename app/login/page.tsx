"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { servicoAutenticacao } from "@/core/autenticacao/servico-autenticacao";
import { CredenciaisLogin } from "@/core/tipos";
import { Botao } from "@/core/componentes/botao/botao";

export default function PaginaLogin(): React.JSX.Element {
  const router = useRouter();
  const [credenciais, setCredenciais] = useState<CredenciaisLogin>({
    login: "",
    senha: "",
    codEmpresa: undefined,
  });
  const [erro, setErro] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleSubmit = async (
    evento: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await servicoAutenticacao.fazerLogin(credenciais);
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake">
                <p className="text-sm text-red-800 font-medium">
                  {erro}
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
            </div>
          </form>

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
