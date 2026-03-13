"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clienteHttp } from "@/core/http/cliente-http";
import {
  ProdutoCompletoDB,
  DerivacaoCompletaDB,
  EstoqueCompletoDB,
  TabelaPrecoProdutoDB,
} from "@/core/repository/detalhes-repository";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatarData } from "@/core/utils/formatar-data";

export default function PaginaDetalhesProduto(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codProduto = Number.parseInt(String(params.codProduto), 10);

  const [produto, setProduto] = useState<ProdutoCompletoDB | null>(null);
  const [derivacoes, setDerivacoes] = useState<DerivacaoCompletaDB[]>([]);
  const [estoques, setEstoques] = useState<EstoqueCompletoDB[]>([]);
  const [tabelasPreco, setTabelasPreco] = useState<TabelaPrecoProdutoDB[]>([]);
  const [indiceDerivacaoAtual, setIndiceDerivacaoAtual] = useState<number>(0);
  const [abaDerivacaoAtiva, setAbaDerivacaoAtiva] = useState<string>("estoque");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<{
          produto: ProdutoCompletoDB;
          derivacoes: DerivacaoCompletaDB[];
          estoques: EstoqueCompletoDB[];
          tabelasPreco: TabelaPrecoProdutoDB[];
        }>(`/dashboard/cadastros/produtos/${codProduto}`);

        if (!resposta.success || !resposta.data) {
          throw new Error(
            resposta.error?.message || "Erro ao carregar produto"
          );
        }

        setProduto(resposta.data.produto);
        const derivacoesOrdenadas = (resposta.data.derivacoes || []).sort(
          (a, b) => a.COD_DERIVACAO.localeCompare(b.COD_DERIVACAO)
        );
        setDerivacoes(derivacoesOrdenadas);
        setEstoques(resposta.data.estoques || []);
        setTabelasPreco(resposta.data.tabelasPreco || []);
        if (derivacoesOrdenadas.length > 0) {
          setIndiceDerivacaoAtual(0);
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codProduto)) {
      carregarDados();
    }
  }, [codProduto]);

  const formatarMoeda = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarQuantidade = (qtd: number | null | undefined): string => {
    if (qtd === null || qtd === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(qtd);
  };

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-8 w-80 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse mt-2" />
          </div>
          <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-9 w-full rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="h-10 bg-slate-100 flex gap-4 px-4" />
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <p className="text-sm text-red-800">
          {erro || "Produto não encontrado"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#094A73] text-white rounded hover:bg-[#073a5c]"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {produto.DES_PRODUTO || `Produto ${produto.COD_PRODUTO}`}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
            <span>
              Código: <strong>{produto.COD_PRODUTO}</strong>
            </span>
            <span>
              Tipo:{" "}
              <strong>
                {produto.IND_PRODUTO_SERVICO === "P"
                  ? "Produto"
                  : produto.IND_PRODUTO_SERVICO === "S"
                    ? "Serviço"
                    : produto.IND_PRODUTO_SERVICO}
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                produto.SIT_PRODUTO === "A"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {produto.SIT_PRODUTO === "A" ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Descrição
            </label>
            <input
              type="text"
              value={produto.DES_PRODUTO || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Unidade de Medida
            </label>
            <input
              type="text"
              value={
                produto.DES_UNIDADE_MEDIDA || produto.COD_UNIDADE_MEDIDA || "-"
              }
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Tipo
            </label>
            <input
              type="text"
              value={
                produto.IND_PRODUTO_SERVICO === "P"
                  ? "Produto"
                  : produto.IND_PRODUTO_SERVICO === "S"
                    ? "Serviço"
                    : produto.IND_PRODUTO_SERVICO || "-"
              }
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Situação
            </label>
            <input
              type="text"
              value={
                produto.SIT_PRODUTO === "A"
                  ? "Ativo"
                  : produto.SIT_PRODUTO === "I"
                    ? "Inativo"
                    : produto.SIT_PRODUTO || "-"
              }
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Data Cadastro
            </label>
            <input
              type="text"
              value={formatarData(produto.DAT_CADASTRO)}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Observações
            </label>
            <textarea
              value={produto.OBS_PRODUTO || "-"}
              readOnly
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3">
          {derivacoes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhuma derivação encontrada
            </p>
          ) : (
            (() => {
              const derivacaoAtual = derivacoes[indiceDerivacaoAtual];
              const estoquesDerivacao = estoques.filter(
                (e) => e.COD_DERIVACAO === derivacaoAtual.COD_DERIVACAO
              );
              const precosDerivacao = tabelasPreco.filter(
                (p) => p.COD_DERIVACAO === derivacaoAtual.COD_DERIVACAO
              );

              return (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
                    <div className="flex items-end justify-between mb-3 gap-2">
                      <button
                        onClick={() =>
                          setIndiceDerivacaoAtual((prev) =>
                            prev > 0 ? prev - 1 : derivacoes.length - 1
                          )
                        }
                        disabled={derivacoes.length <= 1}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300 flex-shrink-0 h-[34px]"
                        title="Derivação anterior"
                      >
                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                      </button>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className="flex flex-col">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Descrição
                          </label>
                          <input
                            type="text"
                            value={
                              derivacaoAtual.DES_DERIVACAO ||
                              derivacaoAtual.COD_DERIVACAO
                            }
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white font-semibold"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Código Derivação
                          </label>
                          <input
                            type="text"
                            value={derivacaoAtual.COD_DERIVACAO}
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Situação
                          </label>
                          <input
                            type="text"
                            value={
                              derivacaoAtual.SIT_DERIVACAO === "A"
                                ? "Ativo"
                                : derivacaoAtual.SIT_DERIVACAO === "I"
                                  ? "Inativo"
                                  : derivacaoAtual.SIT_DERIVACAO || "-"
                            }
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Posição
                          </label>
                          <input
                            type="text"
                            value={`${indiceDerivacaoAtual + 1} de ${derivacoes.length}`}
                            readOnly
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setIndiceDerivacaoAtual((prev) =>
                            prev < derivacoes.length - 1 ? prev + 1 : 0
                          )
                        }
                        disabled={derivacoes.length <= 1}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300 flex-shrink-0 h-[34px]"
                        title="Próxima derivação"
                      >
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                          Código de Barras
                        </label>
                        <input
                          type="text"
                          value={derivacaoAtual.COD_BARRA || "-"}
                          readOnly
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                          Preço Custo Última Entrada
                        </label>
                        <input
                          type="text"
                          value={formatarMoeda(
                            derivacaoAtual.VLR_PRECO_CUSTO_ULT_ENT
                          )}
                          readOnly
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                          Preço Custo Médio
                        </label>
                        <input
                          type="text"
                          value={formatarMoeda(
                            derivacaoAtual.VLR_PRECO_CUSTO_MEDIO
                          )}
                          readOnly
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
                        />
                      </div>
                      {derivacaoAtual.OBS_DERIVACAO && (
                        <div className="flex flex-col md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">
                            Observações
                          </label>
                          <textarea
                            value={derivacaoAtual.OBS_DERIVACAO}
                            readOnly
                            rows={2}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-1 px-4" aria-label="Tabs">
                        <button
                          onClick={() => setAbaDerivacaoAtiva("estoque")}
                          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            abaDerivacaoAtiva === "estoque"
                              ? "bg-[#094A73] text-white"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Estoque ({estoquesDerivacao.length})
                        </button>
                        <button
                          onClick={() => setAbaDerivacaoAtiva("precos")}
                          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                            abaDerivacaoAtiva === "precos"
                              ? "bg-[#094A73] text-white"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Preços ({precosDerivacao.length})
                        </button>
                      </nav>
                    </div>

                    <div className="p-4">
                      {abaDerivacaoAtiva === "estoque" && (
                        <div className="overflow-x-auto">
                          {estoquesDerivacao.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                              Nenhum estoque encontrado
                            </p>
                          ) : (
                            <table className="min-w-full text-sm divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Depósito
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Atual
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Reservada
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Bloqueada
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Ordem Compra
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Mínima
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Qtd. Máxima
                                  </th>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Última Entrada
                                  </th>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Última Saída
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {estoquesDerivacao.map((estoque, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50 border-b border-gray-100"
                                  >
                                    <td className="px-2 py-1 text-sm">
                                      {estoque.DES_DEPOSITO ||
                                        estoque.COD_DEPOSITO}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(estoque.QTD_ATUAL)}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(
                                        estoque.QTD_RESERVADA
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(
                                        estoque.QTD_BLOQUEADA
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(
                                        estoque.QTD_ORDEM_COMPRA
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(
                                        estoque.QTD_MINIMA_REPOSICAO
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarQuantidade(
                                        estoque.QTD_MAXIMA_REPOSICAO
                                      )}
                                    </td>
                                    <td className="px-2 py-1 text-sm">
                                      {formatarData(estoque.DAT_ULTIMA_ENTRADA)}
                                    </td>
                                    <td className="px-2 py-1 text-sm">
                                      {formatarData(estoque.DAT_ULTIMA_SAIDA)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}

                      {abaDerivacaoAtiva === "precos" && (
                        <div className="overflow-x-auto">
                          {precosDerivacao.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                              Nenhuma tabela de preço encontrada
                            </p>
                          ) : (
                            <table className="min-w-full text-sm divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Tabela de Preço
                                  </th>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Data Inicial
                                  </th>
                                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Data Final
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    Preço Unitário
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    % Desconto
                                  </th>
                                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 border-b border-gray-100">
                                    % Acréscimo
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {precosDerivacao.map((tabela, idx) => (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50 border-b border-gray-100"
                                  >
                                    <td className="px-2 py-1 text-sm">
                                      {tabela.DES_TABELA_PRECO ||
                                        tabela.COD_TABELA_PRECO}
                                    </td>
                                    <td className="px-2 py-1 text-sm">
                                      {formatarData(tabela.DAT_INICIAL)}
                                    </td>
                                    <td className="px-2 py-1 text-sm">
                                      {formatarData(tabela.DAT_FINAL)}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {formatarMoeda(tabela.VLR_PRECO_UNITARIO)}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {tabela.PER_DESCONTO
                                        ? `${tabela.PER_DESCONTO.toFixed(2)}%`
                                        : "-"}
                                    </td>
                                    <td className="px-2 py-1 text-sm text-right">
                                      {tabela.PER_ACRESCIMO
                                        ? `${tabela.PER_ACRESCIMO.toFixed(2)}%`
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
