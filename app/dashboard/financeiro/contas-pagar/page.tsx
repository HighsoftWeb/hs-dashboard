"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";
import { SkeletonDataTable } from "@/core/componentes/skeleton-data-table/skeleton-data-table";
import { formatarData } from "@/core/utils/formatar-data";

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

function ConteudoContasPagar(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const valoresFiltrosIniciais = useMemo(() => {
    const ini: Record<string, string> = {};
    const faixa = searchParams.get("faixa");
    if (faixa) ini.faixa = faixa;
    const sit = searchParams.get("sit");
    if (sit) ini.sit = sit;
    const codCliFor = searchParams.get("codCliFor");
    if (codCliFor) ini.codCliFor = codCliFor;
    return ini;
  }, [searchParams]);

  const colunasTitulosPagar: ColunaDataTable<TituloPagarDB>[] = [
    {
      chave: "NUM_INTERNO",
      titulo: "Nº Interno",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "NUM_PARCELA",
      titulo: "Parcela",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "COD_CLI_FOR",
      titulo: "Cód. Fornecedor",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "VCT_ORIGINAL",
      titulo: "Vencimento",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined),
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
            ? "bg-blue-100 text-blue-800"
            : sit === "CA"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800";
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cor}`}
          >
            {sit}
          </span>
        );
      },
    },
  ];

  const filtrosTitulos: FiltroDataTable[] = [
    {
      chave: "faixa",
      tipo: "select",
      rotulo: "Faixa Vencimento",
      opcoes: [
        { valor: "vencido", label: "Vencido" },
        { valor: "0-30", label: "0-30 dias" },
        { valor: "31-60", label: "31-60 dias" },
        { valor: "61-90", label: "61-90 dias" },
        { valor: "acima-90", label: "Acima 90 dias" },
      ],
    },
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
            valoresFiltrosIniciais={valoresFiltrosIniciais}
            ordenacaoPadrao={{ campo: "DAT_EMISSAO", ordem: "desc" }}
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
  );
}

export default function PaginaContasPagar(): React.JSX.Element {
  return (
    <Suspense fallback={<SkeletonDataTable />}>
      <ConteudoContasPagar />
    </Suspense>
  );
}
