"use client";

import React, { useState, useEffect } from "react";
import { EmpresaConfig } from "@/core/entities/EmpresaConfig";
import { Botao } from "@/core/componentes/botao/botao";
import { clienteHttp } from "@/core/http/cliente-http";
import { validarELimparCnpj } from "@/core/utils/cnpj-utils";

const ADMIN_PASSWORD = "hs@010896@hs";

export default function PaginaAdmin(): React.JSX.Element {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaConfig[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaConfig | null>(null);
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
      console.error("Erro ao carregar empresas:", erro);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      const cnpjLimpo = validarELimparCnpj(formulario.cnpj);
      if (!cnpjLimpo) {
        throw new Error("CNPJ inválido");
      }

      const dadosEmpresa = {
        cnpj: cnpjLimpo,
        nomeEmpresa: formulario.nomeEmpresa,
        host: formulario.host,
        porta: formulario.porta,
        nomeBase: formulario.nomeBase,
        usuario: formulario.usuario,
        senha: formulario.senha,
        codigosUsuariosPermitidos: formulario.codigosUsuariosPermitidos || null,
      };

      const resposta = empresaEditando
        ? await clienteHttp.put<EmpresaConfig>(`/admin/empresas/${empresaEditando.id}`, dadosEmpresa)
        : await clienteHttp.post<EmpresaConfig>("/admin/empresas", dadosEmpresa);

      if (!resposta.success || !resposta.data) {
        throw new Error(resposta.error?.message || "Erro ao salvar empresa");
      }

      setMostrarFormulario(false);
      setEmpresaEditando(null);
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
      carregarEmpresas();
    } catch (erro) {
      setErro(
        erro instanceof Error ? erro.message : "Erro ao salvar empresa"
      );
    }
  };

  const handleEditar = (empresa: EmpresaConfig) => {
    setEmpresaEditando(empresa);
    setFormulario({
      cnpj: empresa.cnpj,
      nomeEmpresa: empresa.nomeEmpresa || "",
      host: empresa.host,
      porta: empresa.porta,
      nomeBase: empresa.nomeBase,
      usuario: empresa.usuario,
      senha: empresa.senha,
      codigosUsuariosPermitidos: empresa.codigosUsuariosPermitidos || "",
    });
    setMostrarFormulario(true);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) {
      return;
    }

    try {
      const resposta = await clienteHttp.delete(`/admin/empresas/${id}`);

      if (!resposta.success) {
        throw new Error(resposta.error?.message || "Erro ao excluir empresa");
      }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#04B2D9]/10 via-[#048ABF]/10 to-[#094A73]/10 px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Acesso Administrativo
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#A4A5A6] rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                required
              />
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Gerenciamento de Empresas
          </h1>
          <div className="space-x-4">
            <Botao
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario);
                setEmpresaEditando(null);
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
              }}
              variante="primario"
            >
              {mostrarFormulario ? "Cancelar" : "Nova Empresa"}
            </Botao>
            <Botao
              onClick={() => setAutenticado(false)}
              variante="secundario"
            >
              Sair
            </Botao>
          </div>
        </div>

        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{erro}</p>
          </div>
        )}

        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {empresaEditando ? "Editar Empresa" : "Nova Empresa"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formulario.nomeEmpresa}
                    onChange={(e) =>
                      setFormulario({ ...formulario, nomeEmpresa: e.target.value })
                    }
                    placeholder="Nome da empresa"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={formulario.host}
                    onChange={(e) =>
                      setFormulario({ ...formulario, host: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Base *
                  </label>
                  <input
                    type="text"
                    value={formulario.nomeBase}
                    onChange={(e) =>
                      setFormulario({ ...formulario, nomeBase: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usuário *
                  </label>
                  <input
                    type="text"
                    value={formulario.usuario}
                    onChange={(e) =>
                      setFormulario({ ...formulario, usuario: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formulario.senha}
                    onChange={(e) =>
                      setFormulario({ ...formulario, senha: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094A73] focus:border-[#094A73]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para permitir login de qualquer usuário
                </p>
              </div>
              <Botao type="submit" variante="primario">
                {empresaEditando ? "Atualizar" : "Salvar"}
              </Botao>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuários Permitidos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {empresa.nomeEmpresa || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarCnpj(empresa.cnpj)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empresa.host}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empresa.porta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empresa.nomeBase}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empresa.codigosUsuariosPermitidos || "Todos"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditar(empresa)}
                      className="text-[#094A73] hover:text-[#048ABF]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(empresa.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {empresas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma empresa cadastrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
