"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  servicoDashboard,
  type ContaVencendo,
} from "@/core/domains/dashboard/services/dashboard-client";
import { EstatisticasDashboard } from "@/core/tipos/dashboard-db";
import { Orcamento } from "@/core/tipos/comercial";
import { formatarData } from "@/core/utils/formatar-data";
import {
  DEEP_DIVE,
  obterUrlTitulo,
  obterUrlOrcamento,
  obterFaixaParam,
  obterSitOrcamento,
} from "@/core/utils/deep-dive-urls";
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { obterCoresGraficos } from "@/core/constants/cores-graficos";
import { useEmpresa } from "@/core/context/empresa-context";

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function obterCorStatus(status: string): string {
  const s = status.toUpperCase();
  if (s.includes("APROVADO") || s.includes("FATURADO"))
    return "bg-emerald-100 text-emerald-700";
  if (s.includes("CANCELADO")) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

interface AnalyticsGeral {
  agingReceber?: { faixa: string; quantidade: number; valor: number }[];
  agingPagar?: { faixa: string; quantidade: number; valor: number }[];
  tendenciaMensal?: {
    mes: string;
    receitas: number;
    despesas: number;
    lucro: number;
    orcamentos: number;
  }[];
  topClientes?: {
    codCliFor?: number;
    razaoSocial: string;
    valorTotal: number;
    quantidade: number;
  }[];
  topProdutos?: {
    codProduto?: number;
    descricao: string;
    quantidade: number;
    valorTotal: number;
  }[];
  funilVendas?: { status: string; quantidade: number; valor: number }[];
  metaRealizado?: {
    meta: number;
    realizado: number;
    percentual: number;
  } | null;
}

const CORES_AGING = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#3b82f6"];
const CORES_FUNIL = [
  "#094a73",
  "#048abf",
  "#04b2d9",
  "#10b981",
  "#6366f1",
  "#a855f7",
  "#94a3b8",
];

export default function PaginaDashboard(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const padrao = obterIntervaloPadrao();

  const [estatisticas, setEstatisticas] =
    useState<EstatisticasDashboard | null>(null);
  const [orcamentosRecentes, setOrcamentosRecentes] = useState<Orcamento[]>([]);
  const [contasVencendo, setContasVencendo] = useState<ContaVencendo[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsGeral | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [stats, orcs, contas, anal] = await Promise.all([
        servicoDashboard.obterEstatisticas(),
        servicoDashboard.listarOrcamentosRecentes(10),
        servicoDashboard.listarContasVencendo(30),
        servicoDashboard.obterAnalytics({ dataInicio, dataFim, tipo: "geral" }),
      ]);
      setEstatisticas(stats);
      setOrcamentosRecentes(orcs);
      setContasVencendo(contas);
      setAnalytics(anal as AnalyticsGeral);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar");
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
        titulo="Visão Geral"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-28 w-full rounded-2xl bg-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-56 rounded-xl bg-slate-200" />
              <div className="h-48 rounded-xl bg-slate-200" />
              <div className="h-72 rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-6">
              <div className="h-48 rounded-xl bg-slate-200" />
              <div className="h-56 rounded-xl bg-slate-200" />
              <div className="h-36 rounded-xl bg-slate-200" />
              <div className="h-40 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      </PaginaBI>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">{erro}</p>
      </div>
    );
  }

  const stats = estatisticas!;
  const agingReceber = analytics?.agingReceber ?? [];
  const agingPagar = analytics?.agingPagar ?? [];
  const tendencia = analytics?.tendenciaMensal ?? [];
  const funil = analytics?.funilVendas ?? [];
  const topClientes = analytics?.topClientes ?? [];
  const topProdutos = analytics?.topProdutos ?? [];
  const metaRealizado = analytics?.metaRealizado;

  const dadosGrafico = [
    { nome: "Receitas", valor: stats.receitasMes },
    { nome: "Despesas", valor: stats.despesasMes },
    { nome: "Lucro", valor: stats.lucroMes },
  ].filter((d) => d.valor > 0);

  return (
    <PaginaBI
      titulo="Visão Geral"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="rounded-2xl bg-highsoft-primario p-6 text-white shadow-sm border border-slate-200/50">
        <h2 className="text-lg font-semibold opacity-90">Painel do Gestor</h2>
        {metaRealizado && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-6 flex-wrap">
                <div>
                  <p className="text-xs opacity-80">Meta</p>
                  <p className="text-xl font-bold">
                    {formatarMoeda(metaRealizado.meta)}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Realizado</p>
                  <p className="text-xl font-bold text-emerald-300">
                    {formatarMoeda(metaRealizado.realizado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-80">%</p>
                  <p
                    className={`text-xl font-bold ${
                      metaRealizado.percentual >= 100
                        ? "text-emerald-300"
                        : metaRealizado.percentual >= 80
                          ? "text-amber-300"
                          : "text-red-300"
                    }`}
                  >
                    {metaRealizado.percentual}%
                  </p>
                </div>
              </div>
              <div className="flex-1 min-w-[140px] max-w-[280px] h-4 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${Math.min(metaRealizado.percentual, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href={DEEP_DIVE.contasReceber}
          className="rounded-xl border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-md hover:shadow-lg transition cursor-pointer block"
        >
          <p className="text-sm font-medium opacity-90">Receitas</p>
          <p className="mt-1 text-2xl font-bold">
            {formatarMoeda(stats.receitasMes)}
          </p>
          <TrendingUp className="w-8 h-8 mt-2 opacity-80" />
        </Link>
        <Link
          href={DEEP_DIVE.contasPagar}
          className="rounded-xl border-0 bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-md hover:shadow-lg transition cursor-pointer block"
        >
          <p className="text-sm font-medium opacity-90">Despesas</p>
          <p className="mt-1 text-2xl font-bold">
            {formatarMoeda(stats.despesasMes)}
          </p>
          <TrendingDown className="w-8 h-8 mt-2 opacity-80" />
        </Link>
        <Link
          href={DEEP_DIVE.financeiro}
          className="rounded-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-md hover:shadow-lg transition cursor-pointer block"
        >
          <p className="text-sm font-medium opacity-90">Lucro</p>
          <p className="mt-1 text-2xl font-bold">
            {formatarMoeda(stats.lucroMes)}
          </p>
          <DollarSign className="w-8 h-8 mt-2 opacity-80" />
        </Link>
        <Link
          href={DEEP_DIVE.clientes}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-highsoft-primario/40 transition cursor-pointer block"
        >
          <p className="text-sm font-medium text-slate-500">Clientes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.totalClientes}
          </p>
          <Users className="w-8 h-8 mt-2 text-slate-400" />
        </Link>
        <Link
          href={DEEP_DIVE.produtos}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-highsoft-primario/40 transition cursor-pointer block"
        >
          <p className="text-sm font-medium text-slate-500">Produtos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {stats.totalProdutos}
          </p>
          <Package className="w-8 h-8 mt-2 text-slate-400" />
        </Link>
        <Link
          href={DEEP_DIVE.orcamentos}
          className="rounded-xl border-0 bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white shadow-md hover:shadow-lg transition cursor-pointer block"
        >
          <p className="text-sm font-medium opacity-90">Orç. Hoje</p>
          <p className="mt-1 text-2xl font-bold">{stats.orcamentosHoje}</p>
          <FileText className="w-8 h-8 mt-2 opacity-80" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tendencia.length > 0 && (
            <CardGrafico
              titulo="Receitas x Despesas x Lucro"
              href={DEEP_DIVE.financeiro}
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={tendencia}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                    }
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    name="Receitas"
                    stroke={coresGraficos.primario}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    name="Despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    name="Lucro"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardGrafico>
          )}

          {dadosGrafico.length > 0 && (
            <CardGrafico titulo="Mês Atual" href={DEEP_DIVE.financeiro}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dadosGrafico} margin={{ top: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "")}
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Bar
                    dataKey="valor"
                    fill={coresGraficos.primario}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardGrafico>
          )}

          {agingReceber.length > 0 && (
            <CardGrafico
              titulo="A Receber por Faixa"
              href={DEEP_DIVE.contasReceber}
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={agingReceber}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "")}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="faixa"
                    width={65}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Bar
                    dataKey="valor"
                    radius={[0, 4, 4, 0]}
                    onClick={(e: unknown) => {
                      const p = (e as { payload?: { faixa?: string } })
                        ?.payload;
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

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Link
              href={DEEP_DIVE.orcamentos}
              className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
            >
              <h3 className="text-sm font-semibold text-slate-800">
                Orçamentos Recentes
              </h3>
            </Link>
            <div className="overflow-x-auto max-h-56 overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Nº
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Data
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                      Valor
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orcamentosRecentes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-xs text-slate-500"
                      >
                        Sem dados
                      </td>
                    </tr>
                  ) : (
                    orcamentosRecentes.map((orc) => (
                      <tr key={orc.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <Link href={obterUrlOrcamento(orc)} className="block">
                            <span className="text-xs font-medium text-slate-800">
                              {orc.tipo === "orcamento" ? "Orç." : "OS"}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={obterUrlOrcamento(orc)}
                            className="text-xs text-slate-700 hover:text-highsoft-primario hover:underline"
                          >
                            {orc.numero}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {formatarData(orc.data)}
                        </td>
                        <td className="px-3 py-2">
                          <Link
                            href={obterUrlOrcamento(orc)}
                            className="text-xs font-medium text-slate-800 text-right block hover:text-highsoft-primario"
                          >
                            {formatarMoeda(orc.valorTotal)}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${obterCorStatus(orc.status)}`}
                          >
                            {orc.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {funil.length > 0 && (
            <CardGrafico titulo="Funil Status" href={DEEP_DIVE.orcamentos}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={funil}
                    dataKey="quantidade"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={(e: { name?: string; value?: number }) =>
                      `${e.name ?? ""}: ${e.value ?? 0}`
                    }
                    onClick={(e: unknown) => {
                      const d = e as {
                        name?: string;
                        status?: string;
                        payload?: { name?: string };
                      };
                      const label =
                        d?.name ?? d?.status ?? d?.payload?.name ?? "";
                      const sit = label ? obterSitOrcamento(label) : "";
                      router.push(
                        sit
                          ? DEEP_DIVE.orcamentosComSit(sit)
                          : DEEP_DIVE.orcamentos
                      );
                    }}
                  >
                    {funil.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CORES_FUNIL[i % CORES_FUNIL.length]}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${v} docs`, String(name ?? "")]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardGrafico>
          )}

          {topClientes.length > 0 && (
            <CardGrafico titulo="Top Clientes" href={DEEP_DIVE.clientes}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={topClientes.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "")}
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="razaoSocial"
                    width={100}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) =>
                      v?.length > 15 ? v.slice(0, 14) + "…" : v
                    }
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Bar
                    dataKey="valorTotal"
                    fill={coresGraficos.primario}
                    radius={[0, 4, 4, 0]}
                    name="Valor"
                    onClick={(e: unknown) => {
                      const p = (e as { payload?: { codCliFor?: number } })
                        ?.payload;
                      if (p?.codCliFor)
                        router.push(DEEP_DIVE.clienteDetalhe(p.codCliFor));
                      else router.push(DEEP_DIVE.clientes);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardGrafico>
          )}

          {topProdutos.length > 0 && (
            <CardGrafico titulo="Top Produtos" href={DEEP_DIVE.produtos}>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {topProdutos.slice(0, 6).map((p, i) => (
                  <Link
                    key={i}
                    href={
                      p.codProduto
                        ? DEEP_DIVE.produtoDetalhe(p.codProduto)
                        : DEEP_DIVE.produtos
                    }
                    className="flex justify-between text-xs hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition"
                  >
                    <span
                      className="truncate max-w-[140px] text-slate-700"
                      title={p.descricao}
                    >
                      {p.descricao}
                    </span>
                    <span className="font-medium text-slate-900 shrink-0">
                      {p.quantidade} un
                    </span>
                  </Link>
                ))}
              </div>
            </CardGrafico>
          )}

          {agingPagar.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <Link
                href={DEEP_DIVE.contasPagar}
                className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-800">
                  A Pagar
                </h3>
              </Link>
              <div className="p-3 space-y-1.5">
                {agingPagar.slice(0, 5).map((a, i) => {
                  const faixa = obterFaixaParam(a.faixa);
                  return (
                    <Link
                      key={i}
                      href={DEEP_DIVE.contasPagarComFaixa(faixa)}
                      className="flex justify-between text-xs hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition"
                    >
                      <span className="text-slate-600 truncate flex-1">
                        {a.faixa}
                      </span>
                      <span className="font-medium text-slate-900 ml-2">
                        {formatarMoeda(a.valor)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
            <Link
              href={DEEP_DIVE.contasReceber}
              className="block px-4 py-3 border-b border-amber-100 hover:bg-amber-50/50 transition"
            >
              <h3 className="text-sm font-semibold text-slate-800">Alertas</h3>
            </Link>
            <div className="p-3 space-y-2">
              {contasVencendo.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={obterUrlTitulo(c)}
                  className="block border-l-4 border-amber-400 pl-3 py-1 hover:bg-amber-100/50 rounded-r transition"
                >
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {c.descricao}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatarData(c.dataVencimento)} · {formatarMoeda(c.valor)}
                  </p>
                </Link>
              ))}
              {contasVencendo.length === 0 && (
                <p className="text-xs text-slate-500">Nenhum alerta</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PaginaBI>
  );
}
