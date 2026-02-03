import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { filtrarEmpresaSegura } from "@/core/utils/filtrar-empresa-segura";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;

    if (!resolvedParams.cnpj || typeof resolvedParams.cnpj !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CNPJ não fornecido",
          },
        },
        { status: 400 }
      );
    }

    const cnpj = resolvedParams.cnpj.replace(/\D/g, "");

    if (cnpj.length !== 14) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CNPJ inválido",
          },
        },
        { status: 400 }
      );
    }

    const empresa = empresaConfigRepository.obterPorCnpj(cnpj);

    if (!empresa) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Empresa não encontrada",
          },
        },
        { status: 404 }
      );
    }

    const empresaSegura = filtrarEmpresaSegura(empresa);

    return NextResponse.json({
      success: true,
      data: empresaSegura,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            erro instanceof Error ? erro.message : "Erro ao buscar empresa",
        },
      },
      { status: 500 }
    );
  }
}
