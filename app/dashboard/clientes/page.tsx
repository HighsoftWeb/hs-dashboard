"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { DEEP_DIVE } from "@/core/utils/deep-dive-urls";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
import { clienteHttp } from "@/core/http/cliente-http";
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

interface ClienteDB {
  COD_CLI_FOR: number;
  RAZ_CLI_FOR: string | null;
  TIP_CLI_FOR: string | null;
  SIG_ESTADO: string | null;
}

const CORES = ["#094a73", "#048abf", "#04b2d9", "#10b981", "#6366f1"];

export default function DashboardClientes(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const padrao = obterIntervaloPadrao();

  const [totalClientes, setTotalClientes] = useState(0);
  const [clientes, setClientes] = useState<ClienteDB[]>([]);
  const [analytics, setAnalytics] = useState<{
    topClientesFaturamento?: {
      codCliFor?: number;
      razaoSocial: string;
      valorTotal: number;
      quantidade: number;
    }[];
    clientesInativos?: {
      codCliFor?: number;
      razaoSocial: string;
      valorUltimoAno: number;
      diasSemCompra: number;
    }[];
    clientesNovosPeriodo?: number;
    inadimplentes?: number;
  } | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [statsRes, clientesRes, analClientes, analMetricas] =
        await Promise.all([
          servicoDashboard.obterEstatisticas(),
          clienteHttp.get<{ data: ClienteDB[]; total: number }>(
            "/dashboard/cadastros/clientes?pageSize=100"
          ),
          servicoDashboard.obterAnalytics({
            dataInicio,
            dataFim,
            tipo: "clientes",
          }),
          servicoDashboard.obterAnalytics({ tipo: "metricas" }),
        ]);
      setTotalClientes(statsRes.totalClientes);
      if (clientesRes.success && clientesRes.data?.data) {
        setClientes(clientesRes.data.data);
      }
      const cli = analClientes as {
        clientesNovosPeriodo?: number;
        inadimplentes?: number;
      };
      const met = analMetricas as {
        topClientesFaturamento?: {
          codCliFor?: number;
          razaoSocial: string;
          valorTotal: number;
          quantidade: number;
        }[];
        clientesInativos?: {
          codCliFor?: number;
          razaoSocial: string;
          valorUltimoAno: number;
          diasSemCompra: number;
        }[];
      };
      setAnalytics({ ...cli, ...met });
    } catch {
      setClientes([]);
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const porTipo = clientes.reduce(
    (acc, c) => {
      const t =
        c.TIP_CLI_FOR === "F" ? "PF" : c.TIP_CLI_FOR === "J" ? "PJ" : "Outros";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const graficoTipo = Object.entries(porTipo).map(([nome, qtd]) => ({
    nome,
    quantidade: qtd,
  }));

  const porEstado = clientes.reduce(
    (acc, c) => {
      const est = c.SIG_ESTADO || "NI";
      acc[est] = (acc[est] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const graficoEstado = Object.entries(porEstado)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nome, quantidade]) => ({ nome, quantidade }));

  const topClientes = analytics?.topClientesFaturamento ?? [];
  const inativos = analytics?.clientesInativos ?? [];

  if (carregando) {
    return (
      <PaginaBI
        titulo="Clientes"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="h-56 rounded-xl bg-slate-200" />
            <div className="rounded-xl bg-slate-200 h-40" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  return (
    <PaginaBI
      titulo="Clientes"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <CardKpi
          titulo="Total"
          valor={totalClientes}
          icone={<Users className="w-5 h-5" />}
          variante="destaque"
          href={DEEP_DIVE.clientes}
        />
        {analytics?.clientesNovosPeriodo !== undefined && (
          <CardKpi
            titulo="Novos"
            valor={analytics.clientesNovosPeriodo}
            icone={<TrendingUp className="w-5 h-5" />}
            href={DEEP_DIVE.clientes}
          />
        )}
        {analytics?.inadimplentes !== undefined && (
          <CardKpi
            titulo="Inadimplentes"
            valor={analytics.inadimplentes}
            icone={<AlertTriangle className="w-5 h-5" />}
            href={DEEP_DIVE.contasReceber}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardGrafico titulo="Por Tipo" href={DEEP_DIVE.clientes}>
          {graficoTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={graficoTipo}
                  dataKey="quantidade"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={(e: { name?: string; value?: number }) =>
                    `${e.name ?? ""}: ${e.value ?? 0}`
                  }
                >
                  {graficoTipo.map((_, i) => (
                    <Cell key={i} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Sem dados
            </p>
          )}
        </CardGrafico>

        <CardGrafico titulo="Por UF" href={DEEP_DIVE.clientes}>
          {graficoEstado.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficoEstado} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill={coresGraficos.primario}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-500 text-center py-12">
              Sem dados
            </p>
          )}
        </CardGrafico>

        {topClientes.length > 0 && (
          <CardGrafico titulo="Top por Faturamento" href={DEEP_DIVE.clientes}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topClientes.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="razaoSocial"
                  width={100}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) =>
                    v?.length > 14 ? v.slice(0, 13) + "…" : v
                  }
                />
                <Tooltip
                  formatter={(v) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(Number(v))
                  }
                />
                <Bar
                  dataKey="valorTotal"
                  fill={coresGraficos.primario}
                  radius={[0, 4, 4, 0]}
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

        {inativos.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
            <Link
              href={DEEP_DIVE.clientes}
              className="flex items-center gap-2 px-4 py-3 border-b border-amber-100 hover:bg-amber-100/50 transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Em Risco (90+ dias sem compra)
              </h3>
            </Link>
            <div className="p-3 space-y-2 max-h-52 overflow-y-auto">
              {inativos.slice(0, 8).map((c, i) => (
                <Link
                  key={i}
                  href={
                    c.codCliFor
                      ? DEEP_DIVE.clienteDetalhe(c.codCliFor)
                      : DEEP_DIVE.clientes
                  }
                  className="text-xs flex justify-between gap-2 hover:bg-amber-100/50 rounded px-2 py-1 -mx-2 transition"
                >
                  <p className="font-medium text-slate-800 truncate flex-1">
                    {c.razaoSocial}
                  </p>
                  <span className="text-amber-600 shrink-0">
                    {c.diasSemCompra}d
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {graficoTipo.length === 0 &&
        graficoEstado.length === 0 &&
        topClientes.length === 0 &&
        inativos.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Sem dados de clientes no período
            </p>
          </div>
        )}
    </PaginaBI>
  );
}
