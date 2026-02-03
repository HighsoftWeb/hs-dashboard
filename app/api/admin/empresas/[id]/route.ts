import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { EmpresaConfigInput } from "@/core/entities/EmpresaConfig";
import { filtrarEmpresaSegura } from "@/core/utils/filtrar-empresa-segura";
import {
  validarELimparCnpj,
  validarCnpjCompleto,
} from "@/core/utils/cnpj-utils";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "ID inválido",
          },
        },
        { status: 400 }
      );
    }

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

    const cnpjLimpo = validarELimparCnpj(body.cnpj, { validarDigitos: true });

    if (!cnpjLimpo) {
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

    if (!validarCnpjCompleto(body.cnpj || "")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CNPJ inválido: dígitos verificadores incorretos",
          },
        },
        { status: 400 }
      );
    }

    const porta =
      typeof body.porta === "string"
        ? parseInt(body.porta, 10)
        : body.porta || 1433;

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

    const empresaExistente = empresaConfigRepository.obterPorId(id);
    if (!empresaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Empresa não encontrada",
          },
        },
        { status: 404 }
      );
    }

    const empresaComCnpj = empresaConfigRepository.obterPorCnpj(empresa.cnpj);
    if (empresaComCnpj && empresaComCnpj.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CNPJ já cadastrado em outra empresa",
          },
        },
        { status: 400 }
      );
    }

    const empresaAtualizada = empresaConfigRepository.atualizar(id, empresa);
    const empresaSegura = filtrarEmpresaSegura(empresaAtualizada);
    return NextResponse.json({
      success: true,
      data: empresaSegura,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            erro instanceof Error ? erro.message : "Erro ao atualizar empresa",
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
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "ID inválido",
          },
        },
        { status: 400 }
      );
    }

    const empresaExistente = empresaConfigRepository.obterPorId(id);
    if (!empresaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Empresa não encontrada",
          },
        },
        { status: 404 }
      );
    }

    empresaConfigRepository.excluir(id);
    return NextResponse.json({
      success: true,
    });
  } catch (erro) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            erro instanceof Error ? erro.message : "Erro ao excluir empresa",
        },
      },
      { status: 500 }
    );
  }
}
