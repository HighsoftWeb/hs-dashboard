import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ContaReceber } from "@/core/tipos";

async function obterToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || null;
}

export async function GET(): Promise<NextResponse> {
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

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/financeiro/contas-receber`,
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
          mensagem: "Erro ao buscar contas a receber",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as ContaReceber[];

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

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const body = (await request.json()) as Omit<
      ContaReceber,
      "id" | "criadoEm" | "atualizadoEm"
    >;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/financeiro/contas-receber`,
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
          sucesso: false,
          mensagem: "Erro ao criar conta a receber",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as ContaReceber;

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
