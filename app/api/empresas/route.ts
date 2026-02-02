import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Empresa } from "@/core/tipos";
import { logger } from "@/core/utils/logger";
import { ListarEmpresasQuerySchema, CriarEmpresaSchema } from "@/core/schemas/empresa-schemas";

async function obterToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await obterToken();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Não autenticado",
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryValidacao = ListarEmpresasQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      ativo: searchParams.get("ativo"),
    });

    if (!queryValidacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parâmetros de consulta inválidos",
            errors: queryValidacao.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/empresas`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!resposta.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Erro ao buscar empresas",
          },
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Empresa[];

    return NextResponse.json({
      success: true,
      data: dados,
    });
  } catch (erro) {
    logger.error("Erro ao listar empresas", erro, {
      endpoint: "/api/empresas",
      method: "GET",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: erro instanceof Error ? erro.message : "Erro desconhecido",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await obterToken();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Não autenticado",
          },
        },
        { status: 401 }
      );
    }

    const bodyRaw = await request.json();
    const validacao = CriarEmpresaSchema.safeParse(bodyRaw);

    if (!validacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            errors: validacao.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const body = validacao.data;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/empresas`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      }
    );

    if (!resposta.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Erro ao criar empresa",
          },
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Empresa;

    return NextResponse.json({
      success: true,
      data: dados,
    });
  } catch (erro) {
    logger.error("Erro ao criar empresa", erro, {
      endpoint: "/api/empresas",
      method: "POST",
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: erro instanceof Error ? erro.message : "Erro desconhecido",
        },
      },
      { status: 500 }
    );
  }
}
