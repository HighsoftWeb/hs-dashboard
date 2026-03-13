"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, TrendingUp } from "lucide-react";
import { DEEP_DIVE, obterSitOrcamento } from "@/core/utils/deep-dive-urls";
import { CardKpi } from "@/core/componentes/dashboard/card-kpi";
import { CardGrafico } from "@/core/componentes/dashboard/card-grafico";
import { PaginaBI } from "@/core/componentes/dashboard/pagina-bi";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
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
import { obterIntervaloPadrao } from "@/core/componentes/dashboard/filtro-periodo";

const CORES_FUNIL = [
  "#094a73",
  "#048abf",
  "#04b2d9",
  "#10b981",
  "#6366f1",
  "#a855f7",
];

export default function PaginaComercial(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const padrao = obterIntervaloPadrao();
  const [analytics, setAnalytics] = useState<{
    funilVendas?: { status: string; quantidade: number; valor: number }[];
    topClientes?: {
      codCliFor?: number;
      razaoSocial: string;
      valorTotal: number;
      quantidade: number;
    }[];
  } | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resp = await servicoDashboard.obterAnalytics({
        dataInicio,
        dataFim,
        tipo: "geral",
      });
      setAnalytics(resp as typeof analytics);
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const funil = analytics?.funilVendas ?? [];
  const topClientes = analytics?.topClientes ?? [];
  const totalFunil = funil.reduce((s, f) => s + f.valor, 0);
  const totalDocs = funil.reduce((s, f) => s + f.quantidade, 0);

  if (carregando) {
    return (
      <PaginaBI
        titulo="Comercial"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 rounded-xl bg-slate-200" />
            <div className="lg:col-span-2 h-64 rounded-xl bg-slate-200" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  return (
    <PaginaBI
      titulo="Comercial"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardKpi
          titulo="Documentos"
          valor={totalDocs}
          icone={<FileText className="w-5 h-5" />}
          href={DEEP_DIVE.orcamentos}
        />
        <CardKpi
          titulo="Valor Total"
          valor={formatarMoeda(totalFunil)}
          icone={<TrendingUp className="w-5 h-5" />}
          variante="destaque"
          href={DEEP_DIVE.orcamentos}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {funil.length > 0 && (
          <CardGrafico titulo="Funil por Status" href={DEEP_DIVE.orcamentos}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={funil}
                  dataKey="quantidade"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
                  formatter={(v, name) => [
                    `${v} docs · ${formatarMoeda(funil.find((f) => f.status === name)?.valor ?? 0)}`,
                    String(name ?? ""),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}
        {topClientes.length > 0 && (
          <div className={funil.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
            <CardGrafico
              titulo="Top Clientes por Valor"
              href={DEEP_DIVE.clientes}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topClientes.slice(0, 8)}
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
          </div>
        )}
      </div>

      {funil.length === 0 && topClientes.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            Sem dados comerciais no período
          </p>
        </div>
      )}
    </PaginaBI>
  );
}
