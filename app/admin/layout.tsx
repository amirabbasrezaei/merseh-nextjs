import AdminShell from "@/Components/Admin/Shell/AdminShell";
import { requireAdmin } from "@/server/utils/requireAdmin";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
