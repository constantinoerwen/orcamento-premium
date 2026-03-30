'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, LogOut, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const Header = () => {
  const pathname = usePathname();
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Buscar sessão e configurações via server actions vira fetch
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.user) setSession(data.user);
    }).catch(() => {});

    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data) setSettings(data);
    }).catch(() => {});
  }, []);

  const companyName = settings?.companyName || 'PremiumBudget';
  const menuLabels = settings?.menuLabels || {};

  const navItems = [
    { name: menuLabels.orcamento || 'Novo Orçamento', href: '/orcamento' },
    { name: menuLabels.dashboard || 'Dashboard', href: '/dashboard', adminOnly: true },
    { name: menuLabels.materiais || 'Materiais', href: '/materiais' },
    { name: menuLabels.maquinas || 'Máquinas', href: '/maquinas' },
    { name: menuLabels.clientes || 'Clientes', href: '/clientes' },
    { name: menuLabels.configuracoes || 'Configurações', href: '/configuracoes', adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item =>
    !item.adminOnly || session?.role === 'admin'
  );

  const firstWord = companyName.split(' ')[0];
  const restWords = companyName.split(' ').slice(1).join(' ');

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <TrendingUp size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic dark:text-white">
            {firstWord}<span className="text-indigo-600 font-black">{restWords}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-indigo-600'}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session && (
            <>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {session.name.split(' ')[0]}
                </span>
                {session.role === 'admin' && (
                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Admin
                  </span>
                )}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  title="Sair"
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
