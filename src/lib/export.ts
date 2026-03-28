"use client";

import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { formatCurrency } from "@/lib/currency";

// ============================================================
// PDF Export - Facture
// ============================================================

interface InvoiceForPDF {
  number: string;
  issueDate: string | Date;
  dueDate: string | Date;
  status: string;
  currency: string;
  subtotal: number;
  tvaAmount: number;
  total: number;
  applyTVA: boolean;
  notes?: string | null;
  terms?: string | null;
  client?: { name: string; email?: string | null; phone?: string | null; address?: string | null; city?: string | null } | null;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  company?: { name: string; email?: string | null; phone?: string | null; city?: string | null; taxId?: string | null } | null;
}

export function exportInvoicePDF(invoice: InvoiceForPDF) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(59, 130, 246);
  doc.text(invoice.number, 20, 33);

  // Status
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Statut: ${invoice.status}`, pageWidth - 20, 25, { align: "right" });

  // Company info (top right)
  doc.setTextColor(0, 0, 0);
  if (invoice.company) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.company.name, pageWidth - 20, 35, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    let compY = 41;
    if (invoice.company.city) { doc.text(invoice.company.city, pageWidth - 20, compY, { align: "right" }); compY += 5; }
    if (invoice.company.phone) { doc.text(invoice.company.phone, pageWidth - 20, compY, { align: "right" }); compY += 5; }
    if (invoice.company.email) { doc.text(invoice.company.email, pageWidth - 20, compY, { align: "right" }); compY += 5; }
    if (invoice.company.taxId) { doc.text(`NIU: ${invoice.company.taxId}`, pageWidth - 20, compY, { align: "right" }); }
  }

  // Client info
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("FACTURÉ À", 20, 50);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.client?.name || "Client", 20, 57);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let clientY = 63;
  if (invoice.client?.email) { doc.text(invoice.client.email, 20, clientY); clientY += 5; }
  if (invoice.client?.phone) { doc.text(invoice.client.phone, 20, clientY); clientY += 5; }
  if (invoice.client?.city) { doc.text(invoice.client.city, 20, clientY); clientY += 5; }

  // Dates
  doc.setFontSize(9);
  doc.text(`Date d'émission: ${new Date(invoice.issueDate).toLocaleDateString("fr-FR")}`, 20, clientY + 3);
  doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString("fr-FR")}`, 20, clientY + 9);

  // Table header
  let tableY = clientY + 20;
  doc.setFillColor(243, 244, 246);
  doc.rect(20, tableY - 5, pageWidth - 40, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Description", 22, tableY);
  doc.text("Qté", 120, tableY, { align: "center" });
  doc.text("P.U. HT", 150, tableY, { align: "right" });
  doc.text("Total HT", pageWidth - 22, tableY, { align: "right" });

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  tableY += 8;

  for (const item of invoice.items) {
    doc.text(item.description.substring(0, 50), 22, tableY);
    doc.text(String(item.quantity), 120, tableY, { align: "center" });
    doc.text(formatCurrency(item.unitPrice, invoice.currency), 150, tableY, { align: "right" });
    doc.text(formatCurrency(item.total, invoice.currency), pageWidth - 22, tableY, { align: "right" });
    tableY += 7;

    // New page if needed
    if (tableY > 260) {
      doc.addPage();
      tableY = 20;
    }
  }

  // Separator
  tableY += 3;
  doc.setDrawColor(220, 220, 220);
  doc.line(100, tableY, pageWidth - 20, tableY);
  tableY += 8;

  // Totals
  doc.setFontSize(9);
  doc.text("Sous-total HT", 130, tableY);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), pageWidth - 22, tableY, { align: "right" });
  tableY += 7;

  if (invoice.applyTVA) {
    doc.text("TVA (19,25%)", 130, tableY);
    doc.text(formatCurrency(invoice.tvaAmount, invoice.currency), pageWidth - 22, tableY, { align: "right" });
    tableY += 7;
  }

  doc.setDrawColor(0, 0, 0);
  doc.line(130, tableY, pageWidth - 20, tableY);
  tableY += 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC", 130, tableY);
  doc.setTextColor(59, 130, 246);
  doc.text(formatCurrency(invoice.total, invoice.currency), pageWidth - 22, tableY, { align: "right" });

  // Notes
  if (invoice.notes || invoice.terms) {
    tableY += 15;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    if (invoice.notes) {
      doc.text("Notes:", 20, tableY);
      doc.text(invoice.notes.substring(0, 200), 20, tableY + 5);
      tableY += 15;
    }
    if (invoice.terms) {
      doc.text("Conditions:", 20, tableY);
      doc.text(invoice.terms.substring(0, 200), 20, tableY + 5);
    }
  }

  doc.save(`Facture_${invoice.number}.pdf`);
}

// ============================================================
// Excel Export - Tableau générique
// ============================================================

export function exportToExcel(data: Record<string, unknown>[], fileName: string, sheetName: string = "Données") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || "").length)
    );
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// ============================================================
// CSV Export
// ============================================================

export function exportToCSV(data: Record<string, unknown>[], fileName: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(";"),
    ...data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] || "");
        return val.includes(";") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(";")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// Helpers pour formater les données avant export
// ============================================================

export function formatInvoicesForExport(invoices: {
  number: string;
  status: string;
  client?: { name: string } | null;
  total: number;
  subtotal: number;
  tvaAmount: number;
  currency: string;
  issueDate: string | Date;
  dueDate: string | Date;
}[]) {
  return invoices.map((inv) => ({
    "N° Facture": inv.number,
    "Client": inv.client?.name || "—",
    "Statut": inv.status,
    "Sous-total HT": inv.subtotal,
    "TVA": inv.tvaAmount,
    "Total TTC": inv.total,
    "Devise": inv.currency,
    "Date émission": new Date(inv.issueDate).toLocaleDateString("fr-FR"),
    "Date échéance": new Date(inv.dueDate).toLocaleDateString("fr-FR"),
  }));
}

export function formatExpensesForExport(expenses: {
  description: string;
  category: string;
  amount: number;
  currency?: string;
  date: string | Date;
  paymentMethod: string;
  supplier?: { name: string } | null;
}[]) {
  return expenses.map((exp) => ({
    "Description": exp.description,
    "Catégorie": exp.category,
    "Montant": exp.amount,
    "Devise": exp.currency || "XAF",
    "Date": new Date(exp.date).toLocaleDateString("fr-FR"),
    "Mode paiement": exp.paymentMethod.replace("_", " "),
    "Fournisseur": exp.supplier?.name || "—",
  }));
}

export function formatRevenuesForExport(revenues: {
  description: string;
  category: string;
  amount: number;
  currency?: string;
  date: string | Date;
  paymentMethod: string;
}[]) {
  return revenues.map((rev) => ({
    "Description": rev.description,
    "Catégorie": rev.category,
    "Montant": rev.amount,
    "Devise": rev.currency || "XAF",
    "Date": new Date(rev.date).toLocaleDateString("fr-FR"),
    "Mode paiement": rev.paymentMethod.replace("_", " "),
  }));
}
