'use client';

import React, { useState, useTransition } from 'react';
import { login } from '@/app/actions/auth';
import { TrendingUp, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-purple-950/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-3xl mb-6 shadow-2xl shadow-indigo-600/40"
          >
            <TrendingUp size={32} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Acesso<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium mt-2">
            Entre com suas credenciais para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 pl-11 rounded-2xl text-white font-bold placeholder:font-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 p-4 pl-11 pr-12 rounded-2xl text-white font-bold placeholder:font-normal placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium"
              >
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.15em] py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800 text-center">
            <p className="text-zinc-600 text-xs font-medium">
              Primeiro acesso?{' '}
              <a href="/setup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                Configurar Sistema
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
