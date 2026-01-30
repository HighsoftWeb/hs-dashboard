"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { DataTable, ColunaDataTable, FiltroDataTable } from "@/core/componentes/data-table/data-table";

interface TituloReceberDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  COD_CLI_FOR: number;
  COD_TIPO_TITULO: string;
  NUM_TITULO: string;
  SEQ_TITULO: number;
  SIT_TITULO: string;
  VCT_ORIGINAL: Date | null;
  VLR_ABERTO: number | null;
  VLR_ORIGINAL: number | null;
  DAT_EMISSAO: Date | null;
  DAT_ENTRADA: Date | null;
  COD_REPRESENTANTE: number | null;
  COD_MOEDA: string | null;
}

interface TituloPagarDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  NUM_INTERNO: number;
  NUM_PARCELA: number;
  COD_CLI_FOR: number;
  SIT_TITULO: string;
  VCT_ORIGINAL: Date | null;
  VLR_ABERTO: number | null;
  VLR_ORIGINAL: number | null;
}

export default function PaginaFinanceiro(): React.JSX.Element {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"receber" | "pagar">("receber");

  const colunasTitulosReceber: ColunaDataTable<TituloReceberDB>[] = [
    { chave: "NUM_TITULO", titulo: "Número", ordenavel: true, alinhamento: "esquerda" },
    { chave: "SEQ_TITULO", titulo: "Seq.", ordenavel: true, alinhamento: "direita" },
    { chave: "COD_TIPO_TITULO", titulo: "Tipo", ordenavel: true, alinhamento: "esquerda" },
    { chave: "COD_CLI_FOR", titulo: "Cód. Cliente", ordenavel: true, alinhamento: "direita" },
    {
      chave: "DAT_EMISSAO",
      titulo: "Emissão",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        if (!valor) return "-";
        const data = valor instanceof Date ? valor : new Date(String(valor));
        if (isNaN(data.getTime())) return "-";
        return data.toLocaleDateString("pt-BR");
      },
    },
    {
      chave: "DAT_ENTRADA",
      titulo: "Entrada",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        if (!valor) return "-";
        const data = valor instanceof Date ? valor : new Date(String(valor));
        if (isNaN(data.getTime())) return "-";
        return data.toLocaleDateString("pt-BR");
      },
    },
    {
      chave: "VCT_ORIGINAL",
      titulo: "Vencimento",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        if (!valor) return "-";
        const data = valor instanceof Date ? valor : new Date(String(valor));
        if (isNaN(data.getTime())) return "-";
        return data.toLocaleDateString("pt-BR");
      },
    },
    {
      chave: "VLR_ORIGINAL",
      titulo: "Valor Original",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => {
        const vlr = Number(valor || 0);
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(vlr);
      },
    },
    {
      chave: "VLR_ABERTO",
      titulo: "Valor Aberto",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => {
        const vlr = Number(valor || 0);
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(vlr);
      },
    },
    { chave: "COD_REPRESENTANTE", titulo: "Representante", ordenavel: true, alinhamento: "direita" },
    { chave: "COD_MOEDA", titulo: "Moeda", ordenavel: true, alinhamento: "esquerda" },
    {
      chave: "SIT_TITULO",
      titulo: "Status",
      ordenavel: true,
      renderizar: (valor) => {
        const sit = String(valor || "");
        const cor =
          sit === "PG" || sit === "BA"
            ? "bg-green-100 text-green-800"
            : sit === "CA"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800";
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cor}`}>
            {sit}
          </span>
        );
      },
    },
  ];

  const colunasTitulosPagar: ColunaDataTable<TituloPagarDB>[] = [
    { chave: "NUM_INTERNO", titulo: "Nº Interno", ordenavel: true, alinhamento: "direita" },
    { chave: "NUM_PARCELA", titulo: "Parcela", ordenavel: true, alinhamento: "direita" },
    { chave: "COD_CLI_FOR", titulo: "Cód. Fornecedor", ordenavel: true, alinhamento: "direita" },
    {
      chave: "VCT_ORIGINAL",
      titulo: "Vencimento",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        if (!valor) return "-";
        const data = valor instanceof Date ? valor : new Date(String(valor));
        if (isNaN(data.getTime())) return "-";
        return data.toLocaleDateString("pt-BR");
      },
    },
    {
      chave: "VLR_ORIGINAL",
      titulo: "Valor Original",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => {
        const vlr = Number(valor || 0);
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(vlr);
      },
    },
    {
      chave: "VLR_ABERTO",
      titulo: "Valor Aberto",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => {
        const vlr = Number(valor || 0);
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(vlr);
      },
    },
    {
      chave: "SIT_TITULO",
      titulo: "Status",
      ordenavel: true,
      renderizar: (valor) => {
        const sit = String(valor || "");
        const cor =
          sit === "PG" || sit === "BA"
            ? "bg-green-100 text-green-800"
            : sit === "CA"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800";
    return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cor}`}>
            {sit}
          </span>
        );
      },
    },
  ];

  const filtrosTitulos: FiltroDataTable[] = [
    {
      chave: "sit",
      tipo: "select",
      rotulo: "Status",
      opcoes: [
        { valor: "AB", label: "Aberto" },
        { valor: "PG", label: "Pago" },
        { valor: "BA", label: "Baixado" },
        { valor: "CA", label: "Cancelado" },
      ],
    },
    {
      chave: "dataInicio",
      tipo: "data",
      rotulo: "Data Início",
    },
    {
      chave: "dataFim",
      tipo: "data",
      rotulo: "Data Fim",
    },
  ];

  return (
    <LayoutDashboard>
      <div className="space-y-6">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setAbaAtiva("receber")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "receber"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Títulos a Receber
              </button>
              <button
                onClick={() => setAbaAtiva("pagar")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "pagar"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Títulos a Pagar
              </button>
            </nav>
          </div>

          <div className="p-6">
            {abaAtiva === "receber" && (
              <DataTable<TituloReceberDB>
                colunas={colunasTitulosReceber}
                endpoint="/dashboard/financeiro/titulos-receber"
                filtros={filtrosTitulos}
                ordenacaoPadrao={{ campo: "VCT_ORIGINAL", ordem: "asc" }}
                colunasTotalizar={["VLR_ORIGINAL", "VLR_ABERTO"]}
                onRowClick={(titulo) => {
                  router.push(
                    `/dashboard/financeiro/titulos-receber/${titulo.COD_EMPRESA}/${titulo.COD_CLI_FOR}/${encodeURIComponent(titulo.COD_TIPO_TITULO)}/${encodeURIComponent(titulo.NUM_TITULO)}/${titulo.SEQ_TITULO}`
                  );
                }}
              />
            )}

            {abaAtiva === "pagar" && (
              <DataTable<TituloPagarDB>
                colunas={colunasTitulosPagar}
                endpoint="/dashboard/financeiro/titulos-pagar"
                filtros={filtrosTitulos}
                ordenacaoPadrao={{ campo: "VCT_ORIGINAL", ordem: "asc" }}
                colunasTotalizar={["VLR_ORIGINAL", "VLR_ABERTO"]}
                onRowClick={(titulo) => {
                  router.push(
                    `/dashboard/financeiro/titulos-pagar/${titulo.COD_EMPRESA}/${titulo.NUM_INTERNO}/${titulo.NUM_PARCELA}`
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
