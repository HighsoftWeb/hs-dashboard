"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { clienteHttp } from "@/core/http/cliente-http";
import { PAGINACAO_PADRAO } from "@/core/constants/paginacao";

export interface ColunaDataTable<T> {
  chave: keyof T | string;
  titulo: string;
  ordenavel?: boolean;
  renderizar?: (valor: unknown, registro: T) => React.ReactNode;
  largura?: string;
  alinhamento?: "esquerda" | "direita" | "centro";
}

export interface FiltroDataTable {
  chave: string;
  tipo: "texto" | "numero" | "data" | "select";
  rotulo: string;
  opcoes?: Array<{ valor: string; label: string }>;
  placeholder?: string;
}

export interface ParametrosConsulta {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: unknown;
}

interface PropsDataTable<T> {
  colunas: ColunaDataTable<T>[];
  endpoint: string;
  filtros?: FiltroDataTable[];
  ordenacaoPadrao?: { campo: string; ordem: "asc" | "desc" };
  titulo?: string;
  mostrarPaginacao?: boolean;
  mostrarBusca?: boolean;
  colunasTotalizar?: string[];
  onRowClick?: (registro: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  colunas,
  endpoint,
  filtros = [],
  ordenacaoPadrao = { campo: "", ordem: "asc" },
  titulo,
  mostrarPaginacao = true,
  mostrarBusca = true,
  colunasTotalizar = [],
  onRowClick,
}: PropsDataTable<T>): React.JSX.Element {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");
  const [pagina, setPagina] = useState<number>(1);
  const [tamanhoPagina, setTamanhoPagina] = useState<number>(
    PAGINACAO_PADRAO.PAGE_SIZE
  );
  const [total, setTotal] = useState<number>(0);
  const [ordenacao, setOrdenacao] = useState<{
    campo: string;
    ordem: "asc" | "desc";
  }>(ordenacaoPadrao);
  const [valoresFiltros, setValoresFiltros] = useState<Record<string, string>>(
    {}
  );
  const [buscaTexto, setBuscaTexto] = useState<string>("");

  const filtrosRef = useRef(filtros);
  const valoresFiltrosRef = useRef(valoresFiltros);

  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  useEffect(() => {
    valoresFiltrosRef.current = valoresFiltros;
  }, [valoresFiltros]);

  const valoresFiltrosString = useMemo(
    () =>
      Object.entries(valoresFiltros)
        .sort()
        .map(([k, v]) => `${k}:${v}`)
        .join("|"),
    [valoresFiltros]
  );

  useEffect(() => {
    let cancelado = false;

    const carregarDados = async (): Promise<void> => {
      try {
        setCarregando(true);
        setErro("");

        const params: ParametrosConsulta = {
          page: pagina,
          pageSize: tamanhoPagina,
        };

        if (ordenacao.campo) {
          params.sort = ordenacao.campo;
          params.order = ordenacao.ordem;
        }

        if (buscaTexto) {
          params.search = buscaTexto;
        }

        for (const filtro of filtrosRef.current) {
          const valor = valoresFiltrosRef.current[filtro.chave];
          if (valor) {
            params[filtro.chave] = valor;
          }
        }

        const queryString = new URLSearchParams(
          Object.entries(params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString();

        interface RespostaConsulta {
          data: T[];
          page: number;
          pageSize: number;
          total: number;
        }

        const resposta = await clienteHttp.get<RespostaConsulta>(
          `${endpoint}?${queryString}`
        );

        if (cancelado) return;

        if (resposta.success && resposta.data) {
          const dadosResposta = resposta.data as RespostaConsulta;
          if (dadosResposta && typeof dadosResposta === "object") {
            if ("data" in dadosResposta && Array.isArray(dadosResposta.data)) {
              setDados(dadosResposta.data);
              setTotal(
                typeof dadosResposta.total === "number"
                  ? dadosResposta.total
                  : 0
              );
            } else if (Array.isArray(dadosResposta)) {
              setDados(dadosResposta);
              setTotal(dadosResposta.length);
            } else {
              setErro("Estrutura de resposta inválida");
              setDados([]);
              setTotal(0);
            }
          } else {
            setErro("Estrutura de resposta inválida");
            setDados([]);
            setTotal(0);
          }
        } else {
          const mensagemErro =
            resposta.error?.message || "Erro ao carregar dados";
          setErro(mensagemErro);
          setDados([]);
          setTotal(0);
        }
      } catch (erroCarregar) {
        if (cancelado) return;
        setErro(
          erroCarregar instanceof Error
            ? erroCarregar.message
            : "Erro ao carregar dados"
        );
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    };

    carregarDados();

    return () => {
      cancelado = true;
    };
  }, [
    endpoint,
    pagina,
    tamanhoPagina,
    ordenacao.campo,
    ordenacao.ordem,
    buscaTexto,
    valoresFiltrosString,
  ]);

  const handleOrdenar = (campo: string): void => {
    setOrdenacao((prev) => ({
      campo,
      ordem: prev.campo === campo && prev.ordem === "asc" ? "desc" : "asc",
    }));
  };

  const handleAplicarFiltros = (): void => {
    setPagina(1);
  };

  const handleLimparFiltros = (): void => {
    setValoresFiltros({});
    setBuscaTexto("");
    setPagina(1);
  };

  const totalPaginas = Math.ceil(total / tamanhoPagina);

  const calcularTotais = useMemo(() => {
    if (colunasTotalizar.length === 0 || dados.length === 0) {
      return {};
    }

    const totais: Record<string, number> = {};

    colunasTotalizar.forEach((chaveColuna) => {
      const total = dados.reduce((acc, registro) => {
        const valor = registro[chaveColuna as keyof T];
        if (valor === null || valor === undefined) {
          return acc;
        }
        if (typeof valor === "number") {
          return acc + valor;
        }
        const numValor = Number(valor);
        if (!isNaN(numValor)) {
          return acc + numValor;
        }
        return acc;
      }, 0);
      totais[chaveColuna] = total;
    });

    return totais;
  }, [dados, colunasTotalizar]);

  return (
    <div className="space-y-4">
      {titulo && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{titulo}</h2>
        </div>
      )}

      {(mostrarBusca || filtros.length > 0) && (
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
              {mostrarBusca && (
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Buscar
                  </label>
                  <input
                    type="text"
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAplicarFiltros();
                      }
                    }}
                    placeholder="Buscar..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent"
                  />
                </div>
              )}

              {filtros.map((filtro) => (
                <div key={filtro.chave} className="flex flex-col">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {filtro.rotulo}
                  </label>
                  {filtro.tipo === "select" ? (
                    <select
                      value={valoresFiltros[filtro.chave] || ""}
                      onChange={(e) =>
                        setValoresFiltros((prev) => ({
                          ...prev,
                          [filtro.chave]: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
                    >
                      <option value="">Todos</option>
                      {filtro.opcoes?.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor}>
                          {opcao.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        filtro.tipo === "numero"
                          ? "number"
                          : filtro.tipo === "data"
                            ? "date"
                            : "text"
                      }
                      value={valoresFiltros[filtro.chave] || ""}
                      onChange={(e) =>
                        setValoresFiltros((prev) => ({
                          ...prev,
                          [filtro.chave]: e.target.value,
                        }))
                      }
                      placeholder={
                        filtro.placeholder ??
                        (filtro.tipo === "data" ? "dd/mm/aaaa" : "")
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={handleAplicarFiltros}
                className="px-4 py-1.5 text-sm bg-[#094A73] text-white rounded hover:bg-[#073a5c] transition-colors font-medium"
              >
                Aplicar
              </button>
              <button
                onClick={handleLimparFiltros}
                className="px-4 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      )}

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {colunas.map((coluna) => {
                  const chaveColuna = String(coluna.chave);
                  const isValorMonetario = chaveColuna.startsWith("VLR_");
                  const alinhamento =
                    coluna.alinhamento ||
                    (isValorMonetario ? "direita" : "esquerda");
                  const textAlignClass =
                    alinhamento === "direita"
                      ? "text-right"
                      : alinhamento === "centro"
                        ? "text-center"
                        : "text-left";

                  return (
                    <th
                      key={String(coluna.chave)}
                      style={
                        coluna.largura ? { width: coluna.largura } : undefined
                      }
                      className={`px-2 py-1 ${textAlignClass} text-xs font-medium text-gray-500 border-b border-gray-100 ${
                        coluna.ordenavel !== false
                          ? "cursor-pointer hover:bg-gray-100"
                          : ""
                      }`}
                      onClick={() =>
                        coluna.ordenavel !== false &&
                        handleOrdenar(String(coluna.chave))
                      }
                    >
                      <div
                        className={`flex items-center gap-1 ${alinhamento === "direita" ? "justify-end" : alinhamento === "centro" ? "justify-center" : ""}`}
                      >
                        <span>{coluna.titulo}</span>
                        {coluna.ordenavel !== false &&
                          ordenacao.campo === String(coluna.chave) && (
                            <span className="text-[#094A73] text-xs">
                              {ordenacao.ordem === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {carregando ? (
                <tr>
                  <td
                    colSpan={colunas.length}
                    className="px-2 py-4 text-center text-sm text-gray-500"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : dados.length === 0 ? (
                <tr>
                  <td
                    colSpan={colunas.length}
                    className="px-2 py-4 text-center text-sm text-gray-500"
                  >
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                dados.map((registro, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick && onRowClick(registro)}
                  >
                    {colunas.map((coluna) => {
                      const chaveColuna = String(coluna.chave);
                      const isValorMonetario = chaveColuna.startsWith("VLR_");
                      const alinhamento =
                        coluna.alinhamento ||
                        (isValorMonetario ? "direita" : "esquerda");
                      const textAlignClass =
                        alinhamento === "direita"
                          ? "text-right"
                          : alinhamento === "centro"
                            ? "text-center"
                            : "text-left";

                      return (
                        <td
                          key={String(coluna.chave)}
                          className={`px-2 py-1 whitespace-nowrap text-sm text-gray-900 ${textAlignClass}`}
                        >
                          {coluna.renderizar
                            ? coluna.renderizar(
                                registro[coluna.chave as keyof T],
                                registro
                              )
                            : String(registro[coluna.chave as keyof T] ?? "-")}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
              {colunasTotalizar.length > 0 && dados.length > 0 && (
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                  {colunas.map((coluna) => {
                    const chaveColuna = String(coluna.chave);
                    const isValorMonetario = chaveColuna.startsWith("VLR_");
                    const alinhamento =
                      coluna.alinhamento ||
                      (isValorMonetario ? "direita" : "esquerda");
                    const textAlignClass =
                      alinhamento === "direita"
                        ? "text-right"
                        : alinhamento === "centro"
                          ? "text-center"
                          : "text-left";

                    const deveTotalizar =
                      colunasTotalizar.includes(chaveColuna);

                    return (
                      <td
                        key={String(coluna.chave)}
                        className={`px-2 py-1 whitespace-nowrap text-sm text-gray-900 ${textAlignClass}`}
                      >
                        {deveTotalizar
                          ? coluna.renderizar
                            ? coluna.renderizar(
                                calcularTotais[chaveColuna] || 0,
                                {} as T
                              )
                            : new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(calcularTotais[chaveColuna] || 0)
                          : chaveColuna === colunas[0].chave
                            ? "TOTAL"
                            : ""}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {mostrarPaginacao && totalPaginas > 1 && (
          <div className="bg-white px-3 py-2 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-700">
              Mostrando{" "}
              {dados.length > 0 ? (pagina - 1) * tamanhoPagina + 1 : 0} até{" "}
              {Math.min(pagina * tamanhoPagina, total)} de {total} registros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-700">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
              <select
                value={tamanhoPagina}
                onChange={(e) => {
                  setTamanhoPagina(Number(e.target.value));
                  setPagina(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
