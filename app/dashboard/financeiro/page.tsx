"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import {
  servicoDashboard,
  type ContaVencendo,
} from "@/core/domains/dashboard/services/dashboard-client";
import { formatarData } from "@/core/utils/formatar-data";
import {
  DEEP_DIVE,
  obterUrlTitulo,
  obterFaixaParam,
} from "@/core/utils/deep-dive-urls";
import Link from "next/link";
import { CardKpi } from "@/core/componentes/dashboard/card-kpi";
import { CardGrafico } from "@/core/componentes/dashboard/card-grafico";
import { PaginaBI } from "@/core/componentes/dashboard/pagina-bi";
import { obterIntervaloPadrao } from "@/core/componentes/dashboard/filtro-periodo";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  obterCorPorNomeGrafico,
  CORES_FINANCEIRAS,
} from "@/core/constants/cores-graficos";
function formatarMoeda(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

const CORES_AGING = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#3b82f6"];

export default function DashboardFinanceiro(): React.JSX.Element {
  const router = useRouter();
  const padrao = obterIntervaloPadrao();

  const [stats, setStats] = useState<{
    receitasMes: number;
    despesasMes: number;
    lucroMes: number;
  } | null>(null);
  const [contasVencendo, setContasVencendo] = useState<ContaVencendo[]>([]);
  const [analytics, setAnalytics] = useState<{
    agingReceber?: { faixa: string; quantidade: number; valor: number }[];
    agingPagar?: { faixa: string; quantidade: number; valor: number }[];
    indicadoresInadimplencia?: {
      valorTotalReceber: number;
      valorVencido: number;
      percentualInadimplencia: number;
      quantidadeClientesInadimplentes: number;
    };
    fluxoRecebimento?: { mesAno: string; valor: number; quantidade: number }[];
  } | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [estatRes, contasRes, analGeral, analMetricas] = await Promise.all([
        servicoDashboard.obterEstatisticas({ dataInicio, dataFim }),
        servicoDashboard.listarContasVencendo(60),
        servicoDashboard.obterAnalytics({ dataInicio, dataFim, tipo: "geral" }),
        servicoDashboard.obterAnalytics({
          dataInicio,
          dataFim,
          tipo: "metricas",
        }),
      ]);
      setStats({
        receitasMes: estatRes.receitasMes,
        despesasMes: estatRes.despesasMes,
        lucroMes: estatRes.lucroMes,
      });
      setContasVencendo(contasRes);
      const geral = analGeral as {
        agingReceber?: { faixa: string; quantidade: number; valor: number }[];
        agingPagar?: { faixa: string; quantidade: number; valor: number }[];
      };
      const metricas = analMetricas as {
        indicadoresInadimplencia?: {
          valorTotalReceber: number;
          valorVencido: number;
          percentualInadimplencia: number;
          quantidadeClientesInadimplentes: number;
        };
        fluxoRecebimento?: {
          mesAno: string;
          valor: number;
          quantidade: number;
        }[];
      };
      setAnalytics({
        agingReceber: geral.agingReceber,
        agingPagar: geral.agingPagar,
        indicadoresInadimplencia: metricas.indicadoresInadimplencia,
        fluxoRecebimento: metricas.fluxoRecebimento,
      });
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <PaginaBI
        titulo="Financeiro"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-44 rounded-xl bg-slate-200" />
            <div className="h-44 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="lg:col-span-3 h-72 rounded-xl bg-slate-200" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  const s = stats!;
  const dadosGrafico = [
    { nome: "Receitas", valor: s.receitasMes },
    { nome: "Despesas", valor: s.despesasMes },
    { nome: "Lucro", valor: s.lucroMes },
  ].filter((d) => d.valor > 0);

  const receber = contasVencendo.filter((c) => c.tipo === "receber");
  const pagar = contasVencendo.filter((c) => c.tipo === "pagar");
  const totalReceber = receber.reduce((sum, c) => sum + c.valor, 0);
  const totalPagar = pagar.reduce((sum, c) => sum + c.valor, 0);
  const agingReceber = analytics?.agingReceber ?? [];
  const agingPagar = analytics?.agingPagar ?? [];
  const inadimplencia = analytics?.indicadoresInadimplencia;
  const fluxo = analytics?.fluxoRecebimento ?? [];

  return (
    <PaginaBI
      titulo="Financeiro"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <CardKpi
          titulo="Receitas"
          valor={formatarMoeda(s.receitasMes)}
          icone={<TrendingUp className="w-5 h-5" />}
          tipoFinanceiro="receita"
        />
        <CardKpi
          titulo="Despesas"
          valor={formatarMoeda(s.despesasMes)}
          icone={<TrendingDown className="w-5 h-5" />}
          tipoFinanceiro="despesa"
        />
        <CardKpi
          titulo="Lucro"
          valor={formatarMoeda(s.lucroMes)}
          icone={<DollarSign className="w-5 h-5" />}
          tipoFinanceiro="lucro"
          negativo={s.lucroMes < 0}
        />
        <CardKpi
          titulo="A Vencer"
          valor={contasVencendo.length}
          icone={<AlertTriangle className="w-5 h-5" />}
          href={DEEP_DIVE.contasReceber}
        />
        {inadimplencia && (
          <>
            <CardKpi
              titulo="A Receber"
              valor={formatarMoeda(inadimplencia.valorTotalReceber)}
              icone={<DollarSign className="w-5 h-5" />}
              tipoFinanceiro="receita"
              href={DEEP_DIVE.contasReceber}
            />
            <CardKpi
              titulo="Inadimplência"
              valor={`${inadimplencia.percentualInadimplencia.toFixed(1)}%`}
              icone={<AlertTriangle className="w-5 h-5" />}
              tipoFinanceiro={
                inadimplencia.percentualInadimplencia > 10
                  ? "despesa"
                  : undefined
              }
              href={DEEP_DIVE.contasReceber}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardGrafico titulo="Receitas x Despesas x Lucro (período)">
          {dadosGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    formatarMoeda(v).replace(/\s/g, "").slice(0, 10)
                  }
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {dadosGrafico.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={obterCorPorNomeGrafico(entry.nome, entry.valor)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Sem dados
            </p>
          )}
        </CardGrafico>

        {agingReceber.length > 0 && (
          <CardGrafico
            titulo="A Receber por Faixa"
            href={DEEP_DIVE.contasReceber}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={agingReceber}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 65, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "")}
                  tick={{ fontSize: 9 }}
                />
                <YAxis
                  type="category"
                  dataKey="faixa"
                  width={60}
                  tick={{ fontSize: 9 }}
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar
                  dataKey="valor"
                  radius={[0, 4, 4, 0]}
                  onClick={(e: unknown) => {
                    const p = (e as { payload?: { faixa?: string } })?.payload;
                    const faixa = p?.faixa ? obterFaixaParam(p.faixa) : null;
                    router.push(
                      faixa
                        ? DEEP_DIVE.contasReceberComFaixa(faixa)
                        : DEEP_DIVE.contasReceber
                    );
                  }}
                >
                  {agingReceber.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CORES_AGING[i % CORES_AGING.length]}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        {fluxo.length > 0 && (
          <CardGrafico
            titulo="Fluxo Recebimento"
            href={DEEP_DIVE.contasReceber}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fluxo} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mesAno" tick={{ fontSize: 9 }} />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                  }
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar
                  dataKey="valor"
                  fill={CORES_FINANCEIRAS.receita}
                  radius={[4, 4, 0, 0]}
                  name="A receber"
                  onClick={() => router.push(DEEP_DIVE.contasReceber)}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm overflow-hidden">
          <Link
            href={DEEP_DIVE.contasReceber}
            className="block px-4 py-3 border-b border-blue-100 hover:bg-blue-50/50 transition"
          >
            <h3 className="text-sm font-semibold text-slate-800">A Receber</h3>
            <p className="text-lg font-bold text-blue-700 mt-0.5">
              {formatarMoeda(totalReceber)}
            </p>
          </Link>
          <div className="p-3 max-h-44 overflow-y-auto space-y-2">
            {receber.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={obterUrlTitulo(c)}
                className="flex justify-between text-xs hover:bg-blue-100/50 rounded px-2 py-1 -mx-2 transition"
              >
                <span className="truncate flex-1 text-slate-700">
                  {c.descricao}
                </span>
                <span className="font-medium ml-2 text-blue-700">
                  {formatarMoeda(c.valor)}
                </span>
              </Link>
            ))}
            {receber.length === 0 && (
              <p className="text-xs text-slate-500">Nenhum</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 shadow-sm overflow-hidden">
          <Link
            href={DEEP_DIVE.contasPagar}
            className="block px-4 py-3 border-b border-red-100 hover:bg-red-50/50 transition"
          >
            <h3 className="text-sm font-semibold text-slate-800">A Pagar</h3>
            <p className="text-lg font-bold text-red-700 mt-0.5">
              {formatarMoeda(totalPagar)}
            </p>
          </Link>
          <div className="p-3 max-h-44 overflow-y-auto space-y-2">
            {pagar.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={obterUrlTitulo(c)}
                className="flex justify-between text-xs hover:bg-red-100/50 rounded px-2 py-1 -mx-2 transition"
              >
                <span className="truncate flex-1 text-slate-700">
                  {c.descricao}
                </span>
                <span className="font-medium ml-2 text-red-700">
                  {formatarMoeda(c.valor)}
                </span>
              </Link>
            ))}
            {pagar.length === 0 && (
              <p className="text-xs text-slate-500">Nenhum</p>
            )}
          </div>
        </div>

        {agingPagar.length > 0 && (
          <CardGrafico titulo="A Pagar por Faixa" href={DEEP_DIVE.contasPagar}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={agingPagar}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 65, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "")}
                  tick={{ fontSize: 9 }}
                />
                <YAxis
                  type="category"
                  dataKey="faixa"
                  width={60}
                  tick={{ fontSize: 9 }}
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar
                  dataKey="valor"
                  fill={CORES_FINANCEIRAS.despesa}
                  radius={[0, 4, 4, 0]}
                  onClick={(e: unknown) => {
                    const p = (e as { payload?: { faixa?: string } })?.payload;
                    const faixa = p?.faixa ? obterFaixaParam(p.faixa) : null;
                    router.push(
                      faixa
                        ? DEEP_DIVE.contasPagarComFaixa(faixa)
                        : DEEP_DIVE.contasPagar
                    );
                  }}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Link
            href={DEEP_DIVE.contasReceber}
            className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
          >
            <h3 className="text-sm font-semibold text-slate-800">
              Contas a Vencer
            </h3>
          </Link>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Descrição
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                    Valor
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                    Venc.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasVencendo.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-xs text-slate-500"
                    >
                      Nenhum
                    </td>
                  </tr>
                ) : (
                  contasVencendo.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <Link href={obterUrlTitulo(c)} className="block">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${c.tipo === "receber" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                          >
                            {c.tipo === "receber" ? "Rec." : "Pag."}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs truncate max-w-[180px]">
                        <Link
                          href={obterUrlTitulo(c)}
                          className="hover:text-highsoft-primario hover:underline"
                        >
                          {c.descricao}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-right">
                        <Link
                          href={obterUrlTitulo(c)}
                          className="block hover:text-highsoft-primario"
                        >
                          {formatarMoeda(c.valor)}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {formatarData(c.dataVencimento)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PaginaBI>
  );
}
