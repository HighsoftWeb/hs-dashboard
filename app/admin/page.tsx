"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { EmpresaConfig } from "@/core/entities/EmpresaConfig";
import { Botao } from "@/core/componentes/botao/botao";
import { clienteHttp } from "@/core/http/cliente-http";
import { logger } from "@/core/utils/logger";
import {
  Building2,
  Lock,
  LogOut,
  Shield,
  Plus,
  Pencil,
  Trash2,
  FileJson,
  FileCode,
} from "lucide-react";
import { CORES_HIGHSOFT_PADRAO } from "@/core/temas/cores-highsoft";

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

const headersAdmin = () => ({
  "Content-Type": "application/json",
  "X-Admin-Password": ADMIN_PASSWORD,
});

function formatarCnpj(cnpj: string): string {
  const n = cnpj.replace(/\D/g, "");
  return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const CORES_PADRAO = CORES_HIGHSOFT_PADRAO;

export default function PaginaAdmin(): React.JSX.Element {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [empresas, setEmpresas] = useState<EmpresaConfig[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<EmpresaConfig | null>(
    null
  );
  const [formulario, setFormulario] = useState({
    cnpj: "",
    nomeEmpresa: "",
    host: "",
    porta: 1433,
    nomeBase: "",
    usuario: "",
    senha: "",
    codigosUsuariosPermitidos: "",
    corPrimaria: CORES_PADRAO.primaria,
    corSecundaria: CORES_PADRAO.secundaria,
    corTerciaria: CORES_PADRAO.terciaria,
  });
  const [senhaImportada, setSenhaImportada] = useState<string>("");
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const inputCfgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autenticado) {
      carregarEmpresas();
    }
  }, [autenticado]);

  const carregarEmpresas = async () => {
    try {
      const resposta = await clienteHttp.get<EmpresaConfig[]>(
        "/admin/empresas/completo",
        { headers: { "X-Admin-Password": ADMIN_PASSWORD } }
      );
      if (resposta.success && resposta.data) {
        setEmpresas(resposta.data);
      }
    } catch (err) {
      logger.error("Erro ao carregar empresas", err, {
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

  const resetFormulario = () => {
    setFormulario({
      cnpj: "",
      nomeEmpresa: "",
      host: "",
      porta: 1433,
      nomeBase: "",
      usuario: "",
      senha: "",
      codigosUsuariosPermitidos: "",
      corPrimaria: CORES_PADRAO.primaria,
      corSecundaria: CORES_PADRAO.secundaria,
      corTerciaria: CORES_PADRAO.terciaria,
    });
    setSenhaImportada("");
    setEmpresaEditando(null);
  };

  const handleImportarCfg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.split(".").pop()?.toLowerCase() !== "cfg") {
      setErro("Apenas arquivos .cfg são permitidos.");
      e.target.value = "";
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
          setErro(
            "Erro ao decodificar arquivo CFG. Verifique se o arquivo está correto."
          );
          return;
        }

        setSenhaImportada(senhaDecodificada);
        setFormulario((prev) => ({
          ...prev,
          host,
          usuario,
          nomeBase,
          senha: "",
          porta: prev.porta || 1433,
        }));
        setEmpresaEditando(null);
        setMostrarFormulario(true);
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
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    try {
      const url = empresaEditando
        ? `/api/admin/empresas/${empresaEditando.id}`
        : "/api/admin/empresas";
      const metodo = empresaEditando ? "PUT" : "POST";
      const senhaFinal = senhaImportada || formulario.senha;
      const body = {
        cnpj: formulario.cnpj.replace(/\D/g, ""),
        nomeEmpresa: formulario.nomeEmpresa,
        host: formulario.host,
        porta: formulario.porta,
        nomeBase: formulario.nomeBase,
        usuario: formulario.usuario,
        senha: senhaFinal,
        codigosUsuariosPermitidos: formulario.codigosUsuariosPermitidos || null,
        corPrimaria: formulario.corPrimaria || CORES_PADRAO.primaria,
        corSecundaria: formulario.corSecundaria || CORES_PADRAO.secundaria,
        corTerciaria: formulario.corTerciaria || CORES_PADRAO.terciaria,
      };
      const res = await fetch(url, {
        method: metodo,
        headers: headersAdmin(),
        body: JSON.stringify(body),
      });
      const dados = await res.json();
      if (!res.ok) {
        throw new Error(dados.error?.message || "Erro ao salvar empresa");
      }
      setMostrarFormulario(false);
      resetFormulario();
      setSenhaImportada("");
      carregarEmpresas();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar empresa");
    }
  };

  const handleEditar = (empresa: EmpresaConfig) => {
    setEmpresaEditando(empresa);
    setSenhaImportada("");
    setFormulario({
      cnpj: empresa.cnpj,
      nomeEmpresa: empresa.nomeEmpresa || "",
      host: empresa.host,
      porta: empresa.porta,
      nomeBase: empresa.nomeBase,
      usuario: empresa.usuario,
      senha: empresa.senha,
      codigosUsuariosPermitidos: empresa.codigosUsuariosPermitidos || "",
      corPrimaria: empresa.corPrimaria || CORES_PADRAO.primaria,
      corSecundaria: empresa.corSecundaria || CORES_PADRAO.secundaria,
      corTerciaria: empresa.corTerciaria || CORES_PADRAO.terciaria,
    });
    setMostrarFormulario(true);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;
    setErro("");
    try {
      const res = await fetch(`/api/admin/empresas/${id}`, {
        method: "DELETE",
        headers: headersAdmin(),
      });
      const dados = await res.json();
      if (!res.ok) {
        throw new Error(dados.error?.message || "Erro ao excluir empresa");
      }
      carregarEmpresas();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir empresa");
    }
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro("");
    try {
      const texto = await file.text();
      const json = JSON.parse(texto) as unknown;
      const lista = Array.isArray(json) ? json : [json];
      let sucesso = 0;
      const falhas: string[] = [];
      for (const item of lista) {
        const emp = item as Record<string, unknown>;
        const cnpj = String(emp.cnpj ?? "").replace(/\D/g, "");
        if (cnpj.length !== 14) {
          falhas.push(`${emp.nomeEmpresa ?? "?"}: CNPJ inválido`);
          continue;
        }
        const body = {
          cnpj,
          nomeEmpresa: String(emp.nomeEmpresa ?? ""),
          host: String(emp.host ?? ""),
          porta: Number(emp.porta ?? 1433),
          nomeBase: String(emp.nomeBase ?? ""),
          usuario: String(emp.usuario ?? ""),
          senha: String(emp.senha ?? ""),
          codigosUsuariosPermitidos: emp.codigosUsuariosPermitidos
            ? String(emp.codigosUsuariosPermitidos)
            : null,
          corPrimaria: emp.corPrimaria
            ? String(emp.corPrimaria)
            : CORES_PADRAO.primaria,
          corSecundaria: emp.corSecundaria
            ? String(emp.corSecundaria)
            : CORES_PADRAO.secundaria,
          corTerciaria: emp.corTerciaria
            ? String(emp.corTerciaria)
            : CORES_PADRAO.terciaria,
        };
        const res = await fetch("/api/admin/empresas", {
          method: "POST",
          headers: headersAdmin(),
          body: JSON.stringify(body),
        });
        if (res.ok) {
          sucesso++;
        } else {
          const d = await res.json();
          falhas.push(`${body.nomeEmpresa}: ${d.error?.message ?? "Erro"}`);
        }
      }
      if (sucesso > 0) carregarEmpresas();
      if (falhas.length > 0) {
        setErro(
          `Importados: ${sucesso}. Falhas: ${falhas.slice(0, 5).join("; ")}${falhas.length > 5 ? "..." : ""}`
        );
      }
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao importar. Verifique o formato JSON."
      );
    }
    e.target.value = "";
  };

  const handleExportar = () => {
    const dados = empresas.map((e) => ({
      cnpj: e.cnpj,
      nomeEmpresa: e.nomeEmpresa,
      host: e.host,
      porta: e.porta,
      nomeBase: e.nomeBase,
      usuario: e.usuario,
      senha: e.senha,
      codigosUsuariosPermitidos: e.codigosUsuariosPermitidos,
      corPrimaria: e.corPrimaria,
      corSecundaria: e.corSecundaria,
      corTerciaria: e.corTerciaria,
    }));
    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "empresas-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClasse =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500";

  if (!autenticado) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200/50 via-slate-100 to-slate-200/50 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/logo.png"
                  alt="HighSoft Sistemas"
                  width={200}
                  height={64}
                  className="h-16 w-auto object-contain"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-slate-600" />
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    placeholder="Digite a senha administrativa"
                    required
                  />
                </div>
              </div>

              <Botao type="submit" variante="primario" className="w-full">
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
                Criar, editar, excluir e configurar cores por cliente
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Botao
                onClick={() => {
                  resetFormulario();
                  setMostrarFormulario(!mostrarFormulario);
                }}
                variante="primario"
                className="inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {mostrarFormulario ? "Cancelar" : "Nova Empresa"}
              </Botao>
              <input
                ref={inputArquivoRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportar}
              />
              <input
                ref={inputCfgRef}
                type="file"
                accept=".cfg"
                className="hidden"
                onChange={handleImportarCfg}
              />
              <Botao
                onClick={() => inputArquivoRef.current?.click()}
                variante="secundario"
                className="inline-flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                Importar JSON
              </Botao>
              <Botao
                onClick={() => inputCfgRef.current?.click()}
                variante="secundario"
                className="inline-flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                Importar CFG
              </Botao>
              <Botao
                onClick={handleExportar}
                variante="secundario"
                className="inline-flex items-center gap-2"
              >
                <FileJson className="w-4 h-4" />
                Exportar JSON
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

          {mostrarFormulario && (
            <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {empresaEditando ? "Editar Empresa" : "Nova Empresa"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      value={formulario.nomeEmpresa}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          nomeEmpresa: e.target.value,
                        })
                      }
                      placeholder="Nome da empresa"
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      value={formulario.cnpj}
                      onChange={(e) => {
                        const v = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 14);
                        setFormulario({ ...formulario, cnpj: v });
                      }}
                      placeholder="00.000.000/0000-00"
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host *
                    </label>
                    <input
                      type="text"
                      value={formulario.host}
                      onChange={(e) =>
                        setFormulario({ ...formulario, host: e.target.value })
                      }
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porta *
                    </label>
                    <input
                      type="number"
                      value={formulario.porta}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          porta: parseInt(e.target.value, 10) || 1433,
                        })
                      }
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Base *
                    </label>
                    <input
                      type="text"
                      value={formulario.nomeBase}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          nomeBase: e.target.value,
                        })
                      }
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário *
                    </label>
                    <input
                      type="text"
                      value={formulario.usuario}
                      onChange={(e) =>
                        setFormulario({
                          ...formulario,
                          usuario: e.target.value,
                        })
                      }
                      className={inputClasse}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={formulario.senha}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormulario({ ...formulario, senha: v });
                        if (v) setSenhaImportada("");
                      }}
                      placeholder={
                        senhaImportada
                          ? "Senha importada do CFG (será usada ao salvar)"
                          : "Digite a senha do banco"
                      }
                      className={inputClasse}
                      required={!senhaImportada}
                    />
                    {senhaImportada && (
                      <p className="text-xs text-green-600 mt-1">
                        Senha do CFG será usada ao salvar
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Códigos Usuários Permitidos
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
                      placeholder="1, 2, 3 (vazio = todos)"
                      className={inputClasse}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Cores do Cliente (gráficos e tema)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Primária
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={formulario.corPrimaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corPrimaria: e.target.value,
                            })
                          }
                          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formulario.corPrimaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corPrimaria: e.target.value,
                            })
                          }
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Secundária
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={formulario.corSecundaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corSecundaria: e.target.value,
                            })
                          }
                          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formulario.corSecundaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corSecundaria: e.target.value,
                            })
                          }
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Terciária
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={formulario.corTerciaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corTerciaria: e.target.value,
                            })
                          }
                          className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formulario.corTerciaria}
                          onChange={(e) =>
                            setFormulario({
                              ...formulario,
                              corTerciaria: e.target.value,
                            })
                          }
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-2 h-2 rounded"
                    style={{
                      background: `linear-gradient(90deg, ${formulario.corPrimaria}, ${formulario.corSecundaria}, ${formulario.corTerciaria})`,
                    }}
                  />
                </div>

                <Botao type="submit" variante="primario">
                  {empresaEditando ? "Atualizar" : "Salvar"}
                </Botao>
              </form>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Host
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cores
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {formatarCnpj(empresa.cnpj)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {empresa.host}:{empresa.porta}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {empresa.nomeBase}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div
                        className="w-12 h-4 rounded border border-gray-200"
                        style={{
                          background: `linear-gradient(90deg, ${empresa.corPrimaria || CORES_PADRAO.primaria}, ${empresa.corSecundaria || CORES_PADRAO.secundaria}, ${empresa.corTerciaria || CORES_PADRAO.terciaria})`,
                        }}
                        title={`${empresa.corPrimaria} / ${empresa.corSecundaria} / ${empresa.corTerciaria}`}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditar(empresa)}
                        className="text-slate-600 hover:text-slate-800 inline-flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(empresa.id)}
                        className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {empresas.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">
                  Nenhuma empresa cadastrada. Clique em &quot;Nova Empresa&quot;
                  para começar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
