"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { clienteHttp } from "@/core/http/cliente-http";
import { TituloReceberCompletoDB } from "@/core/repository/detalhes-repository";
import { formatarData } from "@/core/utils/formatar-data";

export default function PaginaDetalhesTituloReceber(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codEmpresa = Number.parseInt(String(params.codEmpresa), 10);
  const codCliFor = Number.parseInt(String(params.codCliFor), 10);
  const codTipoTitulo = decodeURIComponent(String(params.codTipoTitulo));
  const numTitulo = decodeURIComponent(String(params.numTitulo));
  const seqTitulo = Number.parseInt(String(params.seqTitulo), 10);

  const [titulo, setTitulo] = useState<TituloReceberCompletoDB | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<TituloReceberCompletoDB>(
          `/dashboard/financeiro/titulos-receber/${codEmpresa}/${codCliFor}/${encodeURIComponent(codTipoTitulo)}/${encodeURIComponent(numTitulo)}/${seqTitulo}`
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

    if (!isNaN(codEmpresa) && !isNaN(codCliFor) && !isNaN(seqTitulo)) {
      carregarDados();
    }
  }, [codEmpresa, codCliFor, codTipoTitulo, numTitulo, seqTitulo]);

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
              Título a Receber - {titulo.NUM_TITULO}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span>
                Sequência: <strong>{titulo.SEQ_TITULO}</strong>
              </span>
              <span>
                Tipo:{" "}
                <strong>
                  {titulo.DES_TIPO_TITULO || titulo.COD_TIPO_TITULO}
                </strong>
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
                value={`${titulo.RAZ_CLI_FOR || "-"} (${titulo.COD_CLI_FOR})`}
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
                Sequência
              </label>
              <input
                type="text"
                value={titulo.SEQ_TITULO || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Vencimento
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
                Representante
              </label>
              <input
                type="text"
                value={
                  titulo.DES_REPRESENTANTE ||
                  (titulo.COD_REPRESENTANTE
                    ? `Código: ${titulo.COD_REPRESENTANTE}`
                    : "-")
                }
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
