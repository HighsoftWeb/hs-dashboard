"use client";

import React from "react";
import Link from "next/link";
import { Package, Users, Wallet, ArrowRight } from "lucide-react";

const MODULOS = [
  {
    id: "produtos",
    titulo: "Análise de Produtos",
    descricao:
      "Produtos mais vendidos, mais lucro, prejuízo e parados (sem venda há X dias com estoque)",
    href: "/dashboard/metricas/produtos",
    icone: Package,
    destaque: true,
  },
  {
    id: "clientes",
    titulo: "Análise de Clientes",
    descricao:
      "Top clientes por faturamento e clientes inativos (pararam de comprar)",
    href: "/dashboard/metricas/clientes",
    icone: Users,
    destaque: false,
  },
  {
    id: "caixa",
    titulo: "Caixa e Inadimplência",
    descricao:
      "Indicadores de caixa (receitas x despesas, saldo, tendência), % inadimplência e fluxo de recebimento mensal",
    href: "/dashboard/metricas/caixa",
    icone: Wallet,
    destaque: false,
  },
];

export default function PaginaMetricasHub(): React.JSX.Element {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Métricas</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Análises detalhadas de produtos, clientes e indicadores financeiros
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Análises disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULOS.map((mod) => {
          const Icon = mod.icone;
          return (
            <Link
              key={mod.id}
              href={mod.href}
              className={`rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md hover:border-highsoft-primario/30 group ${
                mod.destaque
                  ? "border-highsoft-primario/30 ring-1 ring-highsoft-primario/10"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    mod.destaque
                      ? "bg-highsoft-primario/10 text-highsoft-primario"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-highsoft-primario group-hover:translate-x-1 transition" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {mod.titulo}
              </h2>
              <p className="text-sm text-slate-500">{mod.descricao}</p>
            </Link>
          );
        })}
        </div>
      </div>
    </div>
  );
}
