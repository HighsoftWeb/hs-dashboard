"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { DataTable, ColunaDataTable, FiltroDataTable } from "@/core/componentes/data-table/data-table";

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

export default function PaginaComercial(): React.JSX.Element {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<"orcamentos">("orcamentos");

  const handleRowClick = (registro: OrcamentoOSDB): void => {
    router.push(
      `/dashboard/comercial/orcamentos/${registro.COD_EMPRESA}/${registro.IND_ORCAMENTO_OS}/${registro.NUM_ORCAMENTO_OS}`
    );
  };

  const colunasOrcamentos: ColunaDataTable<OrcamentoOSDB>[] = [
    {
      chave: "IND_ORCAMENTO_OS",
      titulo: "Tipo",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        const ind = String(valor || "");
        return ind === "OR" ? "Orçamento" : ind === "OS" ? "Ordem de Serviço" : ind;
      },
    },
    { chave: "NUM_ORCAMENTO_OS", titulo: "Nº Orçamento", ordenavel: true, alinhamento: "direita" },
    { chave: "NUM_DOCUMENTO", titulo: "Nº Documento", ordenavel: true, alinhamento: "esquerda" },
    { chave: "COD_SERIE_ORC_OS", titulo: "Série", ordenavel: true, alinhamento: "esquerda" },
    { chave: "RAZ_CLI_FOR", titulo: "Cliente", ordenavel: true, alinhamento: "esquerda" },
    { chave: "COD_CLI_FOR", titulo: "Cód. Cliente", ordenavel: true, alinhamento: "direita" },
    {
      chave: "DAT_EMISSAO",
      titulo: "Data Emissão",
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
      chave: "VLR_LIQUIDO",
      titulo: "Valor Líquido",
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
      chave: "SIT_ORCAMENTO_OS",
      titulo: "Status",
      ordenavel: true,
      renderizar: (valor) => {
        const sit = String(valor || "");
        const status: Record<string, string> = {
          AB: "Aberto Total",
          AP: "Aprovado",
          PR: "Processado",
          CA: "Cancelado",
          RO: "Romaneio",
          AA: "Aguardando Aprovação",
          FP: "Faturado Parcial",
          OP: "Ordem de Produção",
        };
        const cor =
          sit === "AP" || sit === "PR"
            ? "bg-green-100 text-green-800"
            : sit === "CA"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800";
    return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cor}`}>
            {status[sit] || sit}
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
    <LayoutDashboard>
      <div className="space-y-6">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Comercial</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setAbaAtiva("orcamentos")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "orcamentos"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orçamentos/OS
              </button>
            </nav>
          </div>

          <div className="p-6">
            {abaAtiva === "orcamentos" && (
              <DataTable<OrcamentoOSDB>
                colunas={colunasOrcamentos}
                endpoint="/dashboard/comercial/orcamentos"
                filtros={filtrosOrcamentos}
                ordenacaoPadrao={{ campo: "DAT_EMISSAO", ordem: "desc" }}
                onRowClick={handleRowClick}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
