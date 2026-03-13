"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DEEP_DIVE } from "@/core/utils/deep-dive-urls";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { CardGrafico } from "@/core/componentes/dashboard/card-grafico";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { obterCoresGraficos } from "@/core/constants/cores-graficos";
import { useEmpresa } from "@/core/context/empresa-context";

export default function PaginaMetricasClientes(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const [dados, setDados] = useState<{
    topClientesFaturamento?: { codCliFor?: number; razaoSocial: string; valorTotal: number; quantidade: number }[];
    clientesInativos?: { codCliFor?: number; razaoSocial: string; valorUltimoAno: number; diasSemCompra: number }[];
  } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resp = await servicoDashboard.obterAnalytics({ tipo: "metricas" });
      setDados(resp as typeof dados);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-xl bg-slate-200 animate-pulse" />
          <div className="h-72 rounded-xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">{erro}</p>
      </div>
    );
  }

  const topClientes = dados?.topClientesFaturamento ?? [];
  const inativos = dados?.clientesInativos ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clientes" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Voltar">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Métricas Clientes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {topClientes.length > 0 && (
          <CardGrafico titulo="Top Faturamento" href={DEEP_DIVE.clientes}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topClientes.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "").slice(0, 10)} />
                <YAxis type="category" dataKey="razaoSocial" width={110} tick={{ fontSize: 9 }} tickFormatter={(v) => (v?.length > 16 ? v.slice(0, 15) + "…" : v)} />
                <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                <Bar dataKey="valorTotal" fill={coresGraficos.primario} radius={[0, 4, 4, 0]} name="Valor" onClick={(e: unknown) => { const p = (e as { payload?: { codCliFor?: number } })?.payload; if (p?.codCliFor) router.push(DEEP_DIVE.clienteDetalhe(p.codCliFor)); else router.push(DEEP_DIVE.clientes); }} style={{ cursor: "pointer" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        {inativos.length > 0 && (
          <CardGrafico titulo="Em Risco (sem compra 90+ dias)" href={DEEP_DIVE.clientes}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inativos.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="razaoSocial" width={110} tick={{ fontSize: 9 }} tickFormatter={(v) => (v?.length > 16 ? v.slice(0, 15) + "…" : v)} />
                <Tooltip formatter={(v) => v} />
                <Bar dataKey="diasSemCompra" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Dias" onClick={(e: unknown) => { const p = (e as { payload?: { codCliFor?: number } })?.payload; if (p?.codCliFor) router.push(DEEP_DIVE.clienteDetalhe(p.codCliFor)); else router.push(DEEP_DIVE.clientes); }} style={{ cursor: "pointer" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        {topClientes.length === 0 && inativos.length === 0 && (
          <p className="text-sm text-slate-500 col-span-2 text-center py-12">Sem dados no período</p>
        )}
      </div>
    </div>
  );
}
