"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard as IconDashboard, 
  FileText, 
  TrendingUp, 
  DollarSign,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  LogOut
} from "lucide-react";
import { servicoAutenticacao } from "../domains/auth/client/auth-client";
import { Usuario } from "../tipos/usuario";
import { clienteHttp } from "../http/cliente-http";
import { logger } from "../utils/logger";

interface EmpresaAtual {
  COD_EMPRESA: number;
  NOM_EMPRESA: string;
  FAN_EMPRESA: string | null;
}

interface PropsLayoutDashboard {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  href?: string;
  icone?: React.ComponentType<{ className?: string }>;
  submenus?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icone: IconDashboard,
  },
  {
    label: "Cadastros",
    icone: FileText,
    submenus: [
      {
        label: "Gerais",
        submenus: [
          { label: "Usuários", href: "/dashboard/cadastros/gerais/usuarios" },
          { label: "Empresas", href: "/dashboard/cadastros/gerais/empresas" },
        ],
      },
      {
        label: "Comercial",
        submenus: [
          { label: "Clientes", href: "/dashboard/cadastros/comercial/clientes" },
          { label: "Produtos", href: "/dashboard/cadastros/comercial/produtos" },
        ],
      },
    ],
  },
  {
    label: "Comercial",
    icone: TrendingUp,
    submenus: [
      {
        label: "Saídas",
        submenus: [
          { label: "Orçamentos/OS", href: "/dashboard/cadastros/saidas/orcamentos-os" },
        ],
      },
    ],
  },
  {
    label: "Financeiro",
    icone: DollarSign,
    submenus: [
      { label: "Contas a Receber", href: "/dashboard/financeiro/contas-receber" },
      { label: "Contas a Pagar", href: "/dashboard/financeiro/contas-pagar" },
    ],
  },
];

export function LayoutDashboard({
  children,
}: PropsLayoutDashboard): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [empresaAtual, setEmpresaAtual] = useState<EmpresaAtual | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState<boolean>(true);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [submenuAberto, setSubmenuAberto] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async (): Promise<void> => {
      const usuarioAtual = servicoAutenticacao.obterUsuarioAtual();
      setUsuario(usuarioAtual);
      
      if (usuarioAtual?.codEmpresa) {
        try {
          const resposta = await clienteHttp.get<EmpresaAtual>(
            "/dashboard/empresa-atual"
          );
          
          if (resposta.success && resposta.data) {
            setEmpresaAtual(resposta.data);
          }
        } catch (erro) {
          logger.error("Erro ao carregar empresa atual", erro, {
            endpoint: "/dashboard/empresa-atual",
            method: "GET",
          });
        }
      }
      
      setCarregandoUsuario(false);
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (!target.closest("nav")) {
        setMenuAberto(null);
        setSubmenuAberto(null);
      }
    };

    if (menuAberto) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }

    return undefined;
  }, [menuAberto]);

  const handleLogout = async (): Promise<void> => {
    await servicoAutenticacao.fazerLogout();
    router.push("/login");
  };

  const isPathActive = (href?: string): boolean => {
    if (!href) return false;
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleMenu = (label: string): void => {
    if (menuAberto === label) {
      setMenuAberto(null);
      setSubmenuAberto(null);
    } else {
      setMenuAberto(label);
      setSubmenuAberto(null);
    }
  };

  const toggleSubmenu = (label: string): void => {
    if (submenuAberto === label) {
      setSubmenuAberto(null);
    } else {
      setSubmenuAberto(label);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="HighSoft Sistemas"
                  width={100}
                  height={50}
                  className="h-10 w-auto object-contain"
                  unoptimized
                />
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <nav className="flex items-center space-x-0.5 relative h-full">
                {menuItems.map((item) => {
                  const temSubmenus = item.submenus && item.submenus.length > 0;
                  const estaAberto = menuAberto === item.label;
                  const estaAtivo = isPathActive(item.href) || (temSubmenus && estaAberto);

                  return (
                    <div key={item.label} className="relative h-full flex items-center">
                      {temSubmenus ? (
                        <>
                          <button
                            onClick={() => toggleMenu(item.label)}
                            className={`
                              flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap h-full border-b-2
                              ${
                                estaAtivo
                                  ? "text-[#094A73] border-[#094A73] bg-[#094A73]/5"
                                  : "text-gray-600 hover:text-[#094A73] hover:bg-gray-50 border-transparent"
                              }
                            `}
                          >
                            {item.icone && <item.icone className="w-4 h-4" />}
                            <span>{item.label}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${estaAberto ? "rotate-180" : ""}`} />
                          </button>
                          {estaAberto && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-[200px]">
                              {item.submenus?.map((submenu) => {
                                const temSubSubmenus = submenu.submenus && submenu.submenus.length > 0;
                                const submenuEstaAberto = submenuAberto === submenu.label;
                                const submenuEstaAtivo = isPathActive(submenu.href) || (temSubSubmenus && submenuEstaAberto);

                                return (
                                  <div key={submenu.label} className="relative group">
                                    {temSubSubmenus ? (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSubmenu(submenu.label);
                                          }}
                                          className={`
                                            w-full flex items-center justify-between px-4 py-2 text-sm transition-colors
                                            ${submenuEstaAtivo ? "text-[#094A73] bg-[#094A73]/10" : "text-gray-700 hover:bg-gray-50"}
                                          `}
                                        >
                                          <span>{submenu.label}</span>
                                          <ChevronRight className={`w-4 h-4 transition-transform ${submenuEstaAberto ? "rotate-90" : ""}`} />
                                        </button>
                                        {submenuEstaAberto && (
                                          <div className="absolute left-full top-0 ml-0.5 bg-white border border-gray-200 rounded-md shadow-xl z-50 min-w-[180px]">
                                            {submenu.submenus?.map((subSubmenu) => {
                                              const subSubmenuEstaAtivo = isPathActive(subSubmenu.href);
                                              return (
                                                <a
                                                  key={subSubmenu.label}
                                                  href={subSubmenu.href}
                                                  onClick={() => {
                                                    setMenuAberto(null);
                                                    setSubmenuAberto(null);
                                                  }}
                                                  className={`
                                                    block px-4 py-2 text-sm transition-colors
                                                    ${subSubmenuEstaAtivo ? "text-[#094A73] bg-[#094A73]/10 font-medium" : "text-gray-700 hover:bg-gray-50"}
                                                  `}
                                                >
                                                  {subSubmenu.label}
                                                </a>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <a
                                        href={submenu.href}
                                        onClick={() => {
                                          setMenuAberto(null);
                                          setSubmenuAberto(null);
                                        }}
                                        className={`
                                          block px-4 py-2 text-sm transition-colors
                                          ${submenuEstaAtivo ? "text-[#094A73] bg-[#094A73]/10 font-medium" : "text-gray-700 hover:bg-gray-50"}
                                        `}
                                      >
                                        {submenu.label}
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <a
                          href={item.href}
                          onClick={() => {
                            setMenuAberto(null);
                            setSubmenuAberto(null);
                          }}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap h-full border-b-2
                            ${
                              estaAtivo
                                ? "text-[#094A73] border-[#094A73] bg-[#094A73]/5"
                                : "text-gray-600 hover:text-[#094A73] hover:bg-gray-50 border-transparent"
                            }
                          `}
                        >
                          {item.icone && <item.icone className="w-4 h-4" />}
                          <span>{item.label}</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {!carregandoUsuario && usuario && (
                <div className="hidden sm:flex items-center gap-2">
                  {empresaAtual && (
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-md border border-gray-200 shadow-sm h-9">
                      <div className="w-5 h-5 bg-[#094A73] rounded flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3 h-3 text-white" />
                      </div>
                      <div className="hidden md:flex flex-col min-w-0 justify-center">
                        <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                          Empresa
                        </span>
                        <span className="text-xs font-semibold text-gray-900 truncate leading-tight">
                          {empresaAtual.COD_EMPRESA} - {empresaAtual.FAN_EMPRESA || empresaAtual.NOM_EMPRESA}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-md border border-gray-200 shadow-sm h-9">
                    <div className="w-5 h-5 bg-[#094A73] rounded flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div className="hidden md:flex flex-col min-w-0 justify-center">
                      <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide leading-tight">
                        Usuário
                      </span>
                      <span className="text-xs font-semibold text-gray-900 truncate leading-tight">
                        {usuario.codUsuario} - {usuario.nome}
                      </span>
                    </div>
                    <div className="md:hidden">
                      <span className="text-xs font-semibold text-gray-900">
                        {usuario.nome}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {!carregandoUsuario && usuario && (
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-md border border-gray-200 shadow-sm hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 transition-colors h-9"
              >
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-900 hidden md:inline">
                  Sair
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
