import { NextRequest, NextResponse } from "next/server";
import { validarAutenticacao } from "@/core/middleware/auth-middleware";
import { obterEmpresaConfigDoCookie, obterCodEmpresaDoCookie } from "@/core/utils/obter-empresa-cookie";
import { poolBanco } from "@/core/db/pool-banco";
import { tratarErroAPI } from "@/core/utils/tratar-erro";
import { criarRespostaSucesso, criarRespostaErro } from "@/core/utils/resposta-api";

interface EmpresaAtual {
  COD_EMPRESA: number;
  NOM_EMPRESA: string;
  FAN_EMPRESA: string | null;
}

const QUERY_EMPRESA = `
  SELECT 
    COD_EMPRESA,
    NOM_EMPRESA,
    FAN_EMPRESA
  FROM dbo.EMPRESAS
  WHERE COD_EMPRESA = @codEmpresa
` as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    validarAutenticacao(request);
    const empresaConfig = obterEmpresaConfigDoCookie(request);
    const codEmpresa = obterCodEmpresaDoCookie(request);

    if (!codEmpresa) {
      return NextResponse.json(
        criarRespostaErro("Código da empresa não encontrado", "VALIDATION_ERROR"),
        { status: 400 }
      );
    }

    await poolBanco.configurar(empresaConfig);

    const empresas = await poolBanco.executarConsulta<EmpresaAtual>(
      QUERY_EMPRESA,
      { codEmpresa },
      empresaConfig
    );

    if (!empresas || empresas.length === 0) {
      return NextResponse.json(
        criarRespostaErro("Empresa não encontrada", "NOT_FOUND"),
        { status: 404 }
      );
    }

    return NextResponse.json(criarRespostaSucesso(empresas[0]));
  } catch (erro) {
    return tratarErroAPI(erro, {
      endpoint: "/api/dashboard/empresa-atual",
      method: "GET",
    });
  }
}
