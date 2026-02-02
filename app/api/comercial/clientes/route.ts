import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Cliente } from "@/core/tipos";
import { logger } from "@/core/utils/logger";
import { getBackend, postBackend } from "@/core/http/cliente-http-server";

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

    const resposta = await getBackend<Cliente[]>("/comercial/clientes", token);

    if (!resposta.ok || !resposta.dados) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: resposta.erro || "Erro ao buscar clientes",
        },
        { status: resposta.status }
      );
    }

    const dados = resposta.dados;

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

    const resposta = await postBackend<Cliente>("/comercial/clientes", body, token);

    if (!resposta.ok || !resposta.dados) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: resposta.erro || "Erro ao criar cliente",
        },
        { status: resposta.status }
      );
    }

    const dados = resposta.dados;

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
