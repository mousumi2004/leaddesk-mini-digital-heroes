import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  AuthorizationError,
  SESSION_COOKIE_NAME,
  verifyAdminSession,
} from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  let admin: { uid: string; email: string };

  try {
    admin = await verifyAdminSession(
      cookieStore.get(SESSION_COOKIE_NAME)?.value,
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/login");
    }
    throw error;
  }

  return <AdminDashboard adminEmail={admin.email} />;
}
