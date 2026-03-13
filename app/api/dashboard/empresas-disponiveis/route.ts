import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import {
  obterEmpresaConfigDoCookie,
  obterCodEmpresaDoCookie,
} from "@/core/utils/obter-empresa-cookie";
import { poolBanco } from "@/core/db/pool-banco";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaSucesso } from "@/core/utils/resposta-api";
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresaAtual = obterCodEmpresaDoCookie(request);

    await poolBanco.configurar(empresaConfig);

    const empresas = await poolBanco.executarConsulta<EmpresaBanco>(
      QUERY_EMPRESAS,
      {},
      empresaConfig
    );

    return NextResponse.json(
      criarRespostaSucesso({
        empresas: empresas || [],
        codEmpresaAtual,
        cores: {
          primaria: empresaConfig.corPrimaria || "#64748b",
          secundaria: empresaConfig.corSecundaria || "#94a3b8",
          terciaria: empresaConfig.corTerciaria || "#cbd5e1",
        },
      })
    );
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/empresas-disponiveis",
      method: "GET",
    });
  }
}
