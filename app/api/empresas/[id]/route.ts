import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Empresa } from "@/core/tipos";

async function obterToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/empresas/${id}`,
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
            message: "Erro ao buscar empresa",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params;
    const body = (await request.json()) as Partial<
      Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">
    >;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/empresas/${id}`,
      {
        method: "PUT",
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
            code: "UPDATE_ERROR",
            message: "Erro ao atualizar empresa",
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/empresas/${id}`,
      {
        method: "DELETE",
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
            code: "DELETE_ERROR",
            message: "Erro ao excluir empresa",
          },
        },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Empresa excluída com sucesso" },
    });
  } catch (erro) {
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
