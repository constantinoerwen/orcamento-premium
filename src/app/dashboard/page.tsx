import { getBudgetHistory } from "@/app/actions/budget";
import { formatBRL } from "@/lib/currency";
import Header from "@/components/Header";

export const dynamic = 'force-dynamic';

import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Database, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import BudgetStatusToggle from "@/components/BudgetStatusToggle";
import DeleteBudgetButton from "@/components/DeleteBudgetButton";

export default async function DashboardPage() {
  const budgets = await getBudgetHistory();

  // Apenas orçamentos Aprovados entram nas estatísticas financeiras
  const approvedBudgets = budgets.filter(b => b.status === "APROVADO");

  // Cálculos Gerenciais (Sobre Aprovados)
  const totalReceita = approvedBudgets.reduce((acc, b) => acc + b.precoFinal, 0);
  const totalLucro = approvedBudgets.reduce((acc, b) => acc + b.lucro, 0);
  const totalImpostos = approvedBudgets.reduce((acc, b) => acc + (b.precoFinal * (b.impostoPercent / 100)), 0);
  
  // Reserva de Manutenção: 10% do custo operacional (máquina + energia)
  const totalManutencao = approvedBudgets.reduce((acc, b) => acc + ((b.custoMaquina + b.custoEnergia) * 0.1), 0);
  
  const totalPesoG = approvedBudgets.reduce((acc, b) => acc + b.pesoG, 0);
  const totalPecas = approvedBudgets.length;

  const cards = [
    {
      title: "Reserva de Impostos",
      value: totalImpostos,
      icon: <Zap size={24} />,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      description: "Valor acumulado para pagamento de impostos."
    },
    {
      title: "Reserva de Manutenção",
      value: totalManutencao,
      icon: <ShieldCheck size={24} />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      description: "Fundo sugerido para reparos e insumos da máquina."
    },
    {
      title: "Lucro Líquido Total",
      value: totalLucro,
      icon: <TrendingUp size={24} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "Valor que sobra após custos e impostos."
    },
    {
       title: "Faturamento Bruto",
       value: totalReceita,
       icon: <DollarSign size={24} />,
       color: "text-zinc-900 dark:text-white",
       bg: "bg-zinc-900/5 dark:bg-white/10",
       description: "Soma total de todos os orçamentos gerados."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase">
            Dashboard <span className="text-indigo-600">Gerencial</span>
          </h1>
          <p className="text-zinc-500 mt-1 font-medium italic">Visão financeira e operacional da sua produção</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group">
              <div className={`p-3 w-fit rounded-2xl ${card.bg} ${card.color} mb-6 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{card.title}</h3>
              <div className={`text-3xl font-black ${card.color} italic tracking-tighter`}>
                 R$ {formatBRL(card.value)}
              </div>
              <p className="text-zinc-400 text-[10px] mt-4 leading-relaxed font-medium">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Secondary Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                   <Database className="text-indigo-600" />
                   <h2 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100 italic">Estatísticas Físicas</h2>
                </div>
                
                <div className="space-y-6">
                  <StatRow label="Consumo de Material" value={`${(totalPesoG / 1000).toFixed(2)} kg`} />
                  <StatRow label="Total de Orçamentos" value={totalPecas.toString()} />
                  <StatRow label="Média por Orçamento" value={`R$ ${formatBRL(totalPecas > 0 ? totalReceita / totalPecas : 0)}`} />
                </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Briefcase size={80} />
              </div>
               <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Saúde do Negócio</h3>
               <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black text-indigo-400">{(totalLucro / totalReceita * 100 || 0).toFixed(1)}%</span>
                  <span className="text-zinc-500 mb-1 font-bold italic">Margem Média</span>
               </div>
               <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(totalLucro / totalReceita * 100 || 0, 100)}%` }}
                  />
               </div>
            </div>
          </div>

          {/* List of Recent Budgets Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100 italic">Últimos Orçamentos</h2>
                <Link href="/historico" className="text-xs font-bold text-indigo-600 hover:underline">Ver Histórico Completo</Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left">
                        <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Item</th>
                        <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Preço Final</th>
                        <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Residuo (Imposto)</th>
                        <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Ação</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                     {budgets.slice(0, 5).map((b) => (
                       <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-8 py-6 font-bold text-zinc-900 dark:text-zinc-100">{b.nomePeca}</td>
                          <td className="px-8 py-6 font-black text-indigo-600 italic">R$ {formatBRL(b.precoFinal)}</td>
                          <td className="px-8 py-6 text-zinc-500 font-medium text-sm">R$ {formatBRL(b.precoFinal * (b.impostoPercent / 100))}</td>
                          <td className="px-8 py-6">
                            <BudgetStatusToggle id={b.id} initialStatus={b.status} />
                          </td>
                          <td className="px-8 py-6 text-right flex items-center justify-end gap-2">
                             <Link href={`/orcamento/${b.id}`} title="Ver Detalhes" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-block hover:scale-110 transition-transform">
                                <ArrowUpRight size={16} className="text-zinc-400" />
                             </Link>
                             <DeleteBudgetButton id={b.id} />
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{label}</span>
      <span className="text-zinc-900 dark:text-zinc-100 font-black italic">{value}</span>
    </div>
  );
}
