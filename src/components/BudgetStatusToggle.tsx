"use client"

import { useState } from 'react';
import { updateBudgetStatus } from '@/app/actions/budget';
import { useRouter } from 'next/navigation';

export default function BudgetStatusToggle({ id, initialStatus }: { id: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const newStatus = status === "PENDENTE" ? "APROVADO" : "PENDENTE";
    const res = await updateBudgetStatus(id, newStatus);
    if (res.success) {
      setStatus(newStatus);
      router.refresh();
    }
    setLoading(false);
  };

  const isApproved = status === "APROVADO";

  return (
    <button 
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isApproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
    >
      {loading ? '...' : status}
    </button>
  );
}
