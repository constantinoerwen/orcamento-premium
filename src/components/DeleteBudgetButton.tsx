"use client"

import { useState } from 'react';
import { deleteBudget } from '@/app/actions/budget';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function DeleteBudgetButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja apagar este orçamento?")) {
      setLoading(true);
      const res = await deleteBudget(id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Erro ao apagar orçamento.");
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-xl inline-block hover:scale-110 transition-transform disabled:opacity-50"
      title="Apagar Orçamento"
    >
      <Trash2 size={16} />
    </button>
  );
}
