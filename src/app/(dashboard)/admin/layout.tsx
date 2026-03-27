import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
