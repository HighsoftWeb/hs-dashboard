"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { clienteHttp } from "@/core/http/cliente-http";
import { TituloPagarCompletoDB } from "@/core/repository/detalhes-repository";
import { formatarData } from "@/core/utils/formatar-data";

export default function PaginaDetalhesTituloPagar(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codEmpresa = Number.parseInt(String(params.codEmpresa), 10);
  const numInterno = Number.parseInt(String(params.numInterno), 10);
  const numParcela = Number.parseInt(String(params.numParcela), 10);

  const [titulo, setTitulo] = useState<TituloPagarCompletoDB | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<TituloPagarCompletoDB>(
          `/dashboard/financeiro/titulos-pagar/${codEmpresa}/${numInterno}/${numParcela}`
        );

        if (!resposta.success || !resposta.data) {
          throw new Error(resposta.error?.message || "Erro ao carregar título");
        }

        setTitulo(resposta.data);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codEmpresa) && !isNaN(numInterno) && !isNaN(numParcela)) {
      carregarDados();
    }
  }, [codEmpresa, numInterno, numParcela]);

  const formatarMoeda = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
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

  if (erro || !titulo) {
    return (
      <LayoutDashboard>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-800">
            {erro || "Título não encontrado"}
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
              Título a Pagar - Nº {titulo.NUM_INTERNO}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span>
                Parcela: <strong>{titulo.NUM_PARCELA}</strong>
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
                Fornecedor
              </label>
              <input
                type="text"
                value={`${titulo.RAZ_CLI_FOR || "-"} (${titulo.COD_CLI_FOR})`}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Número Interno
              </label>
              <input
                type="text"
                value={titulo.NUM_INTERNO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Parcela
              </label>
              <input
                type="text"
                value={titulo.NUM_PARCELA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Tipo Título
              </label>
              <input
                type="text"
                value={titulo.DES_TIPO_TITULO || titulo.COD_TIPO_TITULO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Número Título
              </label>
              <input
                type="text"
                value={titulo.NUM_TITULO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Número Documento
              </label>
              <input
                type="text"
                value={titulo.NUM_DOCUMENTO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Operação
              </label>
              <input
                type="text"
                value={titulo.DES_OPERACAO || titulo.COD_OPERACAO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Vencimento Original
              </label>
              <input
                type="text"
                value={formatarData(titulo.VCT_ORIGINAL)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Vencimento Prorrogado
              </label>
              <input
                type="text"
                value={formatarData(titulo.VCT_PRORROGADO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Data Emissão
              </label>
              <input
                type="text"
                value={formatarData(titulo.DAT_EMISSAO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Data Entrada
              </label>
              <input
                type="text"
                value={formatarData(titulo.DAT_ENTRADA)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Último Pagamento
              </label>
              <input
                type="text"
                value={formatarData(titulo.DAT_ULTIMO_PAGAMENTO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Provável Pagamento
              </label>
              <input
                type="text"
                value={formatarData(titulo.DAT_PROVAVEL_PAGAMENTO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Moeda
              </label>
              <input
                type="text"
                value={titulo.DES_MOEDA || titulo.COD_MOEDA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Portador
              </label>
              <input
                type="text"
                value={titulo.DES_PORTADOR || titulo.COD_PORTADOR || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Título Banco
              </label>
              <input
                type="text"
                value={titulo.NUM_TITULO_BANCO || "-"}
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
                value={titulo.SIT_TITULO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">Valores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Original
              </label>
              <input
                type="text"
                value={formatarMoeda(titulo.VLR_ORIGINAL)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Aberto
              </label>
              <input
                type="text"
                value={formatarMoeda(titulo.VLR_ABERTO)}
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
                value={formatarMoeda(titulo.VLR_DESCONTO)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                % Desconto
              </label>
              <input
                type="text"
                value={
                  titulo.PER_DESCONTO
                    ? `${titulo.PER_DESCONTO.toFixed(2)}%`
                    : "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                % Juros/Mês
              </label>
              <input
                type="text"
                value={
                  titulo.PER_JUROS_MES
                    ? `${titulo.PER_JUROS_MES.toFixed(2)}%`
                    : "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Juros/Dia
              </label>
              <input
                type="text"
                value={formatarMoeda(titulo.VLR_JUROS_DIA)}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                % Multa
              </label>
              <input
                type="text"
                value={
                  titulo.PER_MULTA ? `${titulo.PER_MULTA.toFixed(2)}%` : "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5">
              <label className="block text-xs font-medium text-gray-700 mb-0.5 text-right">
                Valor Total
              </label>
              <input
                type="text"
                value={formatarMoeda(titulo.VLR_ORIGINAL)}
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
