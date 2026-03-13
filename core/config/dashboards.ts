import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  FileText,
  ClipboardList,
} from "lucide-react";

export interface ConfigDashboardItem {
  titulo: string;
  href: string;
}

export interface ConfigDashboard {
  id: string;
  titulo: string;
  descricao: string;
  href: string;
  icone: LucideIcon;
  schemas: string[];
  ordem: number;
  itens?: ConfigDashboardItem[];
}

export const DASHBOARDS: ConfigDashboard[] = [
  {
    id: "executivo",
    titulo: "Visão Geral",
    descricao: "Dashboard executiva com indicadores consolidados",
    href: "/dashboard",
    icone: LayoutDashboard,
    schemas: [
      "orcamentos_os",
      "titulos_receber",
      "titulos_pagar",
      "notas_fiscais_venda",
      "clientes_fornecedores",
      "produtos_servicos",
    ],
    ordem: 0,
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    descricao: "Indicadores financeiros e métricas de caixa",
    href: "/dashboard/financeiro",
    icone: DollarSign,
    schemas: [
      "titulos_receber",
      "titulos_pagar",
      "movimentos_titulos_receber",
      "movimentos_titulos_pagar",
      "movimentos_contas_correntes",
    ],
    ordem: 5,
    itens: [
      { titulo: "Visão Geral", href: "/dashboard/financeiro" },
      { titulo: "Métricas Caixa", href: "/dashboard/metricas/caixa" },
    ],
  },
  {
    id: "vendas",
    titulo: "Vendas e Faturamento",
    descricao: "Análise de faturamento, orçamentos e conversão",
    href: "/dashboard/vendas",
    icone: TrendingUp,
    schemas: [
      "orcamentos_os",
      "itens_orcamento_os",
      "notas_fiscais_venda",
      "itens_nf_venda",
      "comissoes",
    ],
    ordem: 2,
  },
  {
    id: "comercial",
    titulo: "Comercial",
    descricao: "Orçamentos, OS e notas fiscais de venda",
    href: "/dashboard/comercial",
    icone: FileText,
    schemas: ["orcamentos_os", "itens_orcamento_os", "notas_fiscais_venda"],
    ordem: 1,
  },

  {
    id: "clientes",
    titulo: "Clientes",
    descricao: "Análise de clientes, compradores e inadimplência",
    href: "/dashboard/clientes",
    icone: Users,
    schemas: [
      "clientes_fornecedores",
      "notas_fiscais_venda",
      "titulos_receber",
    ],
    ordem: 3,
    itens: [
      { titulo: "Métricas Cliente", href: "/dashboard/metricas/clientes" },
    ],
  },
  {
    id: "produtos-estoque",
    titulo: "Produtos e Estoque",
    descricao: "Estoque, margem, giro e produtos parados",
    href: "/dashboard/estoque",
    icone: Package,
    schemas: [
      "estoques",
      "depositos",
      "movimentos_estoque",
      "produtos_servicos",
      "derivacoes",
    ],
    ordem: 4,
    itens: [
      { titulo: "Métricas Produtos", href: "/dashboard/metricas/produtos" },
      { titulo: "Estoque", href: "/dashboard/estoque" },
    ],
  },
  {
    id: "cadastros",
    titulo: "Cadastros",
    descricao: "Todos os cadastros do sistema",
    href: "/dashboard/cadastros/comercial/clientes",
    icone: ClipboardList,
    schemas: [
      "clientes_fornecedores",
      "produtos_servicos",
      "orcamentos_os",
      "notas_fiscais_venda",
      "usuarios",
      "empresas",
    ],
    ordem: 99,
    itens: [
      { titulo: "Clientes", href: "/dashboard/cadastros/comercial/clientes" },
      { titulo: "Produtos", href: "/dashboard/cadastros/comercial/produtos" },
      {
        titulo: "Orçamentos / OS",
        href: "/dashboard/cadastros/saidas/orcamentos-os",
      },
      {
        titulo: "Notas Fiscais Venda",
        href: "/dashboard/comercial/saidas/notas-fiscais-venda",
      },
      {
        titulo: "Contas a Receber",
        href: "/dashboard/financeiro/contas-receber",
      },
      { titulo: "Contas a Pagar", href: "/dashboard/financeiro/contas-pagar" },
      { titulo: "Usuários", href: "/dashboard/cadastros/gerais/usuarios" },
      { titulo: "Empresas", href: "/dashboard/cadastros/gerais/empresas" },
    ],
  },
];

export function obterDashboardPorId(id: string): ConfigDashboard | undefined {
  return DASHBOARDS.find((d) => d.id === id);
}

export function obterDashboardPorHref(
  href: string
): ConfigDashboard | undefined {
  return DASHBOARDS.find(
    (d) => d.href === href || href.startsWith(d.href + "/")
  );
}
