"use client"

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Calculator, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Share2, 
  ArrowRight,
  Layers,
  Scissors
} from "lucide-react";
import Header from "@/components/Header";

export default function LandingPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const heroTitle = settings?.heroTitle || 'ORÇAMENTOS ULTRA PRECISOS';
  const heroSubtitle = settings?.heroSubtitle || 'A plataforma definitiva para gerenciar sua produção. Cálculos cirúrgicos para Impressão 3D e Laser em segundos.';
  const heroBadge = settings?.heroBadge || 'O futuro da manufatura chegou';
  const footerText = settings?.footerText || 'Antigravity Budget System. Premium Version.';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black selection:bg-indigo-500 selection:text-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap size={14} />
            <span>{heroBadge}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter italic mb-6 leading-tight uppercase"
          >
            {heroTitle.split(' ').map((word: string, i: number) => (
              <React.Fragment key={i}>
                {i === 1 ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-white block">
                    {word}
                  </span>
                ) : word}{' '}
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/orcamento" 
              className="group relative px-8 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 -z-10" />
              <span className="flex items-center gap-2">
                Começar Orçamento <ArrowRight size={20} />
              </span>
            </Link>
            
            <Link 
              href="/historico" 
              className="px-8 py-5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-lg transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Ver Histórico
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<Layers className="text-indigo-500" />}
              title="Impressão 3D"
              description="Cálculo detalhado de peso, tempo e custos de energia. Suporte completo para FDM, SLA e outros."
            />
            <FeatureCard 
              icon={<Scissors className="text-indigo-500" />}
              title="Corte & Gravação Laser"
              description="Precisão extrema para serviços a laser, com suporte a materiais fornecidos ou próprios."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-indigo-500" />}
              title="Margem Inteligente"
              description="Algoritmo que sugere a margem ideal para garantir seu lucro sem perder a competitividade."
            />
            <FeatureCard 
              icon={<FileText className="text-indigo-500" />}
              title="PDF Profissional"
              description="Gere PDFs impecáveis com sua logo e QR Code de visualização rápida para o seu cliente."
            />
            <FeatureCard 
              icon={<Share2 className="text-indigo-500" />}
              title="Compartilhamento"
              description="Envie orçamentos via WhatsApp com um link direto e elegante para a web."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-indigo-500" />}
              title="Gestão Blindada"
              description="Controle total sobre seu estoque de materiais, máquinas e base de clientes."
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} {footerText}
          </p>
          <div className="flex gap-8 text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
            <Link href="/clientes" className="hover:text-indigo-500 transition-colors">Clientes</Link>
            <Link href="/materiais" className="hover:text-indigo-500 transition-colors">Materiais</Link>
            <Link href="/maquinas" className="hover:text-indigo-500 transition-colors">Máquinas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group"
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 italic tracking-tight">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}
