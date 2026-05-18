import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, SUPER_ADMIN_EMAIL } from "@/lib/admin";

// PATCH - Modifier le rôle d'un utilisateur (Super Admin uniquement)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await request.json();
  const { role } = body;

  if (!role || !["ADMIN", "ACCOUNTANT", "VIEWER"].includes(role)) {
    return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
  }

  // Vérifier que l'utilisateur cible existe
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Empêcher de modifier le rôle du Super Admin lui-même
  if (targetUser.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Impossible de modifier le rôle du Super Admin" }, { status: 403 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

// DELETE - Supprimer un utilisateur (Super Admin uniquement)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireSuperAdmin();
  if (error) return error;

  // Vérifier que l'utilisateur cible existe
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { email: true, name: true, companyId: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  }

  // Empêcher de supprimer le Super Admin
  if (targetUser.email === SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Impossible de supprimer le Super Admin" }, { status: 403 });
  }

  // Supprimer les usages de codes promo liés à cet utilisateur
  await prisma.promoCodeUsage.deleteMany({
    where: { userId: id },
  });

  // Supprimer l'utilisateur (Account, Session, Notification supprimés en cascade)
  await prisma.user.delete({
    where: { id },
  });

  // Si l'utilisateur avait une entreprise, vérifier si elle est vide
  let companyDeleted = false;
  if (targetUser.companyId) {
    const remainingUsers = await prisma.user.count({
      where: { companyId: targetUser.companyId },
    });

    if (remainingUsers === 0) {
      // Supprimer toutes les données liées à l'entreprise
      await prisma.$transaction([
        prisma.invoiceItem.deleteMany({ where: { invoice: { companyId: targetUser.companyId } } }),
        prisma.invoice.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.orderItem.deleteMany({ where: { order: { companyId: targetUser.companyId } } }),
        prisma.stockMovement.deleteMany({ where: { product: { companyId: targetUser.companyId } } }),
        prisma.order.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.product.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.category.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.paymentLinkTransaction.deleteMany({ where: { paymentLink: { companyId: targetUser.companyId } } }),
        prisma.paymentLink.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.expense.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.revenue.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.client.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.supplier.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.bankAccount.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.taxDeclaration.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.payment.deleteMany({ where: { subscription: { companyId: targetUser.companyId } } }),
        prisma.subscription.deleteMany({ where: { companyId: targetUser.companyId } }),
        prisma.company.delete({ where: { id: targetUser.companyId } }),
      ]);
      companyDeleted = true;
    }
  }

  return NextResponse.json({
    success: true,
    message: `Utilisateur "${targetUser.name || targetUser.email}" supprimé`,
    companyDeleted,
  });
}
