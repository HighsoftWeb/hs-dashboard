"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { clienteHttp } from "@/core/http/cliente-http";
import { formatarMoeda } from "@/core/utils/formatar-moeda";
import { PaginaBI } from "@/core/componentes/dashboard/pagina-bi";
import { obterIntervaloPadrao } from "@/core/componentes/dashboard/filtro-periodo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface IndicadoresProduto {
  faturamento: number;
  quantidadeVendida: number;
  custoTotal: number;
  lucroTotal: number;
  margemPercentual: number;
}

interface HistoricoMateriaPrima {
  codMateriaPrima: number;
  descricao: string;
  historico: { data: string; precoUnitario: number }[];
}

interface RespostaProdutoAnalytics {
  indicadores: IndicadoresProduto;
  materiasPrimaCompras: HistoricoMateriaPrima[];
}

interface Props {
  params: { codProduto: string };
}

export default function PaginaDeepDiveProduto({
  params,
}: Props): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const padrao = obterIntervaloPadrao();
  const [dataInicio, setDataInicio] = useState(
    searchParams.get("dataInicio") ?? padrao.dataInicio
  );
  const [dataFim, setDataFim] = useState(
    searchParams.get("dataFim") ?? padrao.dataFim
  );
  const [dados, setDados] = useState<RespostaProdutoAnalytics | null>(null);
  const [codMateriaSelecionada, setCodMateriaSelecionada] =
    useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");
        const sp = new URLSearchParams({
          codProduto: params.codProduto,
          dataInicio,
          dataFim,
        });
        const resp =
          await clienteHttp.get<RespostaProdutoAnalytics>(
            `/dashboard/analytics/produto?${sp.toString()}`
          );
        if (!resp.success || !resp.data) {
          throw new Error(resp.error?.message || "Erro ao carregar analytics");
        }
        setDados(resp.data);
        const primeiraMateria = resp.data.materiasPrimaCompras?.[0];
        setCodMateriaSelecionada(primeiraMateria?.codMateriaPrima ?? null);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar");
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [params.codProduto, dataInicio, dataFim]);

  const onPeriodoChange = (inicio: string, fim: string) => {
    setDataInicio(inicio);
    setDataFim(fim);
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set("dataInicio", inicio);
    sp.set("dataFim", fim);
    router.replace(`?${sp.toString()}`);
  };

  if (carregando) {
    return (
      <PaginaBI
        titulo="Deep-dive Produto"
        dataInicio={dataInicio}
        dataFim={dataFim}
        onPeriodoChange={onPeriodoChange}
      >
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-slate-200" />
            <div className="h-8 w-56 rounded bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-32 rounded-xl bg-slate-200" />
            <div className="h-32 rounded-xl bg-slate-200" />
            <div className="h-32 rounded-xl bg-slate-200" />
            <div className="lg:col-span-3 h-72 rounded-xl bg-slate-200" />
          </div>
        </div>
      </PaginaBI>
    );
  }

  if (erro) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{erro}</p>
        </div>
      </div>
    );
  }

  const indicadores = dados?.indicadores;
  const materias = dados?.materiasPrimaCompras ?? [];
  const materiaSelecionada = materias.find(
    (m) => m.codMateriaPrima === codMateriaSelecionada
  );

  const historico = materiaSelecionada?.historico ?? [];

  return (
    <PaginaBI
      titulo="Deep-dive Produto"
      dataInicio={dataInicio}
      dataFim={dataFim}
      onPeriodoChange={onPeriodoChange}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/metricas/produtos"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Produto {params.codProduto}
            </h1>
            <p className="text-xs text-slate-500">
              Análise de faturamento, margem e matérias-primas
            </p>
          </div>
        </div>

        {indicadores && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Faturamento</p>
              <p className="text-lg font-bold text-slate-900">
                {formatarMoeda(indicadores.faturamento)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Qtd. Vendida</p>
              <p className="text-lg font-bold text-slate-900">
                {indicadores.quantidadeVendida}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Custo Total</p>
              <p className="text-lg font-bold text-slate-900">
                {formatarMoeda(indicadores.custoTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Lucro</p>
              <p className="text-lg font-bold text-slate-900">
                {formatarMoeda(indicadores.lucroTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Margem</p>
              <p className="text-lg font-bold text-slate-900">
                {indicadores.margemPercentual.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">
              Matérias-primas
            </h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {materias.map((m) => (
                <button
                  key={m.codMateriaPrima}
                  type="button"
                  onClick={() => setCodMateriaSelecionada(m.codMateriaPrima)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded cursor-pointer ${
                    m.codMateriaPrima === codMateriaSelecionada
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="truncate">{m.descricao}</div>
                  <div className="text-[10px] text-slate-500">
                    {m.historico.length} pontos de preço
                  </div>
                </button>
              ))}
              {materias.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nenhuma matéria-prima encontrada para o produto.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">
              Oscilação de preço da matéria-prima
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              {materiaSelecionada
                ? materiaSelecionada.descricao
                : "Selecione uma matéria-prima ao lado"}
            </p>
            {historico.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={historico}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      formatarMoeda(v).replace(/\s/g, "").slice(0, 8)
                    }
                  />
                  <Tooltip
                    formatter={(v) => formatarMoeda(Number(v ?? 0))}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="precoUnitario"
                    name="Preço unitário"
                    stroke="#0f766e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 mt-8 text-center">
                Nenhum histórico de compra encontrado para o período selecionado.
              </p>
            )}
          </div>
        </div>
      </div>
    </PaginaBI>
  );
}

