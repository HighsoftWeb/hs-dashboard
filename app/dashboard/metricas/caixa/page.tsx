"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEEP_DIVE } from "@/core/utils/deep-dive-urls";
import { ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { CardKpi } from "@/core/componentes/dashboard/card-kpi";
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

export default function PaginaMetricasCaixa(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const [dados, setDados] = useState<{
    indicadoresCaixa?: {
      receitasMesAtual: number;
      despesasMesAtual: number;
      saldoMesAtual: number;
      variacaoPercentual: number;
      tendencia: "subindo" | "descendo" | "estavel";
    };
    indicadoresInadimplencia?: {
      valorTotalReceber: number;
      valorVencido: number;
      percentualInadimplencia: number;
      quantidadeClientesInadimplentes: number;
    };
    fluxoRecebimento?: { mesAno: string; valor: number; quantidade: number }[];
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
          <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
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

  const caixa = dados?.indicadoresCaixa;
  const inadimplencia = dados?.indicadoresInadimplencia;
  const fluxo = dados?.fluxoRecebimento ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/financeiro" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Voltar">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Métricas Caixa</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {caixa && (
          <>
            <CardKpi titulo="Receitas" valor={formatarMoeda(caixa.receitasMesAtual)} icone={<TrendingUp className="w-5 h-5" />} href={DEEP_DIVE.contasReceber} />
            <CardKpi titulo="Despesas" valor={formatarMoeda(caixa.despesasMesAtual)} icone={<TrendingDown className="w-5 h-5" />} href={DEEP_DIVE.contasPagar} />
            <CardKpi
              titulo="Saldo"
              valor={formatarMoeda(caixa.saldoMesAtual)}
              icone={caixa.tendencia === "subindo" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              variante={caixa.tendencia === "subindo" ? "destaque" : undefined}
            />
            <CardKpi titulo="Var. vs Mês ant." valor={`${caixa.variacaoPercentual >= 0 ? "+" : ""}${caixa.variacaoPercentual.toFixed(1)}%`} icone={<TrendingUp className="w-5 h-5" />} />
          </>
        )}
        {inadimplencia && (
          <>
            <CardKpi titulo="A Receber" valor={formatarMoeda(inadimplencia.valorTotalReceber)} href={DEEP_DIVE.contasReceber} />
            <CardKpi titulo="Vencido" valor={formatarMoeda(inadimplencia.valorVencido)} href={DEEP_DIVE.contasReceber} />
            <CardKpi
              titulo="Inadimplência"
              valor={`${inadimplencia.percentualInadimplencia.toFixed(1)}%`}
              variante={inadimplencia.percentualInadimplencia > 10 ? "destaque" : undefined}
            />
            <CardKpi titulo="Clientes Inad." valor={inadimplencia.quantidadeClientesInadimplentes} />
          </>
        )}
      </div>

      {fluxo.length > 0 && (
        <CardGrafico titulo="Fluxo Recebimento" href={DEEP_DIVE.contasReceber}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fluxo} margin={{ top: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mesAno" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatarMoeda(v).replace(/\s/g, "").slice(0, 8)} />
              <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
              <Bar dataKey="valor" fill={coresGraficos.primario} radius={[4, 4, 0, 0]} name="A receber" onClick={() => router.push(DEEP_DIVE.contasReceber)} style={{ cursor: "pointer" }} />
            </BarChart>
          </ResponsiveContainer>
        </CardGrafico>
      )}

      {!caixa && !inadimplencia && fluxo.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-12">Sem dados</p>
      )}
    </div>
  );
}
