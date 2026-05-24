import { Header } from "@/components/layout/Header";
import { QuoteForm } from "@/components/quotes/QuoteForm";

export default function NewQuotePage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Nouveau devis" subtitle="Créez un devis pour votre client" />
      <main className="flex-1 p-4 md:p-6">
        <QuoteForm />
      </main>
    </div>
  );
}
