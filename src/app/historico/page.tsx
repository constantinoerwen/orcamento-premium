import { getBudgetHistory } from "@/app/actions/budget";
import { formatBRL } from "@/lib/currency";
import { ArrowLeft, Calendar, User, Package, DollarSign, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import DeleteBudgetButton from "@/components/DeleteBudgetButton";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const history = await getBudgetHistory();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-colors text-sm font-bold uppercase tracking-widest mb-4">
            <ArrowLeft size={16} />
            Voltar para o Dashboard
          </Link>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic">
            HISTÓRICO DE <span className="text-indigo-600">ORÇAMENTOS</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Peça</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Produção</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Valor Final</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Lucro</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400 italic">
                        <Package size={40} className="mb-2 opacity-20" />
                        <p>Nenhum orçamento encontrado.</p>
                        <p className="text-xs">Gere um orçamento no dashboard e clique em PDF para salvar aqui.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  history.map((budget) => (
                    <tr key={budget.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                          <Calendar size={14} className="text-zinc-300" />
                          <span className="text-xs font-bold">{new Date(budget.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 italic">
                          <User size={14} className="text-zinc-300" />
                          <span className="text-sm font-medium">{budget.cliente.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                            <Package size={18} />
                          </div>
                          <span className="font-black text-zinc-800 dark:text-zinc-100 tracking-tight text-lg">{budget.nomePeca}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Peso</span>
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic">{budget.pesoG}g</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Tempo</span>
                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic">{budget.tempoH}h {budget.tempoM}m</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xl font-black text-zinc-900 dark:text-indigo-400 italic">
                          R$ {formatBRL(budget.precoFinal)}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                          <DollarSign size={14} />
                          <span className="text-sm font-black">R$ {formatBRL(budget.lucro)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right flex items-center justify-end gap-2">
                        <Link href={`/orcamento/${budget.id}`} title="Ver Detalhes" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-block hover:scale-110 transition-transform">
                          <ArrowUpRight size={16} className="text-zinc-400" />
                        </Link>
                        <DeleteBudgetButton id={budget.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
