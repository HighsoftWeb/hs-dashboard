import { NextRequest, NextResponse } from "next/server";
import { empresaConfigRepository } from "@/core/repository/empresa-config-repository";
import { EmpresaConfigInput } from "@/core/entities/EmpresaConfig";
import { filtrarEmpresaSegura } from "@/core/utils/filtrar-empresa-segura";
import {
  validarCnpjCompleto,
  validarELimparCnpj,
} from "@/core/utils/cnpj-utils";
import { CriarEmpresaSchema } from "@/core/schemas/empresa-schemas";
import { tratarErroAPI } from "@/core/utils/tratar-erro";

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
  try {
    const body = await request.json();
    const validacao = CriarEmpresaSchema.safeParse(body);

    if (!validacao.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validacao.error.issues.map((e) => e.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const cnpjLimpo = validarELimparCnpj(validacao.data.cnpj, {
      validarDigitos: true,
    });

    if (!cnpjLimpo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "CNPJ inválido",
          },
        },
        { status: 400 }
      );
    }

    if (!validarCnpjCompleto(validacao.data.cnpj)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "CNPJ inválido: dígitos verificadores incorretos",
          },
        },
        { status: 400 }
      );
    }

    const empresa: EmpresaConfigInput = {
      cnpj: cnpjLimpo,
      nomeEmpresa: validacao.data.nomeEmpresa,
      host: validacao.data.host,
      porta: validacao.data.porta,
      nomeBase: validacao.data.nomeBase,
      usuario: validacao.data.usuario,
      senha: validacao.data.senha,
      codigosUsuariosPermitidos:
        validacao.data.codigosUsuariosPermitidos || undefined,
    };

    const empresaExistente = empresaConfigRepository.obterPorCnpj(empresa.cnpj);
    if (empresaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_ERROR",
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
    return tratarErroAPI(erro, {
      endpoint: "/api/admin/empresas",
      method: "POST",
    });
  }
}
