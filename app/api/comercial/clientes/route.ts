import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Cliente } from "@/core/tipos";
import { logger } from "@/core/utils/logger";

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
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/comercial/clientes`,
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
          mensagem: "Erro ao buscar clientes",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Cliente[];

    return NextResponse.json({
      sucesso: true,
      dados,
    });
  } catch (erro) {
    logger.error("Erro ao listar clientes", erro, {
      endpoint: "/api/comercial/clientes",
      method: "GET",
    });

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
      Cliente,
      "id" | "criadoEm" | "atualizadoEm"
    >;

    const resposta = await fetch(
      `${process.env.API_BACKEND_URL || "http://localhost:3001"}/comercial/clientes`,
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
          mensagem: "Erro ao criar cliente",
        },
        { status: resposta.status }
      );
    }

    const dados = (await resposta.json()) as Cliente;

    return NextResponse.json({
      sucesso: true,
      dados,
    });
  } catch (erro) {
    logger.error("Erro ao criar cliente", erro, {
      endpoint: "/api/comercial/clientes",
      method: "POST",
    });

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
