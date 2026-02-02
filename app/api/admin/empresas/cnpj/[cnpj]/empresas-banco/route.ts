import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { poolBanco } from "@/core/db/pool-banco";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { validarELimparCnpj } from "@/core/utils/cnpj-utils";
import { criarRespostaSucesso, criarRespostaErro } from "@/core/utils/resposta-api";
import type { EmpresaBanco } from "@/core/tipos/empresa-banco";

const QUERY_EMPRESAS = `
  SELECT 
    COD_EMPRESA,
    NOM_EMPRESA,
    FAN_EMPRESA,
    CGC_EMPRESA,
    SIT_EMPRESA
  FROM dbo.EMPRESAS
  WHERE SIT_EMPRESA = 'A' OR SIT_EMPRESA IS NULL
  ORDER BY NOM_EMPRESA
` as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const cnpjLimpo = validarELimparCnpj(resolvedParams.cnpj);

    if (!cnpjLimpo) {
      return NextResponse.json(
        criarRespostaErro("CNPJ inválido ou não fornecido", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    const empresaConfig = empresaConfigRepository.obterPorCnpj(cnpjLimpo);

    if (!empresaConfig) {
      return NextResponse.json(
        criarRespostaErro("Empresa não encontrada", "NOT_FOUND"),
        { status: 404 }
      );
    }

    poolBanco.configurar(empresaConfig);

    const empresas = await poolBanco.executarConsulta<EmpresaBanco>(
      QUERY_EMPRESAS,
      {},
      empresaConfig
    );

    return NextResponse.json(criarRespostaSucesso(empresas));
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/admin/empresas/cnpj/[cnpj]/empresas-banco",
      method: "GET",
    });
  }
}
