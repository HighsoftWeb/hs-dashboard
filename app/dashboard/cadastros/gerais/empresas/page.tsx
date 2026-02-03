"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import {
  DataTable,
  ColunaDataTable,
} from "@/core/componentes/data-table/data-table";

interface EmpresaDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  NOM_EMPRESA: string | null;
  FAN_EMPRESA: string | null;
  CGC_EMPRESA: string | null;
  SIT_EMPRESA: string | null;
  COD_CIDADE: number | null;
  SIG_ESTADO: string | null;
  TEL_EMPRESA: string | null;
  MAI_EMPRESA: string | null;
}

export default function PaginaEmpresas(): React.JSX.Element {
  const router = useRouter();

  const colunasEmpresas: ColunaDataTable<EmpresaDB>[] = [
    {
      chave: "COD_EMPRESA",
      titulo: "Código",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "NOM_EMPRESA",
      titulo: "Nome",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "FAN_EMPRESA",
      titulo: "Fantasia",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "CGC_EMPRESA",
      titulo: "CNPJ",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "TEL_EMPRESA",
      titulo: "Telefone",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "MAI_EMPRESA",
      titulo: "E-mail",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "COD_CIDADE",
      titulo: "Cidade",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "SIG_ESTADO",
      titulo: "Estado",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "SIT_EMPRESA",
      titulo: "Status",
      ordenavel: true,
      renderizar: (valor) => {
        const sit = String(valor || "");
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              sit === "A"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {sit === "A" ? "Ativa" : "Inativa"}
          </span>
        );
      },
    },
  ];

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DataTable<EmpresaDB>
              colunas={colunasEmpresas}
              endpoint="/dashboard/cadastros/empresas"
              ordenacaoPadrao={{ campo: "NOM_EMPRESA", ordem: "asc" }}
              onRowClick={(empresa) => {
                router.push(
                  `/dashboard/cadastros/empresas/${empresa.COD_EMPRESA}`
                );
              }}
            />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
