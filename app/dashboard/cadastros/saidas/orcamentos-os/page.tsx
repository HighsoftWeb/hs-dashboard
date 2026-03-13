"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";
import { formatarData } from "@/core/utils/formatar-data";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { obterStatus, obterCorStatus } from "@/core/utils/status-utils";

interface OrcamentoOSDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  IND_ORCAMENTO_OS: string;
  NUM_ORCAMENTO_OS: number;
  COD_CLI_FOR: number;
  COD_SERIE_ORC_OS: string;
  NUM_DOCUMENTO: string | null;
  DAT_EMISSAO: Date | null;
  VLR_LIQUIDO: number | null;
  SIT_ORCAMENTO_OS: string | null;
  RAZ_CLI_FOR: string | null;
}

export default function PaginaOrcamentosOS(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sit = searchParams.get("sit") ?? "";
  const ind = searchParams.get("ind") ?? "";
  const valoresFiltrosIniciais: Record<string, string> = {};
  if (sit) valoresFiltrosIniciais.sit = sit;
  if (ind) valoresFiltrosIniciais.ind = ind;

  const handleRowClick = (registro: OrcamentoOSDB): void => {
    router.push(
      `/dashboard/comercial/orcamentos/${registro.COD_EMPRESA}/${registro.IND_ORCAMENTO_OS}/${registro.NUM_ORCAMENTO_OS}`
    );
  };

  const colunasOrcamentos: ColunaDataTable<OrcamentoOSDB>[] = [
    {
      chave: "DAT_EMISSAO",
      titulo: "Data Emissão",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) =>
        formatarData(valor as Date | string | null | undefined),
    },
    {
      chave: "IND_ORCAMENTO_OS",
      titulo: "Tipo",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        const ind = String(valor || "");
        return ind === "OR"
          ? "Orçamento"
          : ind === "OS"
            ? "Ordem de Serviço"
            : ind;
      },
    },
    {
      chave: "NUM_ORCAMENTO_OS",
      titulo: "Nº Orçamento",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "COD_SERIE_ORC_OS",
      titulo: "Série",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "NUM_DOCUMENTO",
      titulo: "Nº Documento",
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
      chave: "RAZ_CLI_FOR",
      titulo: "Cliente",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "VLR_LIQUIDO",
      titulo: "Valor Líquido",
      ordenavel: true,
      alinhamento: "direita",
      renderizar: (valor) => formatarMoeda(Number(valor || 0)),
    },
    {
      chave: "SIT_ORCAMENTO_OS",
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

  const filtrosOrcamentos: FiltroDataTable[] = [
    {
      chave: "ind",
      tipo: "select",
      rotulo: "Tipo",
      opcoes: [
        { valor: "OR", label: "Orçamento" },
        { valor: "OS", label: "Ordem de Serviço" },
      ],
    },
    {
      chave: "sit",
      tipo: "select",
      rotulo: "Status",
      opcoes: [
        { valor: "AB", label: "Aberto Total" },
        { valor: "AP", label: "Aprovado" },
        { valor: "PR", label: "Processado" },
        { valor: "CA", label: "Cancelado" },
        { valor: "RO", label: "Romaneio" },
        { valor: "AA", label: "Aguardando Aprovação" },
        { valor: "FP", label: "Faturado Parcial" },
        { valor: "OP", label: "Ordem de Produção" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Orçamentos / Ordens de Serviço
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <DataTable<OrcamentoOSDB>
            colunas={colunasOrcamentos}
            endpoint="/dashboard/comercial/orcamentos"
            filtros={filtrosOrcamentos}
            valoresFiltrosIniciais={valoresFiltrosIniciais}
            ordenacaoPadrao={{ campo: "DAT_EMISSAO", ordem: "desc" }}
            onRowClick={handleRowClick}
            colunasTotalizar={["VLR_LIQUIDO"]}
          />
        </div>
      </div>
    </div>
  );
}
