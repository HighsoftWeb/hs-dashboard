export interface ContaReceber {
  id: string;
  clienteId: string;
  orcamentoId?: string;
  ordemServicoId?: string;
  notaFiscalVendaId?: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: "pendente" | "pago" | "cancelado";
  formaPagamento?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ContaPagar {
  id: string;
  fornecedorId: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: "pendente" | "pago" | "cancelado";
  formaPagamento?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Fornecedor {
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

export interface MovimentacaoFinanceira {
  id: string;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao: string;
  valor: number;
  data: Date;
  contaId?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
