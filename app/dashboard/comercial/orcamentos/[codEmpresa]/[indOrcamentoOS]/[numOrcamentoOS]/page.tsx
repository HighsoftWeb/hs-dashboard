"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react";
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

function CampoReadOnly({
  label,
  valor,
  className = "",
}: {
  label: string;
  valor: string | React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="block text-xs font-medium text-slate-500 mb-0.5">
        {label}
      </span>
      <span className="block text-sm text-slate-800 font-medium truncate">
        {valor || "-"}
      </span>
    </div>
  );
}

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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse mb-2" />
            <div className="h-8 w-64 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-9 w-full rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="h-12 bg-slate-100" />
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-slate-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erro || !orcamento) {
    return (
      <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Orçamento não encontrado
              </h2>
              <p className="text-sm text-slate-500 mt-1">{erro}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2.5 bg-highsoft-primario text-white rounded-lg hover:bg-[#073a5c] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link
                href="/dashboard/comercial"
                className="hover:text-highsoft-primario transition-colors"
              >
                Comercial
              </Link>
              <span>/</span>
              <Link
                href="/dashboard/comercial"
                className="hover:text-highsoft-primario transition-colors"
              >
                Orçamentos
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-medium">
                {obterTipoDocumento(orcamento.IND_ORCAMENTO_OS)} nº{" "}
                {orcamento.NUM_ORCAMENTO_OS}
              </span>
            </nav>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">
                {obterTipoDocumento(orcamento.IND_ORCAMENTO_OS)} - Nº{" "}
                {orcamento.NUM_ORCAMENTO_OS}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${obterCorStatus(orcamento.SIT_ORCAMENTO_OS)}`}
              >
                {obterStatus(orcamento.SIT_ORCAMENTO_OS)}
              </span>
              <span className="text-sm text-slate-500">
                Série {orcamento.COD_SERIE_ORC_OS}
                {orcamento.NUM_DOCUMENTO &&
                  ` · Doc. ${orcamento.NUM_DOCUMENTO}`}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-highsoft-primario/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-highsoft-primario" />
              </div>
              <h2 className="font-semibold text-slate-800">Cliente e Local</h2>
            </div>
            <div className="space-y-4">
              <CampoReadOnly
                label="Cliente"
                valor={`${orcamento.RAZ_CLI_FOR || "-"} (${orcamento.COD_CLI_FOR})`}
              />
              <CampoReadOnly
                label="Cidade"
                valor={
                  orcamento.NOM_CIDADE_CLIENTE && orcamento.SIG_ESTADO_CLIENTE
                    ? `${orcamento.NOM_CIDADE_CLIENTE} / ${orcamento.SIG_ESTADO_CLIENTE}`
                    : orcamento.NOM_CIDADE_CLIENTE || "-"
                }
              />
              <CampoReadOnly
                label="Emissão"
                valor={formatarDataHora(orcamento.HOR_EMISSAO)}
              />
              <CampoReadOnly label="Usuário" valor={orcamento.NOM_USUARIO} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-slate-800">Pagamento</h2>
            </div>
            <div className="space-y-4">
              <CampoReadOnly
                label="Cond. Pagamento"
                valor={
                  orcamento.DES_CONDICAO_PAG ||
                  orcamento.COD_CONDICAO_PAG ||
                  "-"
                }
              />
              <CampoReadOnly
                label="Tipo Título"
                valor={
                  orcamento.DES_TIPO_TITULO || orcamento.COD_TIPO_TITULO || "-"
                }
              />
              <CampoReadOnly
                label="Operação"
                valor={orcamento.DES_OPERACAO || orcamento.COD_OPERACAO || "-"}
              />
              <CampoReadOnly
                label="Pedido Cliente"
                valor={orcamento.NUM_PEDIDO_CLIENTE}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-semibold text-slate-800">
                Entrega e Transporte
              </h2>
            </div>
            <div className="space-y-4">
              <CampoReadOnly
                label="Transportadora"
                valor={
                  orcamento.DES_TRANSPORTADORA ||
                  (orcamento.COD_TRANSPORTADORA
                    ? `Cód. ${orcamento.COD_TRANSPORTADORA}`
                    : "-")
                }
              />
              <CampoReadOnly
                label="CIF/FOB"
                valor={
                  orcamento.CIF_FOB === "C"
                    ? "CIF"
                    : orcamento.CIF_FOB === "F"
                      ? "FOB"
                      : "-"
                }
              />
              <CampoReadOnly
                label="Previsão"
                valor={formatarData(orcamento.DAT_PREVISAO)}
              />
              <CampoReadOnly
                label="Validade"
                valor={
                  orcamento.QTD_DIAS_VALIDADE
                    ? `${orcamento.QTD_DIAS_VALIDADE} dias`
                    : "-"
                }
              />
              <CampoReadOnly
                label="Representante"
                valor={
                  orcamento.DES_REPRESENTANTE ||
                  (orcamento.COD_REPRESENTANTE
                    ? `Cód. ${orcamento.COD_REPRESENTANTE}`
                    : "-")
                }
              />
              <CampoReadOnly
                label="Placa Veículo"
                valor={orcamento.NUM_PLACA_VEICULO}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex gap-0 px-4" aria-label="Tabs">
              <button
                onClick={() => setAbaAtiva("itens")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  abaAtiva === "itens"
                    ? "border-highsoft-primario text-highsoft-primario"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                Itens ({itens.length})
              </button>
              <button
                onClick={() => setAbaAtiva("apontamentos")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  abaAtiva === "apontamentos"
                    ? "border-highsoft-primario text-highsoft-primario"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                Apontamentos ({apontamentos.length})
              </button>
              <button
                onClick={() => setAbaAtiva("trocas")}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  abaAtiva === "trocas"
                    ? "border-highsoft-primario text-highsoft-primario"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                Trocas ({trocas.length})
              </button>
            </nav>
          </div>
          <div className="overflow-x-auto max-h-[32rem] overflow-y-auto">
            {abaAtiva === "itens" && (
              <table className="min-w-full">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seq.
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Depósito
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tabela
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Qtd.
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Un.
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Desconto
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Valor Bruto
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      IPI
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      ICMS
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Valor Líquido
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {itens.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="px-3 py-8 text-center text-sm text-slate-500"
                      >
                        Nenhum item encontrado
                      </td>
                    </tr>
                  ) : (
                    itens.map((item) => (
                      <tr
                        key={item.SEQ_ITEM_ORCAMENTO_OS}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-slate-700">
                          {item.SEQ_ITEM_ORCAMENTO_OS}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm text-slate-700 font-mono">
                          {item.COD_PRODUTO}.{item.COD_DERIVACAO}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {item.DES_ITEM || item.DES_PRODUTO || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {item.COD_DEPOSITO && item.DES_DEPOSITO
                            ? `${item.COD_DEPOSITO} - ${item.DES_DEPOSITO}`
                            : item.DES_DEPOSITO || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {item.COD_TABELA_PRECO && item.DES_TABELA_PRECO
                            ? `${item.COD_TABELA_PRECO} - ${item.DES_TABELA_PRECO}`
                            : item.DES_TABELA_PRECO || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {item.QTD_PEDIDA?.toFixed(4) || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">
                          {item.COD_UNIDADE_MEDIDA}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {formatarMoeda(item.VLR_PRECO_UNITARIO)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-600">
                          {item.PER_DESCONTO_ACRESCIMO
                            ? `${item.PER_DESCONTO_ACRESCIMO.toFixed(2)}%`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {formatarMoeda(item.VLR_BRUTO)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-600 tabular-nums">
                          {formatarMoeda(item.VLR_IPI)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-600 tabular-nums">
                          {formatarMoeda(item.VLR_ICMS)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-right text-slate-900 tabular-nums">
                          {formatarMoeda(item.VLR_LIQUIDO)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            {abaAtiva === "apontamentos" && (
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seq. Item
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seq. Apontamento
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Representante
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Hora Início
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Hora Término
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {apontamentos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-8 text-center text-sm text-slate-500"
                      >
                        Nenhum apontamento encontrado
                      </td>
                    </tr>
                  ) : (
                    apontamentos.map((ap, idx) => (
                      <tr
                        key={`${ap.SEQ_ITEM_ORCAMENTO_OS}-${ap.SEQ_APONTAMENTO_OS}-${idx}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
                          {ap.SEQ_ITEM_ORCAMENTO_OS}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
                          {ap.SEQ_APONTAMENTO_OS}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-800">
                          {ap.DES_REPRESENTANTE ||
                            `Cód. ${ap.COD_REPRESENTANTE}`}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 tabular-nums">
                          {ap.HORA_INICIO
                            ? formatarDataHora(ap.HORA_INICIO)
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 tabular-nums">
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
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Seq. Troca
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Depósito
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Qtd. Trocada
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Valor Bruto
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Desconto
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Valor Líquido
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Data Troca
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Usuário
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {trocas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={12}
                        className="px-3 py-8 text-center text-sm text-slate-500"
                      >
                        Nenhuma troca encontrada
                      </td>
                    </tr>
                  ) : (
                    trocas.map((troca, idx) => (
                      <tr
                        key={`${troca.SEQ_ITEM_TROCA}-${idx}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
                          {troca.SEQ_ITEM_TROCA}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 font-mono">
                          {troca.COD_PRODUTO || "-"}
                          {troca.COD_DERIVACAO && ` / ${troca.COD_DERIVACAO}`}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-800">
                          {troca.DES_ITEM || troca.DES_PRODUTO || "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-600">
                          {troca.DES_DEPOSITO || troca.COD_DEPOSITO || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {troca.QTD_TROCADA?.toFixed(4) || "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600">
                          {troca.DES_UNIDADE_MEDIDA ||
                            troca.COD_UNIDADE_MEDIDA ||
                            "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {formatarMoeda(troca.VLR_PRECO_UNITARIO)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-700 tabular-nums">
                          {formatarMoeda(troca.VLR_BRUTO)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-slate-600">
                          {troca.PER_DESCONTO
                            ? `${troca.PER_DESCONTO.toFixed(2)}%`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-right text-slate-800 tabular-nums">
                          {formatarMoeda(troca.VLR_LIQUIDO)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 tabular-nums">
                          {troca.DAT_TROCA
                            ? formatarData(troca.DAT_TROCA)
                            : "-"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700">
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

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Totalizadores
          </h2>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-3">
              <CampoReadOnly
                label="Valor Bruto"
                valor={formatarMoeda(orcamento.VLR_BRUTO)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Desconto"
                valor={
                  orcamento.VLR_DESCONTO &&
                  Number(orcamento.VLR_DESCONTO) !== 0 ? (
                    <span className="text-red-600 tabular-nums">
                      {formatarMoeda(-Math.abs(Number(orcamento.VLR_DESCONTO)))}
                    </span>
                  ) : (
                    formatarMoeda(0)
                  )
                }
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Produtos"
                valor={formatarMoeda(orcamento.VLR_PRODUTOS)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Serviços"
                valor={formatarMoeda(orcamento.VLR_SERVICOS)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Frete"
                valor={formatarMoeda(orcamento.VLR_FRETE)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Seguro"
                valor={formatarMoeda(orcamento.VLR_SEGURO)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="Outros"
                valor={formatarMoeda(orcamento.VLR_OUTROS)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="IPI"
                valor={formatarMoeda(orcamento.VLR_IPI)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="ICMS"
                valor={formatarMoeda(orcamento.VLR_ICMS)}
                className="tabular-nums"
              />
              <CampoReadOnly
                label="ISS"
                valor={formatarMoeda(orcamento.VLR_ISS)}
                className="tabular-nums"
              />
            </div>
            <div className="lg:text-right pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6">
              <span className="block text-xs font-medium text-slate-500 mb-1">
                Valor Líquido Total
              </span>
              <span className="text-2xl font-bold text-highsoft-primario tabular-nums">
                {formatarMoeda(orcamento.VLR_LIQUIDO)}
              </span>
            </div>
          </div>
        </div>
    </div>
  );
}
