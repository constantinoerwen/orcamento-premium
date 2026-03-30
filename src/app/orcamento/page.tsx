import Header from "@/components/Header";
import BudgetForm from "@/components/BudgetForm";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
            ORÇAMENTOS <span className="text-indigo-600">INTELIGENTES</span>
          </h1>
          <p className="text-zinc-500 mt-2 max-w-xl">
            Sistema avançado de cálculo de custos para manufatura e impressão 3D. 
            Precisão cirúrgica em cada grama e minuto.
          </p>
        </div>

        <BudgetForm />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-zinc-400 text-sm">
            &copy; {new Date().getFullYear()} Antigravity Production System. Desenvolvido com precisão.
          </p>
        </div>
      </footer>
    </div>
  );
}
