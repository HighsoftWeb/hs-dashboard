"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";
import { formatarData } from "@/core/utils/formatar-data";

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

export default function PaginaContasReceber(): React.JSX.Element {
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

  const colunasTitulosReceber: ColunaDataTable<TituloReceberDB>[] = [
    {
      chave: "NUM_TITULO",
      titulo: "Número",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "SEQ_TITULO",
      titulo: "Seq.",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "COD_TIPO_TITULO",
      titulo: "Tipo",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "COD_CLI_FOR",
      titulo: "Cód. Cliente",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "DAT_EMISSAO",
      titulo: "Emissão",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined | undefined),
    },
    {
      chave: "DAT_ENTRADA",
      titulo: "Entrada",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined | undefined),
    },
    {
      chave: "VCT_ORIGINAL",
      titulo: "Vencimento",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined | undefined),
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
      chave: "COD_REPRESENTANTE",
      titulo: "Representante",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "COD_MOEDA",
      titulo: "Moeda",
      ordenavel: true,
      alinhamento: "esquerda",
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
        <h1 className="text-3xl font-bold text-gray-900">Contas a Receber</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <DataTable<TituloReceberDB>
            colunas={colunasTitulosReceber}
            endpoint="/dashboard/financeiro/titulos-receber"
            filtros={filtrosTitulos}
            valoresFiltrosIniciais={valoresFiltrosIniciais}
            ordenacaoPadrao={{ campo: "VCT_ORIGINAL", ordem: "asc" }}
            colunasTotalizar={["VLR_ORIGINAL", "VLR_ABERTO"]}
            onRowClick={(titulo) => {
              router.push(
                `/dashboard/financeiro/titulos-receber/${titulo.COD_EMPRESA}/${titulo.COD_CLI_FOR}/${encodeURIComponent(titulo.COD_TIPO_TITULO)}/${encodeURIComponent(titulo.NUM_TITULO)}/${titulo.SEQ_TITULO}`
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
