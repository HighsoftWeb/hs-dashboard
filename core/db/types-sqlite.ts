export interface EmpresaRow {
  id: number;
  cnpj: string;
  nome_empresa: string;
  host: string;
  porta: number;
  nome_base: string;
  usuario: string;
  senha: string;
  codigos_usuarios_permitidos: string | null;
  cor_primaria: string | null;
  cor_secundaria: string | null;
  cor_terciaria: string | null;
  criado_em: string;
  atualizado_em: string;
}
