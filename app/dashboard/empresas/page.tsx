"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { servicoEmpresa } from "@/core/empresas/servico-empresa";
import { Empresa } from "@/core/tipos";
import { Botao } from "@/core/componentes/botao/botao";

export default function PaginaEmpresas(): React.JSX.Element {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async (): Promise<void> => {
    try {
      setCarregando(true);
      setErro("");
      const listaEmpresas = await servicoEmpresa.listarEmpresas();
      setEmpresas(listaEmpresas);
    } catch (erroCarregar) {
      setErro(
        erroCarregar instanceof Error
          ? erroCarregar.message
          : "Erro ao carregar empresas"
      );
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Empresas
            </h1>
            <p className="mt-2 text-gray-600">
              Gerencie as empresas do sistema
            </p>
          </div>
          <Botao variante="primario">Nova Empresa</Botao>
        </div>
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-800">{erro}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {empresas.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhuma empresa encontrada
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {empresa.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          empresa.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {empresa.ativo ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#094A73] hover:text-[#073a5c]">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutDashboard>
  );
}
