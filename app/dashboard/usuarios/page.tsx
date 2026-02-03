"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";
import { servicoUsuario } from "@/core/domains/cadastros/services/servico-usuario";
import { Usuario } from "@/core/tipos";
import { Botao } from "@/core/componentes/botao/botao";

export default function PaginaUsuarios(): React.JSX.Element {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async (): Promise<void> => {
    try {
      setCarregando(true);
      setErro("");
      const listaUsuarios = await servicoUsuario.listarUsuarios();
      setUsuarios(listaUsuarios);
    } catch (erroCarregar) {
      setErro(
        erroCarregar instanceof Error
          ? erroCarregar.message
          : "Erro ao carregar usuários"
      );
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <LayoutDashboard>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="mt-2 text-gray-600">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Botao variante="primario">Novo Usuário</Botao>
        </div>
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <p className="text-sm text-red-800">{erro}</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.codUsuario}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usuario.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.login}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          usuario.codGrupoUsuario !== null
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {usuario.codGrupoUsuario !== null ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#094A73] hover:text-[#073a5c]">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutDashboard>
  );
}
