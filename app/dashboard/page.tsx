"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Package, FileText, User } from "lucide-react";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { Orcamento } from "@/core/tipos";
import { servicoDashboard, ContaVencendo } from "@/core/dashboard/servico-dashboard";
import { EstatisticasDashboard } from "@/core/tipos/dashboard-db";
import { DEFAULT_COD_EMPRESA } from "@/core/db/validar-env";

export default function PaginaDashboard(): React.JSX.Element {
  const router = useRouter();
  const [estatisticas, setEstatisticas] = useState<EstatisticasDashboard>({
    totalUsuarios: 0,
    totalEmpresas: 0,
    totalClientes: 0,
    totalProdutos: 0,
    orcamentosHoje: 0,
    orcamentosMes: 0,
    receitasMes: 0,
    despesasMes: 0,
    lucroMes: 0,
  });
  const [orcamentosRecentes, setOrcamentosRecentes] = useState<Orcamento[]>([]);
  const [contasVencendo, setContasVencendo] = useState<ContaVencendo[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        const [stats, orcs, contas] = await Promise.all([
          servicoDashboard.obterEstatisticas(),
          servicoDashboard.listarOrcamentosRecentes(10),
          servicoDashboard.listarContasVencendo(30),
        ]);
        setEstatisticas(stats);
        setOrcamentosRecentes(orcs);
        setContasVencendo(contas);
        setErro("");
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const formatarMoeda = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: Date | string | null | undefined): string => {
    if (!data) {
      return "-";
    }

    const dataObj = data instanceof Date ? data : new Date(data);

    if (isNaN(dataObj.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dataObj);
  };

  const obterCorStatus = (status: string): string => {
    const statusUpper = status.toUpperCase();
    
    if (statusUpper.includes("APROVADO") || statusUpper.includes("PROCESSADO") || statusUpper.includes("FATURADO")) {
      return "bg-[#10B981]/20 text-[#10B981]";
    }
    
    if (statusUpper.includes("CANCELADO")) {
      return "bg-[#EF4444]/20 text-[#EF4444]";
    }
    
    if (statusUpper.includes("ABERTO") || statusUpper.includes("AGUARDANDO") || statusUpper.includes("ROMANEIO") || statusUpper.includes("ORDEM")) {
      return "bg-[#F59E0B]/20 text-[#F59E0B]";
    }
    
    return "bg-[#A4A5A6]/20 text-[#A4A5A6]";
  };

  const obterNomeDocumento = (tipo?: string): string => {
    switch (tipo) {
      case "orcamento":
        return "Orçamento";
      case "ordem-servico":
        return "Ordem de Serviço";
      case "nota-fiscal-venda":
        return "Nota Fiscal de Venda";
      default:
        return "Orçamento";
    }
  };

  if (carregando) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </LayoutDashboard>
    );
  }

  if (erro) {
    return (
      <LayoutDashboard>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)]">
        <div className="flex-shrink-0 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Usuários
                </p>
                <p className="text-2xl font-bold text-[#094A73]">
                  {estatisticas.totalUsuarios}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#094A73]/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-[#094A73]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Clientes
                </p>
                <p className="text-2xl font-bold text-[#048ABF]">
                  {estatisticas.totalClientes}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#048ABF]/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#048ABF]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Produtos
                </p>
                <p className="text-2xl font-bold text-[#04B2D9]">
                  {estatisticas.totalProdutos}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#04B2D9]/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-[#04B2D9]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Orçamentos Hoje
                </p>
                <p className="text-2xl font-bold text-[#094A73]">
                  {estatisticas.orcamentosHoje}
                </p>
              </div>
              <div className="w-12 h-12 bg-[#A4A5A6]/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#A4A5A6]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
              <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Orçamentos / Ordens de Serviço
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        Tipo
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        Número
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        Data
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        Valor
                      </th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 border-b border-gray-100">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orcamentosRecentes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-2 py-4 text-center text-sm text-gray-500"
                        >
                          Nenhum orçamento recente
                        </td>
                      </tr>
                    ) : (
                      orcamentosRecentes.map((orcamento) => {
                        const partesId = orcamento.id.split("-");
                        const codEmpresa = partesId.length >= 3 ? Number.parseInt(partesId[0], 10) : DEFAULT_COD_EMPRESA;
                        const indOrcamentoOS = partesId.length >= 3 ? partesId[1] : "OR";
                        const numOrcamentoOS = partesId.length >= 3 ? Number.parseInt(partesId[2], 10) : 0;
                        
                        return (
                          <tr
                            key={orcamento.id}
                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            onClick={() => {
                              if (numOrcamentoOS > 0) {
                                router.push(
                                  `/dashboard/comercial/orcamentos/${codEmpresa}/${indOrcamentoOS}/${numOrcamentoOS}`
                                );
                              }
                            }}
                          >
                          <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-[#094A73]">
                            {obterNomeDocumento(orcamento.tipo)}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                            {orcamento.numero}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">
                            {formatarData(orcamento.data)}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatarMoeda(orcamento.valorTotal)}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${obterCorStatus(
                                orcamento.status
                              )}`}
                            >
                              {orcamento.status}
                            </span>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="bg-gradient-to-br from-[#094A73] to-[#048ABF] rounded-lg shadow-sm p-4 text-white">
                <p className="text-xs font-medium opacity-90">Receitas do Mês</p>
                <p className="text-xl font-bold mt-1">
                  {formatarMoeda(estatisticas.receitasMes)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-lg shadow-sm p-4 text-white">
                <p className="text-xs font-medium opacity-90">Despesas do Mês</p>
                <p className="text-xl font-bold mt-1">
                  {formatarMoeda(estatisticas.despesasMes)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg shadow-sm p-4 text-white">
                <p className="text-xs font-medium opacity-90">Lucro do Mês</p>
                <p className="text-xl font-bold mt-1">
                  {formatarMoeda(estatisticas.lucroMes)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 min-h-0">
            <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  Contas a Vencer
                </h2>
              </div>
              <div className="p-3">
                {contasVencendo.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Nenhuma conta vencendo
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contasVencendo.slice(0, 5).map((conta) => (
                      <div
                        key={conta.id}
                        className="border-l-4 border-[#F59E0B] pl-3"
                      >
                        <p className="text-xs font-medium text-gray-900">
                          {conta.descricao}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vence em {formatarData(conta.dataVencimento)}
                        </p>
                        <p className="text-xs font-semibold text-gray-900">
                          {formatarMoeda(conta.valor)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">
                  Atividades Recentes
                </h2>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">
                  Nenhuma atividade recente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
}
