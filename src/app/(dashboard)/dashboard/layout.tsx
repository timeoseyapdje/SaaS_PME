import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin";

export default async function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const email = session?.user?.email;

  // Rediriger le super admin vers le dashboard admin
  if (role === "ADMIN" && email === SUPER_ADMIN_EMAIL) {
    redirect("/admin");
  }

  return <>{children}</>;
}
