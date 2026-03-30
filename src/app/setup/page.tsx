'use client';

import React, { useState, useTransition } from 'react';
import { setupAdmin } from '@/app/actions/auth';
import { TrendingUp, User, Mail, Lock, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SetupPage() {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await setupAdmin(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-black to-purple-950/30" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-600/40">
            <TrendingUp size={32} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Shield size={12} /> Primeiro Acesso
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
            Configuração Inicial
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">
            Crie sua conta de <span className="text-indigo-400 font-bold">Administrador</span> para começar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Seu Nome</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                name="name"
                type="text"
                required
                placeholder="Ex: Erwen Costa"
                className="w-full bg-zinc-800 border border-zinc-700 p-4 pl-11 rounded-2xl text-white font-bold placeholder:font-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@suaempresa.com"
                className="w-full bg-zinc-800 border border-zinc-700 p-4 pl-11 rounded-2xl text-white font-bold placeholder:font-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Senha <span className="text-zinc-600">(mínimo 6 caracteres)</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 p-4 pl-11 rounded-2xl text-white font-bold placeholder:font-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.15em] py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 mt-2"
          >
            {isPending ? 'Configurando...' : 'Criar Conta Admin → Entrar'}
          </button>

          <p className="text-center text-zinc-600 text-xs font-medium pt-2">
            Esta página desaparecerá após o primeiro cadastro.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
