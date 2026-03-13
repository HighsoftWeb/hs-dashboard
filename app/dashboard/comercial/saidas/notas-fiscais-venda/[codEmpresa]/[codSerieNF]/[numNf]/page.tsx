"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clienteHttp } from "@/core/http/cliente-http";
import { formatarDataHora } from "@/core/utils/formatar-data";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { obterStatus, obterCorStatus } from "@/core/utils/status-utils";
import {
  ItemNotaFiscalVendaDB,
  NotaFiscalVendaDB,
} from "@/core/repository/notas-repository";

export default function PaginaDetalhesNotaFiscal(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codEmpresa = Number.parseInt(String(params.codEmpresa), 10);
  const codSerie = String(params.codSerieNF);
  const numNf = Number.parseInt(String(params.numNf), 10);

  const [nota, setNota] = useState<NotaFiscalVendaDB | null>(null);
  const [itens, setItens] = useState<ItemNotaFiscalVendaDB[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string>("itens");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<{
          nota: NotaFiscalVendaDB;
          itens: ItemNotaFiscalVendaDB[];
        }>(
          `/dashboard/comercial/saidas/notas-fiscais-venda/${codEmpresa}/${codSerie}/${numNf}`
        );

        if (!resposta.success || !resposta.data) {
          throw new Error(resposta.error?.message || "Erro ao carregar nota");
        }

        setNota(resposta.data.nota);
        setItens(resposta.data.itens || []);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codEmpresa) && !isNaN(numNf)) {
      carregarDados();
    }
  }, [codEmpresa, codSerie, numNf]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-8 w-72 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-48 rounded bg-slate-200 animate-pulse mt-2" />
          </div>
          <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-9 w-full rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="h-10 bg-slate-100 flex gap-4 px-4" />
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 rounded bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erro || !nota) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <p className="text-sm text-red-800">{erro || "Nota não encontrada"}</p>
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
            Nota Fiscal de Venda - Nº {nota.NUM_NF_VENDA}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
            <span>
              Série: <strong>{nota.COD_SERIE_NF_VENDA || codSerie}</strong>
            </span>
            {nota.NUM_DOCUMENTO && (
              <span>
                Documento: <strong>{nota.NUM_DOCUMENTO}</strong>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${obterCorStatus(nota.SIT_NF)}`}
            >
              {obterStatus(nota.SIT_NF)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Cliente
            </label>
            <input
              type="text"
              value={`${nota.RAZ_CLI_FOR || "-"} (${nota.COD_CLI_FOR})`}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Emissão
            </label>
            <input
              type="text"
              value={formatarDataHora(nota.HOR_EMISSAO || nota.DAT_EMISSAO)}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Representante
            </label>
            <input
              type="text"
              value={nota.DES_REPRESENTANTE || nota.COD_REPRESENTANTE || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Transporte
            </label>
            <input
              type="text"
              value={nota.DES_TRANSPORTADORA || nota.COD_TRANSPORTADORA || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-4" aria-label="Tabs">
            <button
              onClick={() => setAbaAtiva("itens")}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                abaAtiva === "itens"
                  ? "bg-[#094A73] text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Itens ({itens.length})
            </button>
          </nav>
        </div>
        <div className="overflow-x-auto">
          {abaAtiva === "itens" && (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Seq.
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Código
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Descrição
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Qtd.
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Preço Unit.
                  </th>
                  <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    Valor Líquido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {itens.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-2 py-4 text-center text-sm text-gray-500"
                    >
                      Nenhum item encontrado
                    </td>
                  </tr>
                ) : (
                  itens.map((item) => (
                    <tr
                      key={item.SEQ_ITEM_NF_VENDA}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <td className="px-2 py-1 whitespace-nowrap text-right text-sm text-gray-900">
                        {item.SEQ_ITEM_NF_VENDA}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                        {item.COD_PRODUTO}.{item.COD_DERIVACAO}
                      </td>
                      <td className="px-2 py-1 text-sm text-gray-900">
                        {item.DES_ITEM || item.DES_PRODUTO || "-"}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                        {item.QTD_FATURADA?.toFixed(4) || "-"}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatarMoeda(item.VLR_PRECO_UNITARIO)}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                        {formatarMoeda(item.VLR_LIQUIDO)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Totalizadores
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
              Valor Bruto
            </label>
            <input
              type="text"
              value={formatarMoeda(nota.VLR_BRUTO)}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
              Desconto
            </label>
            <input
              type="text"
              value={
                nota.VLR_DESCONTO
                  ? formatarMoeda(-Math.abs(Number(nota.VLR_DESCONTO)))
                  : formatarMoeda(0)
              }
              readOnly
              className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right ${nota.VLR_DESCONTO && Number(nota.VLR_DESCONTO) !== 0 ? "text-red-600 font-semibold" : ""}`}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
              Valor Produtos
            </label>
            <input
              type="text"
              value={formatarMoeda(nota.VLR_PRODUTOS)}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
            />
          </div>

          <div className="flex flex-col md:col-span-2 lg:col-span-3 xl:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
              Valor Líquido Total
            </label>
            <input
              type="text"
              value={formatarMoeda(nota.VLR_LIQUIDO)}
              readOnly
              className="w-full px-2 py-1.5 text-base font-bold border-2 border-[#094A73] rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-[#094A73] text-white text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
