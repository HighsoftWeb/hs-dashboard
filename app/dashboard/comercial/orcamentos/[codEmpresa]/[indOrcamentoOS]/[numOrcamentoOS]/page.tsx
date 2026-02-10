"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { clienteHttp } from "@/core/http/cliente-http";
import {
  OrcamentoCompletoDB,
  ItemOrcamentoDB,
  ItemApontamentoOSDB,
  ItemTrocaOrcamentoDB,
} from "@/core/repository/orcamento-repository";
import { formatarData, formatarDataHora } from "@/core/utils/formatar-data";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { obterStatus, obterCorStatus } from "@/core/utils/status-utils";

export default function PaginaDetalhesOrcamento(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codEmpresa = Number.parseInt(String(params.codEmpresa), 10);
  const indOrcamentoOS = String(params.indOrcamentoOS);
  const numOrcamentoOS = Number.parseInt(String(params.numOrcamentoOS), 10);

  const [orcamento, setOrcamento] = useState<OrcamentoCompletoDB | null>(null);
  const [itens, setItens] = useState<ItemOrcamentoDB[]>([]);
  const [apontamentos, setApontamentos] = useState<ItemApontamentoOSDB[]>([]);
  const [trocas, setTrocas] = useState<ItemTrocaOrcamentoDB[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string>("itens");
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<{
          orcamento: OrcamentoCompletoDB;
          itens: ItemOrcamentoDB[];
          apontamentos: ItemApontamentoOSDB[];
          trocas: ItemTrocaOrcamentoDB[];
        }>(
          `/dashboard/comercial/orcamentos/${codEmpresa}/${indOrcamentoOS}/${numOrcamentoOS}`
        );

        if (!resposta.success || !resposta.data) {
          throw new Error(
            resposta.error?.message || "Erro ao carregar orçamento"
          );
        }

        setOrcamento(resposta.data.orcamento);
        setItens(resposta.data.itens || []);
        setApontamentos(resposta.data.apontamentos || []);
        setTrocas(resposta.data.trocas || []);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codEmpresa) && !isNaN(numOrcamentoOS)) {
      carregarDados();
    }
  }, [codEmpresa, indOrcamentoOS, numOrcamentoOS]);

  const obterTipoDocumento = (ind: string): string => {
    return ind === "OR" ? "Orçamento" : ind === "OS" ? "Ordem de Serviço" : ind;
  };

  if (carregando) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </LayoutDashboard>
    );
  }

  if (erro || !orcamento) {
    return (
      <LayoutDashboard>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-800">
            {erro || "Orçamento não encontrado"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#094A73] text-white rounded hover:bg-[#073a5c]"
          >
            Voltar
          </button>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {obterTipoDocumento(orcamento.IND_ORCAMENTO_OS)} - Nº{" "}
              {orcamento.NUM_ORCAMENTO_OS}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span>
                Série: <strong>{orcamento.COD_SERIE_ORC_OS}</strong>
              </span>
              {orcamento.NUM_DOCUMENTO && (
                <span>
                  Documento: <strong>{orcamento.NUM_DOCUMENTO}</strong>
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${obterCorStatus(orcamento.SIT_ORCAMENTO_OS)}`}
              >
                {obterStatus(orcamento.SIT_ORCAMENTO_OS)}
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
                Cliente
              </label>
              <input
                type="text"
                value={`${orcamento.RAZ_CLI_FOR || "-"} (${orcamento.COD_CLI_FOR})`}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Cidade
              </label>
              <input
                type="text"
                value={
                  orcamento.NOM_CIDADE_CLIENTE && orcamento.SIG_ESTADO_CLIENTE
                    ? `${orcamento.NOM_CIDADE_CLIENTE} / ${orcamento.SIG_ESTADO_CLIENTE}`
                    : orcamento.NOM_CIDADE_CLIENTE || "-"
                }
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
                value={formatarDataHora(orcamento.HOR_EMISSAO)}
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
                value={
                  orcamento.DES_REPRESENTANTE ||
                  (orcamento.COD_REPRESENTANTE
                    ? `Código: ${orcamento.COD_REPRESENTANTE}`
                    : "-")
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Cond. Pagamento
              </label>
              <input
                type="text"
                value={
                  orcamento.DES_CONDICAO_PAG ||
                  orcamento.COD_CONDICAO_PAG ||
                  "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Tipo Título
              </label>
              <input
                type="text"
                value={
                  orcamento.DES_TIPO_TITULO || orcamento.COD_TIPO_TITULO || "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Operação
              </label>
              <input
                type="text"
                value={orcamento.DES_OPERACAO || orcamento.COD_OPERACAO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Transportadora
              </label>
              <input
                type="text"
                value={
                  orcamento.DES_TRANSPORTADORA ||
                  (orcamento.COD_TRANSPORTADORA
                    ? `Código: ${orcamento.COD_TRANSPORTADORA}`
                    : "-")
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Pedido Cliente
              </label>
              <input
                type="text"
                value={orcamento.NUM_PEDIDO_CLIENTE || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Placa Veículo
              </label>
              <input
                type="text"
                value={orcamento.NUM_PLACA_VEICULO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Previsão
              </label>
              <input
                type="text"
                value={formatarData(orcamento.DAT_PREVISAO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Validade
              </label>
              <input
                type="text"
                value={
                  orcamento.QTD_DIAS_VALIDADE
                    ? `${orcamento.QTD_DIAS_VALIDADE} dias`
                    : "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                CIF/FOB
              </label>
              <input
                type="text"
                value={orcamento.CIF_FOB === "C" ? "CIF" : "FOB"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Usuário
              </label>
              <input
                type="text"
                value={orcamento.NOM_USUARIO || "-"}
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
              <button
                onClick={() => setAbaAtiva("apontamentos")}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  abaAtiva === "apontamentos"
                    ? "bg-[#094A73] text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Apontamentos ({apontamentos.length})
              </button>
              <button
                onClick={() => setAbaAtiva("trocas")}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  abaAtiva === "trocas"
                    ? "bg-[#094A73] text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Trocas ({trocas.length})
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
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Código
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Descrição
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Depósito
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Tabela
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Qtd.
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Unidade
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Preço Unit.
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Desconto
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Valor Bruto
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      IPI
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      ICMS
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
                        colSpan={13}
                        className="px-2 py-4 text-center text-sm text-gray-500"
                      >
                        Nenhum item encontrado
                      </td>
                    </tr>
                  ) : (
                    itens.map((item) => (
                      <tr
                        key={item.SEQ_ITEM_ORCAMENTO_OS}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <td className="px-2 py-1 whitespace-nowrap text-right text-sm text-gray-900">
                          {item.SEQ_ITEM_ORCAMENTO_OS}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-sm text-gray-900">
                          {item.COD_PRODUTO}.{item.COD_DERIVACAO}
                        </td>
                        <td className="px-2 py-1 text-sm text-gray-900">
                          {item.DES_ITEM || item.DES_PRODUTO || "-"}
                        </td>
                        <td className="px-2 py-1 text-sm text-gray-900">
                          {item.COD_DEPOSITO} - {item.DES_DEPOSITO}
                        </td>
                        <td className="px-2 py-1 text-sm text-gray-900">
                          {item.COD_TABELA_PRECO} - {item.DES_TABELA_PRECO}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {item.QTD_PEDIDA?.toFixed(4) || "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {item.COD_UNIDADE_MEDIDA}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(item.VLR_PRECO_UNITARIO)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {item.PER_DESCONTO_ACRESCIMO
                            ? `${item.PER_DESCONTO_ACRESCIMO.toFixed(2)}%`
                            : "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(item.VLR_BRUTO)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(item.VLR_IPI)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(item.VLR_ICMS)}
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
            {abaAtiva === "apontamentos" && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Seq. Item
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Seq. Apontamento
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Representante
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Hora Início
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Hora Término
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {apontamentos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-4 text-center text-sm text-gray-500"
                      >
                        Nenhum apontamento encontrado
                      </td>
                    </tr>
                  ) : (
                    apontamentos.map((ap, idx) => (
                      <tr
                        key={`${ap.SEQ_ITEM_ORCAMENTO_OS}-${ap.SEQ_APONTAMENTO_OS}-${idx}`}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {ap.SEQ_ITEM_ORCAMENTO_OS}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {ap.SEQ_APONTAMENTO_OS}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {ap.DES_REPRESENTANTE ||
                            `Código: ${ap.COD_REPRESENTANTE}`}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {ap.HORA_INICIO
                            ? formatarDataHora(ap.HORA_INICIO)
                            : "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {ap.HORA_TERMINO
                            ? formatarDataHora(ap.HORA_TERMINO)
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {abaAtiva === "trocas" && (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Seq. Troca
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Código
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Descrição
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Depósito
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Qtd. Trocada
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Unidade
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Preço Unit.
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Valor Bruto
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Desconto
                    </th>
                    <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Valor Líquido
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Data Troca
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Usuário
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {trocas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-2 py-4 text-center text-sm text-gray-500"
                      >
                        Nenhuma troca encontrada
                      </td>
                    </tr>
                  ) : (
                    trocas.map((troca, idx) => (
                      <tr
                        key={`${troca.SEQ_ITEM_TROCA}-${idx}`}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {troca.SEQ_ITEM_TROCA}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {troca.COD_PRODUTO || "-"}
                          {troca.COD_DERIVACAO && ` / ${troca.COD_DERIVACAO}`}
                        </td>
                        <td className="px-2 py-1 text-sm text-gray-900">
                          {troca.DES_ITEM || troca.DES_PRODUTO || "-"}
                        </td>
                        <td className="px-2 py-1 text-sm text-gray-900">
                          {troca.DES_DEPOSITO || troca.COD_DEPOSITO || "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {troca.QTD_TROCADA?.toFixed(4) || "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {troca.DES_UNIDADE_MEDIDA ||
                            troca.COD_UNIDADE_MEDIDA ||
                            "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(troca.VLR_PRECO_UNITARIO)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(troca.VLR_BRUTO)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {troca.PER_DESCONTO
                            ? `${troca.PER_DESCONTO.toFixed(2)}%`
                            : "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatarMoeda(troca.VLR_LIQUIDO)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {troca.DAT_TROCA
                            ? formatarData(troca.DAT_TROCA)
                            : "-"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                          {troca.NOM_USUARIO || "-"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Bruto
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_BRUTO)}
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
                  orcamento.VLR_DESCONTO && Number(orcamento.VLR_DESCONTO) !== 0
                    ? formatarMoeda(-Math.abs(Number(orcamento.VLR_DESCONTO)))
                    : formatarMoeda(0)
                }
                readOnly
                className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right ${
                  orcamento.VLR_DESCONTO && Number(orcamento.VLR_DESCONTO) !== 0
                    ? "text-red-600 font-semibold"
                    : ""
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Produtos
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_PRODUTOS)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Serviços
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_SERVICOS)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Frete
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_FRETE)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Seguro
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_SEGURO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Outros
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_OUTROS)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                IPI
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_IPI)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                ICMS
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_ICMS)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                ISS
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_ISS)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Líquido Total
              </label>
              <input
                type="text"
                value={formatarMoeda(orcamento.VLR_LIQUIDO)}
                readOnly
                className="w-full px-2 py-1.5 text-base font-bold border-2 border-[#094A73] rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-[#094A73] text-white text-right"
              />
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
