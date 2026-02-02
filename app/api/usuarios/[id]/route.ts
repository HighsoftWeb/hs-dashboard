import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Usuario } from "@/core/tipos";

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
          sucesso: false,
          mensagem: "Não autenticado",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/usuarios/${id}`,
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
          sucesso: false,
          mensagem: "Erro ao buscar usuário",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Usuario;

    return NextResponse.json({
      sucesso: true,
      dados,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao processar requisição",
        erro: erro instanceof Error ? erro.message : "Erro desconhecido",
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
          sucesso: false,
          mensagem: "Não autenticado",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = (await request.json()) as Partial<
      Omit<Usuario, "id" | "criadoEm" | "atualizadoEm">
    >;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/usuarios/${id}`,
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
          sucesso: false,
          mensagem: "Erro ao atualizar usuário",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Usuario;

    return NextResponse.json({
      sucesso: true,
      dados,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao processar requisição",
        erro: erro instanceof Error ? erro.message : "Erro desconhecido",
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
          sucesso: false,
          mensagem: "Não autenticado",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/usuarios/${id}`,
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
          sucesso: false,
          mensagem: "Erro ao excluir usuário",
        },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Usuário excluído com sucesso",
    });
  } catch (erro) {
    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro ao processar requisição",
        erro: erro instanceof Error ? erro.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
