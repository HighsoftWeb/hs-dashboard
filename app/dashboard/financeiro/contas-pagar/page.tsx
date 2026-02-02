"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { DataTable, ColunaDataTable, FiltroDataTable } from "@/core/componentes/data-table/data-table";

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

export default function PaginaContasPagar(): React.JSX.Element {
  const router = useRouter();

  const colunasTitulosPagar: ColunaDataTable<TituloPagarDB>[] = [
    { chave: "NUM_INTERNO", titulo: "Nº Interno", ordenavel: true, alinhamento: "direita" },
    { chave: "NUM_PARCELA", titulo: "Parcela", ordenavel: true, alinhamento: "direita" },
    { chave: "COD_CLI_FOR", titulo: "Cód. Fornecedor", ordenavel: true, alinhamento: "direita" },
    {
      chave: "VCT_ORIGINAL",
      titulo: "Vencimento",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => formatarData(valor),
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
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
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
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
