import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { EmpresaConfigInput } from "@/core/entities/EmpresaConfig";
import { filtrarEmpresaSegura } from "@/core/utils/filtrar-empresa-segura";

interface EmpresaRequestBody {
  cnpj?: string;
  nomeEmpresa?: string;
  host?: string;
  porta?: number | string;
  nomeBase?: string;
  usuario?: string;
  senha?: string;
  codigosUsuariosPermitidos?: string | null;
}

function validarBodyEmpresa(body: unknown): body is EmpresaRequestBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "nomeEmpresa" in body &&
    "host" in body &&
    "nomeBase" in body &&
    "usuario" in body &&
    "senha" in body
  );
}

export async function GET(): Promise<NextResponse> {
  try {
    const empresas = empresaConfigRepository.listarTodas();
    const empresasSeguras = empresas.map(filtrarEmpresaSegura);
    return NextResponse.json({
      success: true,
      data: empresasSeguras,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: erro instanceof Error ? erro.message : "Erro ao listar empresas",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;

    if (!validarBodyEmpresa(body)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Campos obrigatórios não preenchidos",
          },
        },
        { status: 400 }
      );
    }

    const cnpjLimpo = body.cnpj?.replace(/\D/g, "") || "";

    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
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

    const porta = typeof body.porta === "string" ? parseInt(body.porta, 10) : body.porta || 1433;

    if (isNaN(porta) || porta <= 0 || porta > 65535) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Porta inválida",
          },
        },
        { status: 400 }
      );
    }

    const empresa: EmpresaConfigInput = {
      cnpj: cnpjLimpo,
      nomeEmpresa: body.nomeEmpresa || "",
      host: body.host || "",
      porta,
      nomeBase: body.nomeBase || "",
      usuario: body.usuario || "",
      senha: body.senha || "",
      codigosUsuariosPermitidos: body.codigosUsuariosPermitidos || undefined,
    };

    const empresaExistente = empresaConfigRepository.obterPorCnpj(empresa.cnpj);
    if (empresaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CNPJ já cadastrado",
          },
        },
        { status: 400 }
      );
    }

    const novaEmpresa = empresaConfigRepository.criar(empresa);
    const empresaSegura = filtrarEmpresaSegura(novaEmpresa);
    return NextResponse.json({
      success: true,
      data: empresaSegura,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: erro instanceof Error ? erro.message : "Erro ao criar empresa",
        },
      },
      { status: 500 }
    );
  }
}
