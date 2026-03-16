"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, FileText, BarChart3 } from "lucide-react";
import {
  DEEP_DIVE,
  obterSitOrcamento,
  obterUrlOrcamentoPorId,
} from "@/core/utils/deep-dive-urls";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
import { Orcamento } from "@/core/tipos";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { obterCoresGraficos } from "@/core/constants/cores-graficos";
import { useEmpresa } from "@/core/context/empresa-context";

function formatarMoeda(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

export default function DashboardVendas(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const coresFunil = [
    cores.primaria,
    cores.secundaria,
    cores.terciaria,
    coresGraficos.sucesso,
    "#6366f1",
    "#a855f7",
    "#94a3b8",
  ];
  const padrao = obterIntervaloPadrao();

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [analytics, setAnalytics] = useState<{
    funilVendas?: { status: string; quantidade: number; valor: number }[];
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
    topVendedores?: {
      codRepresentante?: number;
      nome: string;
      valorTotal: number;
      quantidade: number;
    }[];
    metaRealizado?: {
      meta: number;
      realizado: number;
      percentual: number;
    } | null;
  } | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [orcs, anal] = await Promise.all([
        servicoDashboard.listarOrcamentosRecentes(50, {
          dataInicio,
          dataFim,
        }),
        servicoDashboard.obterAnalytics({ dataInicio, dataFim, tipo: "geral" }),
      ]);
      setOrcamentos(orcs);
      setAnalytics(anal as typeof analytics);
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
        titulo="Vendas e Faturamento"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="lg:col-span-2 h-64 rounded-xl bg-slate-200" />
            <div className="h-64 rounded-xl bg-slate-200" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  const totalOrcamentos = orcamentos.length;
  const totalValor = orcamentos.reduce((s, o) => s + o.valorTotal, 0);
  const valorMedio = totalOrcamentos > 0 ? totalValor / totalOrcamentos : 0;

  const dadosPorStatus = orcamentos.reduce(
    (acc, o) => {
      const s = o.status || "Outro";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const graficoStatus = Object.entries(dadosPorStatus).map(([nome, valor]) => ({
    nome,
    quantidade: valor,
  }));

  const graficoValores = [...orcamentos]
    .filter((o) => {
      const s = (o.status || "").toUpperCase();
      return ["APROVADO", "PROCESSADO", "FATURADO PARCIAL", "ROMANEIO"].some(
        (palavra) => s.includes(palavra.toUpperCase())
      );
    })
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 10)
    .map((o, index) => ({
      nome: `#${index + 1}`,
      valor: o.valorTotal,
      id: o.id,
      numero: o.numero,
    }));

  const funil = analytics?.funilVendas ?? [];
  const topClientes = analytics?.topClientes ?? [];
  const topProdutos = analytics?.topProdutos ?? [];
  const topVendedores = analytics?.topVendedores ?? [];
  const meta = analytics?.metaRealizado;

  return (
    <PaginaBI
      titulo="Vendas e Faturamento"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      {meta && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-6 flex-wrap">
              <div>
                <p className="text-xs text-slate-500">Meta</p>
                <p className="text-lg font-bold text-slate-900">
                  {formatarMoeda(meta.meta)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Realizado</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatarMoeda(meta.realizado)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">%</p>
                <p
                  className={`text-lg font-bold ${meta.percentual >= 100 ? "text-blue-600" : "text-amber-600"}`}
                >
                  {meta.percentual}%
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[120px] max-w-[240px] h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-highsoft-primario"
                style={{ width: `${Math.min(meta.percentual, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CardKpi
          titulo="Documentos"
          valor={totalOrcamentos}
          icone={<FileText className="w-5 h-5" />}
          href={DEEP_DIVE.orcamentos}
        />
        <CardKpi
          titulo="Valor Total"
          valor={formatarMoeda(totalValor)}
          icone={<TrendingUp className="w-5 h-5" />}
          variante="destaque"
          href={DEEP_DIVE.orcamentos}
        />
        <CardKpi
          titulo="Ticket Médio"
          valor={formatarMoeda(valorMedio)}
          icone={<BarChart3 className="w-5 h-5" />}
          href={DEEP_DIVE.orcamentos}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardGrafico titulo="Por Status" href={DEEP_DIVE.orcamentos}>
          {graficoStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficoStatus} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill={coresGraficos.primario}
                  radius={[4, 4, 0, 0]}
                  onClick={(e: unknown) => {
                    const p = (e as { payload?: { nome?: string } })?.payload;
                    const label = p?.nome ?? "";
                    const sit = label ? obterSitOrcamento(label) : "";
                    router.push(
                      sit
                        ? DEEP_DIVE.orcamentosComSit(sit)
                        : DEEP_DIVE.orcamentos
                    );
                  }}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Sem dados
            </p>
          )}
        </CardGrafico>

        <CardGrafico titulo="Valores Top 10" href={DEEP_DIVE.orcamentos}>
          {graficoValores.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficoValores} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
                <YAxis
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                  }
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar
                  dataKey="valor"
                  fill={coresGraficos.primario}
                  radius={[4, 4, 0, 0]}
                  onClick={(e: unknown) => {
                    const p = (e as { payload?: { id?: string } })?.payload;
                    if (p?.id) router.push(obterUrlOrcamentoPorId(p.id));
                    else router.push(DEEP_DIVE.orcamentos);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Sem dados
            </p>
          )}
        </CardGrafico>

        {funil.length > 0 && (
          <CardGrafico titulo="Funil Status" href={DEEP_DIVE.orcamentos}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={funil}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  label={(e: { name?: string; value?: number }) =>
                    `${e.name ?? ""}: ${e.value ?? 0}`
                  }
                  onClick={(e: unknown) => {
                    const d = e as { name?: string; status?: string };
                    const label = d?.name ?? d?.status ?? "";
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
                      fill={coresFunil[i % coresFunil.length]}
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
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Link
              href={DEEP_DIVE.clientes}
              className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
            >
              <h3 className="text-sm font-semibold text-slate-800">
                Top Clientes (faturamento)
              </h3>
            </Link>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topClientes.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
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
                  width={120}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    v?.length > 18 ? v.slice(0, 17) + "…" : v
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
          </div>
        )}

        {topProdutos.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Link
              href={DEEP_DIVE.produtos}
              className="block px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition"
            >
              <h3 className="text-sm font-semibold text-slate-800">
                Top Produtos (itens mais vendidos)
              </h3>
            </Link>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topProdutos.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis
                  type="category"
                  dataKey="descricao"
                  width={100}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    v?.length > 12 ? v.slice(0, 11) + "…" : v
                  }
                />
                <Tooltip formatter={(v) => v} />
                <Bar
                  dataKey="quantidade"
                  fill={coresGraficos.secundario}
                  radius={[0, 4, 4, 0]}
                  name="Qtd"
                  onClick={(e: unknown) => {
                    const p = (e as { payload?: { codProduto?: number } })
                      ?.payload;
                    if (p?.codProduto)
                      router.push(DEEP_DIVE.produtoDetalhe(p.codProduto));
                    else router.push(DEEP_DIVE.produtos);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {topVendedores.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="block px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">
                Top Vendedores (faturamento)
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topVendedores.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={100}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    v?.length > 14 ? v.slice(0, 13) + "…" : v
                  }
                />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar
                  dataKey="valorTotal"
                  fill={coresGraficos.sucesso}
                  radius={[0, 4, 4, 0]}
                  name="Faturamento"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </PaginaBI>
  );
}
