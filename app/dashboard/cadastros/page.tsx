"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import {
  DataTable,
  ColunaDataTable,
  FiltroDataTable,
} from "@/core/componentes/data-table/data-table";

interface UsuarioDB extends Record<string, unknown> {
  COD_USUARIO: number;
  NOM_USUARIO: string | null;
  ABR_USUARIO: string | null;
  SIT_USUARIO: string | null;
  COD_GRUPO_USUARIO: number | null;
  IND_CRIPTOGRAFADO: string | null;
}

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

export default function PaginaCadastros(): React.JSX.Element {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<
    "usuarios" | "empresas" | "clientes" | "produtos"
  >("usuarios");

  const colunasUsuarios: ColunaDataTable<UsuarioDB>[] = [
    {
      chave: "COD_USUARIO",
      titulo: "Código",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "NOM_USUARIO",
      titulo: "Nome",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "ABR_USUARIO",
      titulo: "Abreviação",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "COD_GRUPO_USUARIO",
      titulo: "Grupo",
      ordenavel: true,
      alinhamento: "direita",
    },
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

  const colunasProdutos: ColunaDataTable<ProdutoDB>[] = [
    {
      chave: "COD_PRODUTO",
      titulo: "Código",
      ordenavel: true,
      alinhamento: "direita",
    },
    {
      chave: "DES_PRODUTO",
      titulo: "Descrição",
      ordenavel: true,
      alinhamento: "esquerda",
    },
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
    {
      chave: "COD_UNIDADE_MEDIDA",
      titulo: "Unidade",
      ordenavel: true,
      alinhamento: "esquerda",
    },
    {
      chave: "COD_USUARIO",
      titulo: "Usuário",
      ordenavel: true,
      alinhamento: "direita",
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Cadastros</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setAbaAtiva("usuarios")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "usuarios"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Usuários
              </button>
              <button
                onClick={() => setAbaAtiva("empresas")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "empresas"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Empresas
              </button>
              <button
                onClick={() => setAbaAtiva("clientes")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "clientes"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Clientes/Fornecedores
              </button>
              <button
                onClick={() => setAbaAtiva("produtos")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  abaAtiva === "produtos"
                    ? "border-[#094A73] text-[#094A73]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Produtos
              </button>
            </nav>
          </div>

          <div className="p-6">
            {abaAtiva === "usuarios" && (
              <DataTable<UsuarioDB>
                colunas={colunasUsuarios}
                endpoint="/dashboard/cadastros/usuarios"
                ordenacaoPadrao={{ campo: "NOM_USUARIO", ordem: "asc" }}
              />
            )}

            {abaAtiva === "empresas" && (
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
            )}

            {abaAtiva === "clientes" && (
              <DataTable<ClienteDB>
                colunas={colunasClientes}
                endpoint="/dashboard/cadastros/clientes"
                filtros={filtrosClientes}
                ordenacaoPadrao={{ campo: "RAZ_CLI_FOR", ordem: "asc" }}
                onRowClick={(cliente) => {
                  router.push(
                    `/dashboard/cadastros/clientes/${cliente.COD_CLI_FOR}`
                  );
                }}
              />
            )}

            {abaAtiva === "produtos" && (
              <DataTable<ProdutoDB>
                colunas={colunasProdutos}
                endpoint="/dashboard/cadastros/produtos"
                filtros={filtrosProdutos}
                ordenacaoPadrao={{ campo: "DES_PRODUTO", ordem: "asc" }}
                onRowClick={(produto) => {
                  router.push(
                    `/dashboard/cadastros/produtos/${produto.COD_PRODUTO}`
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
