"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { clienteHttp } from "@/core/http/cliente-http";
import { ClienteCompletoDB } from "@/core/repository/detalhes-repository";

export default function PaginaDetalhesCliente(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const codCliFor = Number.parseInt(String(params.codCliFor), 10);

  const [cliente, setCliente] = useState<ClienteCompletoDB | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await clienteHttp.get<ClienteCompletoDB>(
          `/dashboard/cadastros/clientes/${codCliFor}`
        );

        if (!resposta.success || !resposta.data) {
          throw new Error(
            resposta.error?.message || "Erro ao carregar cliente"
          );
        }

        setCliente(resposta.data);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }

    if (!isNaN(codCliFor)) {
      carregarDados();
    }
  }, [codCliFor]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-8 w-72 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse mt-2" />
          </div>
          <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-9 w-full rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erro || !cliente) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <p className="text-sm text-red-800">
          {erro || "Cliente não encontrado"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#094A73] text-white rounded hover:bg-[#073a5c]"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cliente.RAZ_CLI_FOR || cliente.FAN_CLI_FOR || "Cliente"}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
            <span>
              Código: <strong>{cliente.COD_CLI_FOR}</strong>
            </span>
            {cliente.TIP_CLI_FOR && (
              <span>
                Tipo:{" "}
                <strong>
                  {cliente.TIP_CLI_FOR === "J"
                    ? "Jurídica"
                    : cliente.TIP_CLI_FOR === "F"
                      ? "Física"
                      : cliente.TIP_CLI_FOR}
                </strong>
              </span>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Razão Social
            </label>
            <input
              type="text"
              value={cliente.RAZ_CLI_FOR || "-"}
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
              value={cliente.FAN_CLI_FOR || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              CPF/CNPJ
            </label>
            <input
              type="text"
              value={cliente.CGC_CPF || "-"}
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
              value={cliente.END_CLI_FOR || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Número
            </label>
            <input
              type="text"
              value={cliente.NUM_END_CLI_FOR || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white text-right"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Complemento
            </label>
            <input
              type="text"
              value={cliente.COM_ENDERECO || "-"}
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
              value={cliente.BAI_CLI_FOR || "-"}
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
              value={cliente.CEP_CLI_FOR || "-"}
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
                cliente.NOM_CIDADE && cliente.SIG_ESTADO
                  ? `${cliente.NOM_CIDADE} / ${cliente.SIG_ESTADO}`
                  : cliente.NOM_CIDADE || "-"
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
              value={cliente.TEL_CLI_FOR || "-"}
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
              value={cliente.FAX_CLI_FOR || "-"}
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
              value={cliente.CEL_CLI_FOR || "-"}
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
              value={cliente.END_ELETRONICO || "-"}
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Situação
            </label>
            <input
              type="text"
              value={
                cliente.SIT_CLI_FOR === "A"
                  ? "Ativo"
                  : cliente.SIT_CLI_FOR === "I"
                    ? "Inativo"
                    : cliente.SIT_CLI_FOR || "-"
              }
              readOnly
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#094A73] focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
