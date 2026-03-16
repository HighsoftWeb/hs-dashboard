"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";

interface ClienteDB extends Record<string, unknown> {
  COD_CLI_FOR: number;
  RAZ_CLI_FOR: string | null;
  FAN_CLI_FOR: string | null;
  CLI_FOR_AMBOS: string | null;
  TIP_CLI_FOR: string | null;
  CGC_CPF: string | null;
  SIT_CLI_FOR: string | null;
  COD_CIDADE: number | null;
  SIG_ESTADO: string | null;
  TEL_CLI_FOR: string | null;
  END_ELETRONICO: string | null;
}

export default function PaginaClientes(): React.JSX.Element {
  const router = useRouter();

  const colunasClientes: ColunaDataTable<ClienteDB>[] = [
    {
      chave: "COD_CLI_FOR",
      titulo: "Código",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "RAZ_CLI_FOR",
      titulo: "Razão Social",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "FAN_CLI_FOR",
      titulo: "Fantasia",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "CGC_CPF",
      titulo: "CPF/CNPJ",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "TIP_CLI_FOR",
      titulo: "Tipo Pessoa",
      ordenavel: true,
      renderizar: (valor) => {
        const tipo = String(valor || "");
        return tipo === "F" ? "Física" : tipo === "J" ? "Jurídica" : tipo;
      },
    },
    {
      chave: "CLI_FOR_AMBOS",
      titulo: "Relacionamento",
      ordenavel: true,
      renderizar: (valor) => {
        const tipo = String(valor || "");
        const tipos: Record<string, string> = {
          C: "Cliente",
          F: "Fornecedor",
          A: "Ambos",
          P: "Prospecção",
          M: "Motorista",
          O: "Outros",
        };
        return tipos[tipo] || tipo;
      },
    },
    {
      chave: "TEL_CLI_FOR",
      titulo: "Telefone",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "END_ELETRONICO",
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
      chave: "SIT_CLI_FOR",
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

  const filtrosClientes: FiltroDataTable[] = [
    {
      chave: "sit",
      tipo: "select",
      rotulo: "Status",
      opcoes: [
        { valor: "A", label: "Ativo" },
        { valor: "I", label: "Inativo" },
      ],
    },
    {
      chave: "tipo",
      tipo: "select",
      rotulo: "Tipo",
      opcoes: [
        { valor: "C", label: "Cliente" },
        { valor: "F", label: "Fornecedor" },
        { valor: "A", label: "Ambos" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Clientes/Fornecedores
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <DataTable<ClienteDB>
            colunas={colunasClientes}
            endpoint="/dashboard/cadastros/clientes"
            filtros={filtrosClientes}
            ordenacaoPadrao={{ campo: "COD_CLI_FOR", ordem: "desc" }}
            onRowClick={(cliente) => {
              router.push(
                `/dashboard/cadastros/clientes/${cliente.COD_CLI_FOR}`
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
