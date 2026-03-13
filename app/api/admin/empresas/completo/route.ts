import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";

const ADMIN_PASSWORD = "hs@010896@hs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const adminPassword = request.headers.get("X-Admin-Password");

    if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Não autorizado",
          },
        },
        { status: 401 }
      );
    }

    const empresas = empresaConfigRepository.listarTodas();
    return NextResponse.json({
      success: true,
      data: empresas,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            erro instanceof Error ? erro.message : "Erro ao listar empresas",
        },
      },
      { status: 500 }
    );
  }
}
