"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { EmpresaConfig } from "@/core/entities/EmpresaConfig";
import { Botao } from "@/core/componentes/botao/botao";
import { clienteHttp } from "@/core/http/cliente-http";
import { validarELimparCnpj } from "@/core/utils/cnpj-utils";
import { logger } from "@/core/utils/logger";
import {
  Check,
  Upload,
  Building2,
  Lock,
  Edit,
  Trash2,
  Plus,
  LogOut,
  Shield,
  X,
} from "lucide-react";

const ADMIN_PASSWORD = "hs@010896@hs";

function decryptCfg(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(
      i % 2 === 0 ? value.charCodeAt(i) + 13 : value.charCodeAt(i) - 9
    );
  }
  return result.replace(/[\'\n\r\u0004\u00a0\u001a]/g, "");
}

export default function PaginaAdmin(): React.JSX.Element {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaConfig[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [empresaExcluir, setEmpresaExcluir] = useState<EmpresaConfig | null>(null);
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaConfig | null>(null);
  const [senhaEditando, setSenhaEditando] = useState(false);
  const [senhaImportada, setSenhaImportada] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formulario, setFormulario] = useState({
    cnpj: "",
    nomeEmpresa: "",
    host: "",
    porta: 1433,
    nomeBase: "",
    usuario: "",
    senha: "",
    codigosUsuariosPermitidos: "",
  });

  useEffect(() => {
    if (autenticado) {
      carregarEmpresas();
    }
  }, [autenticado]);

  const carregarEmpresas = async () => {
    try {
      const resposta = await clienteHttp.get<EmpresaConfig[]>("/admin/empresas/completo", {
        headers: {
          "X-Admin-Password": ADMIN_PASSWORD,
        },
      });
      if (resposta.success && resposta.data) {
        setEmpresas(resposta.data);
      }
    } catch (erro) {
      logger.error("Erro ao carregar empresas", erro, {
        endpoint: "/admin",
        method: "carregarEmpresas",
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha === ADMIN_PASSWORD) {
      setAutenticado(true);
      setErro("");
    } else {
      setErro("Senha incorreta");
    }
  };

  const handleImportarCfg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.split(".").pop()?.toLowerCase() !== "cfg") {
      setErro("Apenas arquivos .cfg são permitidos.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split("\n");

        if (lines.length < 16) {
          setErro("O arquivo deve ter no mínimo 16 linhas.");
          return;
        }

        const host = decryptCfg(lines[2]?.trim() || "");
        const usuario = decryptCfg(lines[14]?.trim() || "");
        const nomeBase = decryptCfg(lines[14]?.trim() || "");
        const senhaDecodificada = decryptCfg(lines[15]?.trim() || "");

        if (!host || !usuario || !senhaDecodificada) {
          setErro("Erro ao decodificar arquivo CFG. Verifique se o arquivo está correto.");
          return;
        }

        setSenhaImportada(senhaDecodificada);
        setFormulario({
          ...formulario,
          host,
          usuario,
          nomeBase,
          senha: "",
        });

        setMostrarModal(true);
        setErro("");
      } catch (erroProcessamento) {
        setErro(
          erroProcessamento instanceof Error
            ? erroProcessamento.message
            : "Erro ao processar arquivo CFG"
        );
      }
    };

    reader.onerror = () => {
      setErro("Erro ao ler arquivo.");
    };

    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const abrirModalNova = () => {
    setEmpresaEditando(null);
    setSenhaEditando(false);
    setSenhaImportada("");
    setFormulario({
      cnpj: "",
      nomeEmpresa: "",
      host: "",
      porta: 1433,
      nomeBase: "",
      usuario: "",
      senha: "",
      codigosUsuariosPermitidos: "",
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (empresa: EmpresaConfig) => {
    setEmpresaEditando(empresa);
    setSenhaEditando(false);
    setSenhaImportada("");
    setFormulario({
      cnpj: empresa.cnpj,
      nomeEmpresa: empresa.nomeEmpresa || "",
      host: empresa.host,
      porta: empresa.porta,
      nomeBase: empresa.nomeBase,
      usuario: empresa.usuario,
      senha: "",
      codigosUsuariosPermitidos: empresa.codigosUsuariosPermitidos || "",
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setEmpresaEditando(null);
    setSenhaEditando(false);
    setSenhaImportada("");
    setErro("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      const cnpjLimpo = validarELimparCnpj(formulario.cnpj);
      if (!cnpjLimpo) {
        throw new Error("CNPJ inválido");
      }

      const senhaFinal = senhaImportada || formulario.senha;

      const dadosEmpresa = {
        cnpj: cnpjLimpo,
        nomeEmpresa: formulario.nomeEmpresa,
        host: formulario.host,
        porta: formulario.porta,
        nomeBase: formulario.nomeBase,
        usuario: formulario.usuario,
        senha: senhaFinal,
        codigosUsuariosPermitidos: formulario.codigosUsuariosPermitidos || null,
      };

      const resposta = empresaEditando
        ? await clienteHttp.put<EmpresaConfig>(`/admin/empresas/${empresaEditando.id}`, dadosEmpresa)
        : await clienteHttp.post<EmpresaConfig>("/admin/empresas", dadosEmpresa);

      if (!resposta.success || !resposta.data) {
        throw new Error(resposta.error?.message || "Erro ao salvar empresa");
      }

      fecharModal();
      carregarEmpresas();
    } catch (erro) {
      setErro(
        erro instanceof Error ? erro.message : "Erro ao salvar empresa"
      );
    }
  };

  const abrirModalExcluir = (empresa: EmpresaConfig) => {
    setEmpresaExcluir(empresa);
    setSenhaExcluir("");
    setMostrarModalExcluir(true);
  };

  const fecharModalExcluir = () => {
    setMostrarModalExcluir(false);
    setEmpresaExcluir(null);
    setSenhaExcluir("");
  };

  const handleExcluir = async () => {
    if (!empresaExcluir) return;

    if (senhaExcluir !== ADMIN_PASSWORD) {
      setErro("Senha incorreta");
      return;
    }

    try {
      const resposta = await clienteHttp.delete(`/admin/empresas/${empresaExcluir.id}`);

      if (!resposta.success) {
        throw new Error(resposta.error?.message || "Erro ao excluir empresa");
      }

      fecharModalExcluir();
      carregarEmpresas();
    } catch (erro) {
      setErro(
        erro instanceof Error ? erro.message : "Erro ao excluir empresa"
      );
    }
  };

  const formatarCnpj = (cnpj: string) => {
    const apenasNumeros = cnpj.replace(/\D/g, "");
    return apenasNumeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#04B2D9]/10 via-[#048ABF]/10 to-[#094A73]/10 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#04B2D9] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#048ABF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#094A73] rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
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
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-[#094A73]" />
                <h1 className="text-xl font-bold text-gray-800">
            Acesso Administrativo
          </h1>
              </div>
            </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 animate-shake">
                  <p className="text-sm text-red-800 font-medium">{erro}</p>
              </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha Administrativa
              </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    placeholder="Digite a senha administrativa"
                required
              />
            </div>
              </div>

            <Botao
              type="submit"
              variante="primario"
              className="w-full"
            >
              Entrar
            </Botao>
          </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Empresas
          </h1>
              <p className="text-sm text-gray-600 mt-1">
                Configure e gerencie as empresas do sistema
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".cfg"
                onChange={handleImportarCfg}
                className="hidden"
                id="file-cfg-input"
              />
              <Botao
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variante="primario"
                className="inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar CFG
              </Botao>
            <Botao
                onClick={abrirModalNova}
              variante="primario"
                className="inline-flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Nova Empresa
            </Botao>
            <Botao
              onClick={() => setAutenticado(false)}
              variante="secundario"
                className="inline-flex items-center gap-2"
            >
                <LogOut className="w-4 h-4" />
              Sair
            </Botao>
          </div>
        </div>

        {erro && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-3 animate-shake">
              <p className="text-sm text-red-800 font-medium">{erro}</p>
          </div>
        )}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome da Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuários Permitidos
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresas.map((empresa) => (
                  <tr
                    key={empresa.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {empresa.nomeEmpresa || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatarCnpj(empresa.cnpj)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {empresa.host}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {empresa.porta}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {empresa.nomeBase}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {empresa.codigosUsuariosPermitidos || "Todos"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModalEditar(empresa)}
                          className="p-1.5 text-[#094A73] hover:text-[#048ABF] hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalExcluir(empresa)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {empresas.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Nenhuma empresa cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">
                  Clique em &quot;Nova Empresa&quot; para começar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
              {empresaEditando ? "Editar Empresa" : "Nova Empresa"}
            </h2>
              <button
                onClick={fecharModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">{erro}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formulario.nomeEmpresa}
                    onChange={(e) =>
                      setFormulario({ ...formulario, nomeEmpresa: e.target.value })
                    }
                    placeholder="Nome da empresa"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formulario.cnpj}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, "");
                      if (valor.length <= 14) {
                        setFormulario({ ...formulario, cnpj: valor });
                      }
                    }}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={formulario.host}
                    onChange={(e) =>
                      setFormulario({ ...formulario, host: e.target.value })
                    }
                    placeholder="ex: 192.168.1.100"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Porta *
                  </label>
                  <input
                    type="number"
                    value={formulario.porta}
                    onChange={(e) =>
                      setFormulario({
                        ...formulario,
                        porta: parseInt(e.target.value) || 1433,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome da Base *
                  </label>
                  <input
                    type="text"
                    value={formulario.nomeBase}
                    onChange={(e) =>
                      setFormulario({ ...formulario, nomeBase: e.target.value })
                    }
                    placeholder="Nome do banco de dados"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={formulario.usuario}
                    onChange={(e) =>
                      setFormulario({ ...formulario, usuario: e.target.value })
                    }
                    placeholder="Usuário do banco"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Senha *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                  <input
                    type="password"
                    value={formulario.senha}
                        onChange={(e) => {
                          setFormulario({ ...formulario, senha: e.target.value });
                          if (senhaImportada) {
                            setSenhaImportada("");
                          }
                        }}
                        placeholder={
                          empresaEditando && !senhaEditando
                            ? "Clique em 'Alterar Senha' para editar"
                            : senhaImportada
                            ? "Senha importada do CFG (será usada ao salvar)"
                            : "Digite a senha"
                        }
                        disabled={!!empresaEditando && !senhaEditando}
                        className="w-full pl-10 pr-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        required={!senhaImportada ? true : undefined}
                      />
                    </div>
                    {empresaEditando && !senhaEditando && (
                      <Botao
                        type="button"
                        onClick={() => {
                          setSenhaEditando(true);
                          setFormulario({ ...formulario, senha: "" });
                          setSenhaImportada("");
                        }}
                        variante="secundario"
                        className="whitespace-nowrap"
                      >
                        Alterar Senha
                      </Botao>
                    )}
                  </div>
                  {senhaImportada && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs text-green-700 font-medium">
                        Senha importada do arquivo CFG. Será usada ao salvar.
                      </p>
                    </div>
                  )}
                  {empresaEditando && !senhaEditando && !senhaImportada && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Por segurança, a senha não é exibida. Clique em &quot;Alterar Senha&quot; para definir uma nova.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Códigos de Usuários Permitidos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formulario.codigosUsuariosPermitidos}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      codigosUsuariosPermitidos: e.target.value,
                    })
                  }
                  placeholder="1, 2, 3 (deixe vazio para permitir todos)"
                    className="w-full px-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para permitir login de qualquer usuário
                </p>
              </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Botao
                  type="button"
                  onClick={fecharModal}
                  variante="secundario"
                >
                  Cancelar
                </Botao>
              <Botao type="submit" variante="primario">
                {empresaEditando ? "Atualizar" : "Salvar"}
              </Botao>
              </div>
            </form>
          </div>
          </div>
        )}

      {mostrarModalExcluir && empresaExcluir && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Confirmar Exclusão</h2>
                    <button
                onClick={fecharModalExcluir}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                <X className="w-5 h-5" />
                    </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Tem certeza que deseja excluir a empresa <strong>{empresaExcluir.nomeEmpresa || formatarCnpj(empresaExcluir.cnpj)}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                Esta ação não pode ser desfeita.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Digite a senha para confirmar *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={senhaExcluir}
                    onChange={(e) => setSenhaExcluir(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-[#A4A5A6] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73] transition-all"
                    placeholder="Senha administrativa"
                    autoFocus
                  />
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">{erro}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Botao
                  type="button"
                  onClick={fecharModalExcluir}
                  variante="secundario"
                >
                  Cancelar
                </Botao>
                <Botao
                  type="button"
                  onClick={handleExcluir}
                  variante="perigo"
                    >
                      Excluir
                </Botao>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
