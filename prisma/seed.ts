import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("demo123456", 12);

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: "demo-company-001" },
    update: {},
    create: {
      id: "demo-company-001",
      name: "TechSarl Cameroun",
      legalName: "TechSarl SARL",
      registrationNo: "RC/YAO/2020/B/1234",
      taxId: "M012345678901A",
      address: "Quartier Bonanjo, Rue de la Joie",
      city: "Douala",
      phone: "+237 699 000 000",
      email: "contact@techsarl.cm",
      website: "https://www.techsarl.cm",
      currency: "XAF",
      bankAccounts: {
        create: [
          {
            name: "Compte SGC Principal",
            type: "COMPTE_COURANT",
            bankName: "Société Générale Cameroun",
            balance: 15000000,
            isDefault: true,
          },
          {
            name: "Caisse principale",
            type: "CAISSE",
            balance: 500000,
          },
          {
            name: "MTN Mobile Money",
            type: "MTN_MONEY",
            balance: 250000,
          },
          {
            name: "Orange Money",
            type: "ORANGE_MONEY",
            balance: 150000,
          },
        ],
      },
    },
  });

  console.log(`Company created: ${company.name}`);

  // Create demo admin user
  const user = await prisma.user.upsert({
    where: { email: "demo@nkapcontrol.cm" },
    update: {},
    create: {
      email: "demo@nkapcontrol.cm",
      name: "Utilisateur Démo",
      password: hashedPassword,
      role: "VIEWER",
      companyId: company.id,
    },
  });

  console.log(`User created: ${user.email}`);

  // Create demo clients
  const client1 = await prisma.client.upsert({
    where: { id: "client-demo-001" },
    update: {},
    create: {
      id: "client-demo-001",
      companyId: company.id,
      name: "Ministère des Finances",
      email: "contact@minfi.gov.cm",
      phone: "+237 222 234 000",
      city: "Douala",
      type: "ADMINISTRATION",
      taxId: "A000000001",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "client-demo-002" },
    update: {},
    create: {
      id: "client-demo-002",
      companyId: company.id,
      name: "MTN Cameroun SA",
      email: "procurement@mtn.cm",
      phone: "+237 679 000 000",
      city: "Douala",
      type: "ENTREPRISE",
    },
  });

  const client3 = await prisma.client.upsert({
    where: { id: "client-demo-003" },
    update: {},
    create: {
      id: "client-demo-003",
      companyId: company.id,
      name: "Orange Cameroun SA",
      email: "achats@orange.cm",
      phone: "+237 655 000 000",
      city: "Douala",
      type: "ENTREPRISE",
    },
  });

  console.log("Clients created");

  // Create demo suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: "supplier-demo-001" },
    update: {},
    create: {
      id: "supplier-demo-001",
      companyId: company.id,
      name: "Bureau Plus Yaoundé",
      phone: "+237 699 111 111",
      city: "Douala",
      type: "ENTREPRISE",
    },
  });

  console.log("Suppliers created");

  // Create demo invoices
  await prisma.invoice.upsert({
    where: { id: "invoice-demo-001" },
    update: {},
    create: {
      id: "invoice-demo-001",
      companyId: company.id,
      clientId: client1.id,
      number: "FAC-2024-0001",
      status: "PAID",
      dueDate: new Date("2024-11-30"),
      paidAt: new Date("2024-11-25"),
      subtotal: 5000000,
      tvaAmount: 962500,
      total: 5962500,
      applyTVA: true,
      items: {
        create: [
          {
            description: "Développement application web de gestion",
            quantity: 1,
            unitPrice: 5000000,
            total: 5000000,
          },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { id: "invoice-demo-002" },
    update: {},
    create: {
      id: "invoice-demo-002",
      companyId: company.id,
      clientId: client2.id,
      number: "FAC-2024-0002",
      status: "SENT",
      dueDate: new Date("2025-01-15"),
      subtotal: 2500000,
      tvaAmount: 481250,
      total: 2981250,
      applyTVA: true,
      items: {
        create: [
          {
            description: "Formation équipe technique - Module React",
            quantity: 2,
            unitPrice: 1000000,
            total: 2000000,
          },
          {
            description: "Documentation technique",
            quantity: 1,
            unitPrice: 500000,
            total: 500000,
          },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { id: "invoice-demo-003" },
    update: {},
    create: {
      id: "invoice-demo-003",
      companyId: company.id,
      clientId: client3.id,
      number: "FAC-2025-0001",
      status: "DRAFT",
      dueDate: new Date("2025-02-28"),
      subtotal: 1800000,
      tvaAmount: 346500,
      total: 2146500,
      applyTVA: true,
      items: {
        create: [
          {
            description: "Maintenance applicative mensuelle",
            quantity: 3,
            unitPrice: 600000,
            total: 1800000,
          },
        ],
      },
    },
  });

  console.log("Invoices created");

  // Create demo expenses
  const now = new Date();
  const expenses = [
    {
      category: "SALAIRES" as const,
      description: "Salaires employés - Décembre 2024",
      amount: 2500000,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 28),
      paymentMethod: "VIREMENT" as const,
    },
    {
      category: "LOYER" as const,
      description: "Loyer bureau Bastos",
      amount: 500000,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      paymentMethod: "VIREMENT" as const,
      isRecurring: true,
    },
    {
      category: "COMMUNICATION" as const,
      description: "Abonnement internet fibre optique",
      amount: 75000,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      paymentMethod: "VIREMENT" as const,
      isRecurring: true,
    },
    {
      category: "FOURNITURES" as const,
      description: "Fournitures de bureau - Papier, stylos, etc.",
      amount: 45000,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      paymentMethod: "ESPECES" as const,
      supplierId: supplier1.id,
    },
    {
      category: "TRANSPORT" as const,
      description: "Carburant véhicule commercial",
      amount: 120000,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      paymentMethod: "ESPECES" as const,
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        companyId: company.id,
        ...expense,
      },
    });
  }

  console.log("Expenses created");

  // Create demo revenues
  const revenues = [
    {
      category: "PRESTATIONS_SERVICES" as const,
      description: "Prestation consulting stratégie digitale",
      amount: 750000,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      paymentMethod: "MTN_MONEY" as const,
    },
    {
      category: "VENTES_PRODUITS" as const,
      description: "Vente licence logiciel PME",
      amount: 350000,
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      paymentMethod: "VIREMENT" as const,
    },
  ];

  for (const revenue of revenues) {
    await prisma.revenue.create({
      data: {
        companyId: company.id,
        ...revenue,
      },
    });
  }

  console.log("Revenues created");
  console.log("\nSeed completed successfully!");
  console.log("Demo credentials:");
  console.log("  Email: demo@nkapcontrol.cm");
  console.log("  Password: demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
