import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { filtrarEmpresaSegura } from "@/core/utils/filtrar-empresa-segura";
import { EmpresaConfigInput } from "@/core/entities/EmpresaConfig";

const ADMIN_PASSWORD = "hs@010896@hs";

function validarAdmin(request: NextRequest): boolean {
  const pw = request.headers.get("X-Admin-Password");
  return !!pw && pw === ADMIN_PASSWORD;
}

interface EmpresaRequestBody {
  cnpj?: string;
  nomeEmpresa?: string;
  host?: string;
  porta?: number | string;
  nomeBase?: string;
  usuario?: string;
  senha?: string;
  codigosUsuariosPermitidos?: string | null;
  corPrimaria?: string;
  corSecundaria?: string;
  corTerciaria?: string;
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
          message:
            erro instanceof Error ? erro.message : "Erro ao listar empresas",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!validarAdmin(request)) {
    return NextResponse.json(
      { success: false, error: { message: "Não autorizado" } },
      { status: 401 }
    );
  }
  try {
    const body = (await request.json()) as unknown;
    if (!validarBodyEmpresa(body)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Campos obrigatórios não preenchidos" },
        },
        { status: 400 }
      );
    }
    const cnpjLimpo = body.cnpj?.replace(/\D/g, "") || "";
    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
      return NextResponse.json(
        { success: false, error: { message: "CNPJ inválido" } },
        { status: 400 }
      );
    }
    const porta =
      typeof body.porta === "string"
        ? parseInt(body.porta, 10)
        : body.porta || 1433;
    if (isNaN(porta) || porta <= 0 || porta > 65535) {
      return NextResponse.json(
        { success: false, error: { message: "Porta inválida" } },
        { status: 400 }
      );
    }
    const empresaExistente = empresaConfigRepository.obterPorCnpj(cnpjLimpo);
    if (empresaExistente) {
      return NextResponse.json(
        { success: false, error: { message: "CNPJ já cadastrado" } },
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
      corPrimaria: body.corPrimaria || "#094a73",
      corSecundaria: body.corSecundaria || "#048abf",
      corTerciaria: body.corTerciaria || "#04b2d9",
    };
    const novaEmpresa = empresaConfigRepository.criar(empresa);
    return NextResponse.json({ success: true, data: novaEmpresa });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            erro instanceof Error ? erro.message : "Erro ao criar empresa",
        },
      },
      { status: 500 }
    );
  }
}
