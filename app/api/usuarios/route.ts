import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Usuario } from "@/core/tipos";
import { logger } from "@/core/utils/logger";
import { ListarUsuariosQuerySchema, CriarUsuarioSchema } from "@/core/schemas/usuario-schemas";

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
    const queryValidacao = ListarUsuariosQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search"),
      sit: searchParams.get("sit"),
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
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/usuarios`,
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
            message: "Erro ao buscar usuários",
          },
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Usuario[];

    return NextResponse.json({
      success: true,
      data: dados,
    });
  } catch (erro) {
    logger.error("Erro ao listar usuários", erro, {
      endpoint: "/api/usuarios",
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
    const validacao = CriarUsuarioSchema.safeParse(bodyRaw);

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
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/usuarios`,
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
            message: "Erro ao criar usuário",
          },
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Usuario;

    return NextResponse.json({
      success: true,
      data: dados,
    });
  } catch (erro) {
    logger.error("Erro ao criar usuário", erro, {
      endpoint: "/api/usuarios",
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
