import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  redirect("/admin/applicants");
}
