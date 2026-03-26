import { Header } from "@/components/layout/Header";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <Header
        title="Nouvelle facture"
        subtitle="Créez une facture pour votre client"
      />
      <div className="p-6">
        <InvoiceForm />
      </div>
    </div>
  );
}
