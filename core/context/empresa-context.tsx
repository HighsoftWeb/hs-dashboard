"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { salvarCodEmpresaNoCookie } from "@/core/utils/cod-empresa-cookie";
import { clienteHttp } from "@/core/http/cliente-http";
import type { EmpresaBanco } from "@/core/tipos/empresa-banco";

interface CoresEmpresa {
  primaria: string;
  secundaria: string;
  terciaria: string;
}

interface EmpresasDisponiveisResponse {
  empresas: EmpresaBanco[];
  codEmpresaAtual: number | null;
  cores?: CoresEmpresa;
}

interface EmpresaContextValue {
  empresaAtual: EmpresaBanco | null;
  empresas: EmpresaBanco[];
  codEmpresaAtual: number | null;
  cores: CoresEmpresa;
  carregando: boolean;
  trocarEmpresa: (codEmpresa: number) => Promise<void>;
  recarregar: () => Promise<void>;
}

const CORES_PADRAO: CoresEmpresa = {
  primaria: "#64748b",
  secundaria: "#94a3b8",
  terciaria: "#cbd5e1",
};

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [empresaAtual, setEmpresaAtual] = useState<EmpresaBanco | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaBanco[]>([]);
  const [codEmpresaAtual, setCodEmpresaAtual] = useState<number | null>(null);
  const [cores, setCores] = useState<CoresEmpresa>(CORES_PADRAO);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await clienteHttp.get<EmpresasDisponiveisResponse>(
        "/dashboard/empresas-disponiveis"
      );
      if (resposta.success && resposta.data) {
        setEmpresas(resposta.data.empresas || []);
        setCodEmpresaAtual(resposta.data.codEmpresaAtual ?? null);
        if (resposta.data.cores) {
          setCores(resposta.data.cores);
        } else {
          setCores(CORES_PADRAO);
        }
        const cod = resposta.data.codEmpresaAtual;
        if (cod && resposta.data.empresas?.length) {
          const encontrada = resposta.data.empresas.find(
            (e) => e.COD_EMPRESA === cod
          );
          setEmpresaAtual(encontrada || resposta.data.empresas[0] || null);
        } else if (resposta.data.empresas?.length) {
          setEmpresaAtual(resposta.data.empresas[0]);
        } else {
          setEmpresaAtual(null);
        }
      }
    } catch {
      setEmpresas([]);
      setEmpresaAtual(null);
      setCodEmpresaAtual(null);
      setCores(CORES_PADRAO);
    } finally {
      setCarregando(false);
    }
  }, []);

  const trocarEmpresa = useCallback(
    async (codEmpresa: number) => {
      salvarCodEmpresaNoCookie(codEmpresa);
      setCodEmpresaAtual(codEmpresa);
      const encontrada = empresas.find((e) => e.COD_EMPRESA === codEmpresa);
      setEmpresaAtual(encontrada || null);
      router.refresh();
    },
    [empresas, router]
  );

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--highsoft-primario", cores.primaria);
    root.style.setProperty("--highsoft-primario-hover", cores.primaria + "ee");
    root.style.setProperty("--highsoft-secundario", cores.secundaria);
    root.style.setProperty("--highsoft-terciario", cores.terciaria);
    return () => {
      root.style.removeProperty("--highsoft-primario");
      root.style.removeProperty("--highsoft-primario-hover");
      root.style.removeProperty("--highsoft-secundario");
      root.style.removeProperty("--highsoft-terciario");
    };
  }, [cores]);

  const value: EmpresaContextValue = {
    empresaAtual,
    empresas,
    codEmpresaAtual,
    cores,
    carregando,
    trocarEmpresa,
    recarregar,
  };

  return (
    <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
  );
}

export function useEmpresa(): EmpresaContextValue {
  const ctx = useContext(EmpresaContext);
  if (!ctx) {
    throw new Error("useEmpresa deve ser usado dentro de EmpresaProvider");
  }
  return ctx;
}
