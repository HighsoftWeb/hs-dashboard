export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  codigoBarras?: string;
  preco: number;
  estoque: number;
  unidadeMedida: string;
  categoria?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type TipoDocumento = "orcamento" | "ordem-servico" | "nota-fiscal-venda";

export interface Orcamento {
  id: string;
  clienteId: string;
  numero: string;
  data: Date;
  valorTotal: number;
  tipo: TipoDocumento;
  status: string;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ItemOrcamento {
  id: string;
  orcamentoId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type OrdemServico = Orcamento;
export type NotaFiscalVenda = Orcamento;

export type Pedido = Orcamento;
export type ItemPedido = ItemOrcamento;
