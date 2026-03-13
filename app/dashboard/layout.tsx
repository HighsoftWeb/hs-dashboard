"use client";

import { EmpresaProvider } from "@/core/context/empresa-context";
import { LayoutDashboard } from "@/core/layouts/layout-dashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmpresaProvider>
      <LayoutDashboard>{children}</LayoutDashboard>
    </EmpresaProvider>
  );
}
