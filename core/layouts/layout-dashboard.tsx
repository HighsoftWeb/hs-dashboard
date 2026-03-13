"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Building2, User } from "lucide-react";
import type { Usuario } from "../tipos/usuario";
import { servicoAutenticacao } from "../domains/auth/client/auth-client";
import { useEmpresa } from "../context/empresa-context";
import { DASHBOARDS } from "../config/dashboards";
import { logger } from "../utils/logger";

interface PropsLayoutDashboard {
  children: React.ReactNode;
}

export function LayoutDashboard({
  children,
}: PropsLayoutDashboard): React.JSX.Element {
  const pathname = usePathname();
  const {
    empresaAtual,
    empresas,
    codEmpresaAtual,
    carregando: carregandoEmpresa,
    trocarEmpresa,
  } = useEmpresa();
  const [mostrarEmpresas, setMostrarEmpresas] = useState(false);
  const [mostrarUsuario, setMostrarUsuario] = useState(false);
  const [usuario] = useState<Usuario | null>(() =>
    servicoAutenticacao.obterUsuarioAtual()
  );

  const handleLogout = async (): Promise<void> => {
    try {
      await servicoAutenticacao.fazerLogout();
      window.location.href = "/login";
    } catch (erro) {
      logger.error("Erro ao fazer logout", erro);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isItemActive = (itemHref: string) =>
    pathname === itemHref || pathname.startsWith(itemHref + "/");

  const isParentActive = (d: (typeof DASHBOARDS)[0]) =>
    isActive(d.href) || (d.itens?.some((i) => isItemActive(i.href)) ?? false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-[72px] flex-shrink-0 bg-highsoft-primario flex flex-col items-center py-4 gap-1">
        <div className="mb-4 px-2 w-full flex justify-center">
          <Image
            src="/logo.png"
            alt="HighSoft"
            width={120}
            height={40}
            className="max-w-full h-10 w-auto object-contain brightness-0 invert opacity-95"
            unoptimized
          />
        </div>
        {DASHBOARDS.map((d) => {
          const Icon = d.icone;
          const ativo = isParentActive(d);
          const temSubmenu = d.itens && d.itens.length > 0;

          if (temSubmenu) {
            return (
              <div
                key={d.id}
                className="relative group before:content-[''] before:absolute before:left-full before:top-0 before:w-52 before:h-11 before:z-20"
              >
                <Link
                  href={d.href}
                  title={d.titulo}
                  className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
                    ativo
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
                <div className="absolute left-full top-0 ml-1 min-w-[13rem] w-52 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-30 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  {d.itens!.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 text-sm hover:bg-slate-50 ${
                        isItemActive(item.href)
                          ? "text-highsoft-primario font-medium"
                          : "text-slate-700"
                      }`}
                    >
                      {item.titulo}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={d.id}
              href={d.href}
              title={d.titulo}
              className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${
                ativo
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setMostrarEmpresas(!mostrarEmpresas)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition min-w-[200px] text-left"
              >
                {carregandoEmpresa ? (
                  <span className="text-sm text-slate-500">Carregando...</span>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {empresaAtual
                        ? `${empresaAtual.COD_EMPRESA} - ${
                            empresaAtual.FAN_EMPRESA || empresaAtual.NOM_EMPRESA
                          }`
                        : "Selecione a empresa"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 flex-shrink-0 transition ${
                        mostrarEmpresas ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>
              {mostrarEmpresas && empresas.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMostrarEmpresas(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 max-h-64 overflow-y-auto">
                    {empresas.map((emp) => (
                      <button
                        key={emp.COD_EMPRESA}
                        onClick={() => {
                          trocarEmpresa(emp.COD_EMPRESA);
                          setMostrarEmpresas(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${
                          codEmpresaAtual === emp.COD_EMPRESA
                            ? "bg-slate-50 font-medium text-highsoft-primario"
                            : "text-slate-700"
                        }`}
                      >
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {emp.COD_EMPRESA} -{" "}
                          {emp.FAN_EMPRESA || emp.NOM_EMPRESA}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setMostrarUsuario(!mostrarUsuario)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate hidden sm:inline">
                  {usuario?.nome || "Usuário"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition ${
                    mostrarUsuario ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mostrarUsuario && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMostrarUsuario(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Logado como</p>
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {usuario?.nome || usuario?.login}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
