import { getBudgetById } from "@/app/actions/budget";
import { formatBRL } from "@/lib/currency";
import Header from "@/components/Header";

export const dynamic = 'force-dynamic';

import { 
  FileText, 
  Download, 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  ArrowLeft,
  Package,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicBudgetPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const budget = await getBudgetById(id);

  if (!budget) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link 
              href="/orcamento" 
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors text-sm font-bold uppercase tracking-widest mb-4"
            >
              <ArrowLeft size={16} /> Voltar para Orçamento
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
              ORÇAMENTO <span className="text-indigo-600">#{budget.id.slice(-4).toUpperCase()}</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Documento gerado em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {budget.pdfBase64 && (
            <a 
              href={budget.pdfBase64} 
              download={`orcamento_${budget.nomePeca || 'producao'}.pdf`}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-all px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              <Download size={20} />
              BAIXAR PDF OFICIAL
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Item do Orçamento</h2>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white italic">{budget.nomePeca}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <InfoRow 
                  icon={<User size={18}/>} 
                  label="Cliente" 
                  value={budget.cliente?.name || "Cliente Padrão"} 
                />
                <InfoRow 
                  icon={<Clock size={18}/>} 
                  label="Tempo Estimado" 
                  value={`${budget.tempoH}h ${budget.tempoM}m`} 
                />
                <InfoRow 
                  icon={<Calendar size={18}/>} 
                  label="Prazo de Entrega" 
                  value={budget.prazoEntrega || "A combinar"} 
                />
                <InfoRow 
                  icon={<ShieldCheck size={18}/>} 
                  label="Tipo de Serviço" 
                  value={budget.tipoServico === 'LASER' ? "Corte/Gravação Laser" : "Impressão 3D"} 
                />
              </div>

              {budget.observacao && (
                <div className="mt-10 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Observações Adicionais</h3>
                  <p className="text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic">
                    "{budget.observacao}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Card */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <CheckCircle2 size={120} />
              </div>

              <div className="relative z-10">
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Valor Final</span>
                <div className="text-5xl font-black text-indigo-400 mt-2 mb-8">
                  R$ {formatBRL(budget.precoFinal)}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Status</span>
                    <span className="text-emerald-400 font-bold">Válido</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Garantia</span>
                    <span className="text-zinc-200 font-bold">Inclusa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                Este orçamento tem validade de 10 dias a partir da data de emissão.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-indigo-500 mt-0.5">{icon}</div>
      <div>
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</h3>
        <p className="text-zinc-900 dark:text-zinc-100 font-bold">{value}</p>
      </div>
    </div>
  );
}
