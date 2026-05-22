import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: companyId } = await params;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    // 1. Payout (dépend de PaymentLinkTransaction et BankAccount)
    await tx.payout.deleteMany({ where: { companyId } });

    // 2. PaymentLinkTransaction (dépend de PaymentLink)
    await tx.paymentLinkTransaction.deleteMany({
      where: { paymentLink: { companyId } },
    });

    // 3. Payment (dépend de Subscription)
    await tx.payment.deleteMany({
      where: { subscription: { companyId } },
    });

    // 4. InvoiceItem (dépend de Invoice)
    await tx.invoiceItem.deleteMany({
      where: { invoice: { companyId } },
    });

    // 5. OrderItem (dépend de Order)
    await tx.orderItem.deleteMany({
      where: { order: { companyId } },
    });

    // 6. StockMovement (dépend de Product)
    await tx.stockMovement.deleteMany({
      where: { product: { companyId } },
    });

    // 7. Entités directes level 2
    await tx.paymentLink.deleteMany({ where: { companyId } });
    await tx.invoice.deleteMany({ where: { companyId } });
    await tx.order.deleteMany({ where: { companyId } });
    await tx.subscription.deleteMany({ where: { companyId } });
    await tx.expense.deleteMany({ where: { companyId } });
    await tx.revenue.deleteMany({ where: { companyId } });
    await tx.taxDeclaration.deleteMany({ where: { companyId } });
    await tx.bankAccount.deleteMany({ where: { companyId } });

    // 8. Entités directes level 3
    await tx.client.deleteMany({ where: { companyId } });
    await tx.supplier.deleteMany({ where: { companyId } });
    await tx.product.deleteMany({ where: { companyId } });
    await tx.category.deleteMany({ where: { companyId } });

    // 9. Détacher les utilisateurs (on ne les supprime pas)
    await tx.user.updateMany({
      where: { companyId },
      data: { companyId: null, positionId: null },
    });

    // 10. Supprimer l'entreprise (Position et AdmissionRequest ont onDelete: Cascade)
    await tx.company.delete({ where: { id: companyId } });
  });

  return NextResponse.json({ success: true });
}
