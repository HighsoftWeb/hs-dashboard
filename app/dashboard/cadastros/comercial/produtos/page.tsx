"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { DataTable, ColunaDataTable, FiltroDataTable } from "@/core/componentes/data-table/data-table";

interface ProdutoDB extends Record<string, unknown> {
  COD_EMPRESA: number;
  COD_PRODUTO: number;
  DES_PRODUTO: string | null;
  IND_PRODUTO_SERVICO: string | null;
  SIT_PRODUTO: string | null;
  COD_UNIDADE_MEDIDA: string | null;
  OBS_PRODUTO: string | null;
  COD_USUARIO: number | null;
}

export default function PaginaProdutos(): React.JSX.Element {
  const router = useRouter();

  const colunasProdutos: ColunaDataTable<ProdutoDB>[] = [
    { chave: "COD_PRODUTO", titulo: "Código", ordenavel: true, alinhamento: "direita" },
    { chave: "DES_PRODUTO", titulo: "Descrição", ordenavel: true, alinhamento: "esquerda" },
    {
      chave: "IND_PRODUTO_SERVICO",
      titulo: "Tipo",
      ordenavel: true,
      alinhamento: "esquerda",
      renderizar: (valor) => {
        const ind = String(valor || "");
        return ind === "P" ? "Produto" : ind === "S" ? "Serviço" : ind;
      },
    },
    { chave: "COD_UNIDADE_MEDIDA", titulo: "Unidade", ordenavel: true, alinhamento: "esquerda" },
    { chave: "COD_USUARIO", titulo: "Usuário", ordenavel: true, alinhamento: "direita" },
    {
      chave: "OBS_PRODUTO",
      titulo: "Observações",
      ordenavel: false,
      renderizar: (valor) => {
        const obs = String(valor || "");
        return obs.length > 50 ? `${obs.substring(0, 50)}...` : obs || "-";
      },
    },
    {
      chave: "SIT_PRODUTO",
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
            {sit === "A" ? "Ativo" : "Inativo"}
          </span>
        );
      },
    },
  ];

  const filtrosProdutos: FiltroDataTable[] = [
    {
      chave: "sit",
      tipo: "select",
      rotulo: "Status",
      opcoes: [
        { valor: "A", label: "Ativo" },
        { valor: "I", label: "Inativo" },
      ],
    },
  ];

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DataTable<ProdutoDB>
              colunas={colunasProdutos}
              endpoint="/dashboard/cadastros/produtos"
              filtros={filtrosProdutos}
              ordenacaoPadrao={{ campo: "DES_PRODUTO", ordem: "asc" }}
              onRowClick={(produto) => {
                router.push(`/dashboard/cadastros/produtos/${produto.COD_PRODUTO}`);
              }}
            />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
