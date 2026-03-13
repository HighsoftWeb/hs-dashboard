"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Package, Boxes, Layers } from "lucide-react";
import { servicoDashboard } from "@/core/domains/dashboard/services/dashboard-client";
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
} from "recharts";
import { obterCoresGraficos } from "@/core/constants/cores-graficos";
import { useEmpresa } from "@/core/context/empresa-context";

function formatarMoeda(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

export default function DashboardEstoque(): React.JSX.Element {
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const padrao = obterIntervaloPadrao();

  const [stats, setStats] = useState<{ totalProdutos: number } | null>(null);
  const [resumo, setResumo] = useState<{
    totalDepositos: number;
    totalProdutosComEstoque: number;
    totalItensEstoque: number;
    somaQuantidade: number;
  } | null>(null);
  const [analytics, setAnalytics] = useState<{
    valorTotalEstoque?: number;
    produtosAbaixoMinimo?: number;
    produtosSemMovimento90Dias?: number;
    depositos?: {
      codDeposito: string;
      descricao: string;
      quantidade: number;
    }[];
    produtosMaisVendidos?: {
      descricao: string;
      quantidade: number;
      valorTotal: number;
    }[];
  } | null>(null);
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const [estatisticas, resumoEstoque, analEstoque] = await Promise.all([
        servicoDashboard.obterEstatisticas(),
        servicoDashboard.obterResumoEstoque(),
        servicoDashboard.obterAnalytics({ tipo: "estoque" }),
      ]);
      setStats(estatisticas);
      setResumo(resumoEstoque);
      setAnalytics(analEstoque as typeof analytics);
    } catch {
      setResumo({
        totalDepositos: 0,
        totalProdutosComEstoque: 0,
        totalItensEstoque: 0,
        somaQuantidade: 0,
      });
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const dadosGrafico = resumo
    ? [
        { nome: "Com Estoque", valor: resumo.totalProdutosComEstoque },
        { nome: "Itens", valor: resumo.totalItensEstoque },
        { nome: "Qtd Total", valor: resumo.somaQuantidade },
      ].filter((d) => d.valor > 0)
    : [];

  const depositos = analytics?.depositos ?? [];
  const topProdutos = analytics?.produtosMaisVendidos ?? [];

  if (carregando) {
    return (
      <PaginaBI
        titulo="Produtos e Estoque"
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
            <div className="h-24 rounded-xl bg-slate-200" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  return (
    <PaginaBI
      titulo="Produtos e Estoque"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <CardKpi
          titulo="Produtos"
          valor={stats?.totalProdutos ?? 0}
          icone={<Package className="w-5 h-5" />}
          variante="destaque"
        />
        <CardKpi
          titulo="Depósitos"
          valor={resumo?.totalDepositos ?? 0}
          icone={<Boxes className="w-5 h-5" />}
        />
        <CardKpi
          titulo="Com Estoque"
          valor={resumo?.totalProdutosComEstoque ?? 0}
          icone={<Layers className="w-5 h-5" />}
        />
        <CardKpi
          titulo="Qtd Total"
          valor={resumo?.somaQuantidade ?? 0}
          icone={<Package className="w-5 h-5" />}
        />
        {analytics?.valorTotalEstoque !== undefined && (
          <CardKpi
            titulo="Valor Estoque"
            valor={formatarMoeda(analytics.valorTotalEstoque!)}
            icone={<Package className="w-5 h-5" />}
          />
        )}
        {analytics?.produtosAbaixoMinimo !== undefined &&
          analytics.produtosAbaixoMinimo > 0 && (
            <CardKpi
              titulo="Abaixo Mínimo"
              valor={analytics.produtosAbaixoMinimo}
              icone={<Package className="w-5 h-5" />}
            />
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardGrafico titulo="Resumo">
          {dadosGrafico.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico} margin={{ top: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="valor"
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

        {depositos.length > 0 && (
          <CardGrafico titulo="Por Depósito">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={depositos.slice(0, 8)}
                margin={{ top: 10, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="descricao"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    v?.length > 10 ? v.slice(0, 9) + "…" : v
                  }
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill={coresGraficos.secundario}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        {topProdutos.length > 0 && (
          <CardGrafico titulo="Mais Vendidos">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topProdutos.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
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
                <Tooltip />
                <Bar
                  dataKey="quantidade"
                  fill={coresGraficos.primario}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardGrafico>
        )}

        {analytics?.produtosSemMovimento90Dias !== undefined &&
          analytics.produtosSemMovimento90Dias > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100">
                <h3 className="text-sm font-semibold text-slate-800">
                  Parados 90+ dias
                </h3>
                <p className="text-lg font-bold text-amber-700 mt-0.5">
                  {analytics.produtosSemMovimento90Dias}
                </p>
              </div>
            </div>
          )}
      </div>
    </PaginaBI>
  );
}
