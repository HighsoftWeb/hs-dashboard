"use client";

import React from "react";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { DataTable, ColunaDataTable } from "@/core/componentes/data-table/data-table";

interface UsuarioDB extends Record<string, unknown> {
  COD_USUARIO: number;
  NOM_USUARIO: string | null;
  ABR_USUARIO: string | null;
  SIT_USUARIO: string | null;
  COD_GRUPO_USUARIO: number | null;
  IND_CRIPTOGRAFADO: string | null;
}

export default function PaginaUsuarios(): React.JSX.Element {
  const colunasUsuarios: ColunaDataTable<UsuarioDB>[] = [
    { chave: "COD_USUARIO", titulo: "Código", ordenavel: true, alinhamento: "direita" },
    { chave: "NOM_USUARIO", titulo: "Nome", ordenavel: true, alinhamento: "esquerda" },
    { chave: "ABR_USUARIO", titulo: "Abreviação", ordenavel: true, alinhamento: "esquerda" },
    { chave: "COD_GRUPO_USUARIO", titulo: "Grupo", ordenavel: true, alinhamento: "direita" },
    {
      chave: "IND_CRIPTOGRAFADO",
      titulo: "Criptografado",
      ordenavel: true,
      renderizar: (valor) => {
        const ind = String(valor || "");
        return ind === "S" ? "Sim" : "Não";
      },
    },
    {
      chave: "SIT_USUARIO",
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

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <DataTable<UsuarioDB>
              colunas={colunasUsuarios}
              endpoint="/dashboard/cadastros/usuarios"
              ordenacaoPadrao={{ campo: "NOM_USUARIO", ordem: "asc" }}
            />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
