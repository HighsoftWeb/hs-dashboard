"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";
import { formatarData } from "@/core/utils/formatar-data";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { obterStatus, obterCorStatus } from "@/core/utils/status-utils";

interface NotaVendaListDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  COD_SERIE_NF_VENDA: string;
  NUM_NF_VENDA: number;
  NUM_DOCUMENTO: string | null;
  COD_CLI_FOR: number;
  RAZ_CLI_FOR: string | null;
  DAT_EMISSAO: Date | null;
  VLR_LIQUIDO: number | null;
  SIT_NF: string | null;
}

export default function PaginaNotasFiscaisVenda(): React.JSX.Element {
  const router = useRouter();

  const handleRowClick = (registro: NotaVendaListDB): void => {
    router.push(
      `/dashboard/comercial/saidas/notas-fiscais-venda/${registro.COD_EMPRESA}/${registro.COD_SERIE_NF_VENDA}/${registro.NUM_NF_VENDA}`
    );
  };

  const colunas: ColunaDataTable<NotaVendaListDB>[] = [
    {
      chave: "COD_SERIE_NF_VENDA",
      titulo: "Série",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "NUM_NF_VENDA",
      titulo: "Nº NF",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "NUM_DOCUMENTO",
      titulo: "Nº Documento",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "RAZ_CLI_FOR",
      titulo: "Cliente",
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
      titulo: "Data Emissão",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined),
    },
    {
      chave: "VLR_LIQUIDO",
      titulo: "Valor Líquido",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => formatarMoeda(Number(valor || 0)),
    },
    {
      chave: "SIT_NF",
      titulo: "Status",
      ordenavel: true,
      renderizar: (valor) => {
        const sit = String(valor || "");
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${obterCorStatus(sit)}`}
          >
            {obterStatus(sit)}
          </span>
        );
      },
    },
  ];

  const filtros: FiltroDataTable[] = [
    {
      chave: "sit",
      tipo: "select",
      rotulo: "Status",
      opcoes: [
        { valor: "DG", label: "Digitada" },
        { valor: "PR", label: "Processada" },
        { valor: "CA", label: "Cancelada" },
      ],
    },
    {
      chave: "indOrc",
      tipo: "select",
      rotulo: "Origem",
      opcoes: [
        { valor: "OR", label: "Orçamento" },
        { valor: "OS", label: "Ordem de Serviço" },
      ],
    },
    {
      chave: "serieOrc",
      tipo: "texto",
      rotulo: "Série Origem",
      placeholder: "Ex: 001",
    },
    {
      chave: "numOrc",
      tipo: "numero",
      rotulo: "Nº Orçamento/OS",
      placeholder: "Número",
    },
  ];

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notas Fiscais de Venda
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DataTable<NotaVendaListDB>
              colunas={colunas}
              endpoint="/dashboard/comercial/saidas/notas-fiscais-venda"
              filtros={filtros}
              ordenacaoPadrao={{ campo: "DAT_EMISSAO", ordem: "desc" }}
              onRowClick={handleRowClick}
              colunasTotalizar={["VLR_LIQUIDO"]}
            />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
