"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEEP_DIVE } from "@/core/utils/deep-dive-urls";
import { ChevronLeft } from "lucide-react";
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
import { PaginaBI } from "@/core/componentes/dashboard/pagina-bi";
import { obterIntervaloPadrao } from "@/core/componentes/dashboard/filtro-periodo";

interface MetricasProdutos {
  produtosMaisVendidos?: {
    codProduto?: number;
    descricao: string;
    quantidade: number;
    valorTotal: number;
  }[];
  produtosMaisLucro?: {
    codProduto?: number;
    descricao: string;
    receita: number;
    custo: number;
    lucro: number;
    margemPercentual: number;
  }[];
  produtosPrejuizo?: {
    codProduto?: number;
    descricao: string;
    lucro: number;
    margemPercentual: number;
  }[];
  produtosParados?: {
    codProduto?: number;
    descricao: string;
    quantidadeEstoque: number;
    valorEstoque: number;
    diasSemVenda: number;
  }[];
}

export default function PaginaMetricasProdutos(): React.JSX.Element {
  const router = useRouter();
  const { cores } = useEmpresa();
  const coresGraficos = obterCoresGraficos(cores);
  const padrao = obterIntervaloPadrao();
  const [dados, setDados] = useState<MetricasProdutos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState(padrao.dataInicio);
  const [dataFim, setDataFim] = useState(padrao.dataFim);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const resp = await servicoDashboard.obterAnalytics({
        tipo: "metricas",
        dataInicio,
        dataFim,
      });
      setDados(resp as MetricasProdutos);
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
        titulo="Métricas Produtos"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-72 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  if (erro) {
    return (
      <PaginaBI
        titulo="Métricas Produtos"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={(i, f) => {
          setDataInicio(i);
          setDataFim(f);
        }}
      >
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      </PaginaBI>
    );
  }

  const filtro = (descricao: string) =>
    !busca || descricao.toLowerCase().includes(busca.trim().toLowerCase());

  const maisVendidos = (dados?.produtosMaisVendidos ?? []).filter((p) =>
    filtro(p.descricao)
  );
  const maisLucro = (dados?.produtosMaisLucro ?? []).filter((p) =>
    filtro(p.descricao)
  );
  const prejuizo = (dados?.produtosPrejuizo ?? []).filter((p) =>
    filtro(p.descricao)
  );
  const parados = (dados?.produtosParados ?? []).filter((p) =>
    filtro(p.descricao)
  );

  return (
    <PaginaBI
      titulo="Métricas Produtos"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={(i, f) => {
        setDataInicio(i);
        setDataFim(f);
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/estoque"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-slate-900">
              Métricas Produtos
            </h1>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="w-48 sm:w-64 text-xs rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-highsoft-primario"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {maisVendidos.length > 0 && (
            <CardGrafico titulo="Mais Vendidos" href={DEEP_DIVE.produtos}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={maisVendidos.slice(0, 8)}
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
                      v?.length > 14 ? v.slice(0, 13) + "…" : v
                    }
                  />
                  <Tooltip formatter={(v) => v} />
                  <Bar
                    dataKey="quantidade"
                    fill={coresGraficos.primario}
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
            </CardGrafico>
          )}

          {maisLucro.length > 0 && (
            <CardGrafico titulo="Maior Lucro" href={DEEP_DIVE.produtos}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={maisLucro.slice(0, 8)}
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
                    dataKey="descricao"
                    width={100}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) =>
                      v?.length > 14 ? v.slice(0, 13) + "…" : v
                    }
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Bar
                    dataKey="lucro"
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                    name="Lucro"
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
            </CardGrafico>
          )}

          {prejuizo.length > 0 && (
            <CardGrafico titulo="Prejuízo" href={DEEP_DIVE.produtos}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={prejuizo.slice(0, 6)}
                  margin={{ top: 10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="descricao"
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) =>
                      v?.length > 12 ? v.slice(0, 11) + "…" : v
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    tickFormatter={(v) =>
                      formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                    }
                  />
                  <Tooltip formatter={(v) => formatarMoeda(Number(v ?? 0))} />
                  <Bar
                    dataKey="lucro"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Prejuízo"
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
            </CardGrafico>
          )}

          {parados.length > 0 && (
            <CardGrafico titulo="Parados 90+ dias" href={DEEP_DIVE.produtos}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={parados.slice(0, 6)}
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
                      v?.length > 14 ? v.slice(0, 13) + "…" : v
                    }
                  />
                  <Tooltip formatter={(v) => v} />
                  <Bar
                    dataKey="quantidadeEstoque"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    name="Estoque"
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
            </CardGrafico>
          )}

          {maisVendidos.length === 0 &&
            maisLucro.length === 0 &&
            prejuizo.length === 0 &&
            parados.length === 0 && (
              <p className="text-sm text-slate-500 col-span-2 text-center py-12">
                Sem dados no período
              </p>
            )}
        </div>
      </div>
    </PaginaBI>
  );
}
