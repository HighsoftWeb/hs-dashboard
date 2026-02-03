"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { clienteHttp } from "@/core/http/cliente-http";
import { EmpresaCompletoDB } from "@/core/repository/detalhes-repository";

export default function PaginaDetalhesEmpresa(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codEmpresa = Number.parseInt(String(params.codEmpresa), 10);

  const [empresa, setEmpresa] = useState<EmpresaCompletoDB | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<EmpresaCompletoDB>(
          `/dashboard/cadastros/empresas/${codEmpresa}`
        );

        if (!resposta.success || !resposta.data) {
          throw new Error(
            resposta.error?.message || "Erro ao carregar empresa"
          );
        }

        setEmpresa(resposta.data);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codEmpresa)) {
      carregarDados();
    }
  }, [codEmpresa]);

  if (carregando) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </LayoutDashboard>
    );
  }

  if (erro || !empresa) {
    return (
      <LayoutDashboard>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-800">
            {erro || "Empresa não encontrada"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#094A73] text-white rounded hover:bg-[#073a5c]"
          >
            Voltar
          </button>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {empresa.NOM_EMPRESA || empresa.FAN_EMPRESA || "Empresa"}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span>
                Código: <strong>{empresa.COD_EMPRESA}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Voltar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Dados da Empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Razão Social
              </label>
              <input
                type="text"
                value={empresa.NOM_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={empresa.FAN_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                CNPJ
              </label>
              <input
                type="text"
                value={empresa.CGC_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={empresa.IES_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Inscrição Municipal
              </label>
              <input
                type="text"
                value={empresa.IMU_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Endereço
              </label>
              <input
                type="text"
                value={empresa.END_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                CEP
              </label>
              <input
                type="text"
                value={empresa.CEP_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Bairro
              </label>
              <input
                type="text"
                value={empresa.BAI_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Cidade
              </label>
              <input
                type="text"
                value={
                  empresa.NOM_CIDADE && empresa.SIG_ESTADO
                    ? `${empresa.NOM_CIDADE} / ${empresa.SIG_ESTADO}`
                    : empresa.NOM_CIDADE || "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Telefone
              </label>
              <input
                type="text"
                value={empresa.TEL_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Fax
              </label>
              <input
                type="text"
                value={empresa.FAX_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Celular
              </label>
              <input
                type="text"
                value={empresa.CEL_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                E-mail
              </label>
              <input
                type="text"
                value={empresa.MAI_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Website
              </label>
              <input
                type="text"
                value={empresa.WWW_EMPRESA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Endereço de Entrega
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Endereço
              </label>
              <input
                type="text"
                value={empresa.END_ENTREGA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                CEP
              </label>
              <input
                type="text"
                value={empresa.CEP_ENTREGA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Bairro
              </label>
              <input
                type="text"
                value={empresa.BAI_ENTREGA || "-"}
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Cidade
              </label>
              <input
                type="text"
                value={
                  empresa.NOM_CIDADE_ENTREGA && empresa.SIG_ESTADO_ENTREGA
                    ? `${empresa.NOM_CIDADE_ENTREGA} / ${empresa.SIG_ESTADO_ENTREGA}`
                    : empresa.NOM_CIDADE_ENTREGA || "-"
                }
                readOnly
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
