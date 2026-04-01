'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getSettings, saveSettings, type AppSettingsData } from '@/app/actions/settings';
import { createUser } from '@/app/actions/auth';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { Settings, Save, User, Mail, Lock, Shield, CheckCircle2, ChevronDown, ChevronUp, Users, ImageIcon, X } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<AppSettingsData | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showUserForm, setShowUserForm] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('identity');

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  function handleChange(path: string, value: string | null) {
    setSettings(prev => {
      if (!prev) return prev;
      const parts = path.split('.');
      const updated = { ...prev };
      if (parts.length === 1) {
        (updated as any)[parts[0]] = value;
      } else {
        (updated as any)[parts[0]] = { ...(updated as any)[parts[0]], [parts[1]]: value };
      }
      return updated;
    });
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      handleChange('companyLogo', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleChange('companyLogo', null);
  };

  function handleSave() {
    if (!settings) return;
    startTransition(async () => {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUserMsg(null);
    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);
    if (result?.error) {
      setUserMsg({ type: 'err', text: result.error });
    } else {
      setUserMsg({ type: 'ok', text: 'Usuário criado com sucesso!' });
      (e.target as HTMLFormElement).reset();
    }
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Section = ({ id, title, icon, children }: { id: string; title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">{icon}</div>
          <span className="font-black text-zinc-900 dark:text-white italic uppercase tracking-tight">{title}</span>
        </div>
        {openSection === id ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
      </button>
      {openSection === id && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-5">
          {children}
        </motion.div>
      )}
    </div>
  );

  const Field = ({ label, path, placeholder, textarea }: { label: string; path: string; placeholder?: string; textarea?: boolean }) => {
    const parts = path.split('.');
    const value = parts.length === 1 ? (settings as any)[parts[0]] : (settings as any)[parts[0]]?.[parts[1]];
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        {textarea ? (
          <textarea
            value={value}
            onChange={e => handleChange(path, e.target.value)}
            rows={3}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl text-zinc-900 dark:text-white font-medium resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => handleChange(path, e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl text-zinc-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase">
              Configurações
            </h1>
            <p className="text-zinc-500 text-sm font-medium mt-1">
              Personalize textos, menus e usuários do sistema.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'}`}
          >
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? 'Salvo!' : isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <Section id="identity" title="Identidade da Empresa" icon={<Shield size={18} />}>
          <Field label="Nome da Empresa (exibido no menu)" path="companyName" placeholder="Ex: Minha Empresa" />
          <Field label="CNPJ (Opcional)" path="companyCnpj" placeholder="00.000.000/0001-00" />
          <Field label="Telefone (Opcional)" path="companyPhone" placeholder="(00) 00000-0000" />
          <Field label="Email (Opcional)" path="companyEmail" placeholder="contato@empresa.com" />
          <Field label="Texto do Rodapé" path="footerText" placeholder="Ex: Todos os direitos reservados." />
          
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Logo da Empresa</label>
            {settings.companyLogo ? (
              <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <img src={settings.companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded-xl" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">Logo carregada</p>
                  <p className="text-xs text-zinc-500">Será exibida no cabeçalho do PDF</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-indigo-400 transition-colors">
                <ImageIcon size={20} className="text-zinc-400" />
                <span className="text-sm text-zinc-500 font-medium">Clique para enviar a logo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </Section>

        <Section id="hero" title="Página Inicial (Hero)" icon={<Settings size={18} />}>
          <Field label="Badge / Chamada pequena" path="heroBadge" placeholder="Ex: O futuro chegou" />
          <Field label="Título Principal" path="heroTitle" placeholder="Ex: ORÇAMENTOS PRECISOS" />
          <Field label="Subtítulo / Descrição" path="heroSubtitle" placeholder="Ex: A plataforma definitiva..." textarea />
        </Section>

        <Section id="menus" title="Rótulos dos Menus" icon={<Settings size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Novo Orçamento" path="menuLabels.orcamento" />
            <Field label="Dashboard" path="menuLabels.dashboard" />
            <Field label="Materiais" path="menuLabels.materiais" />
            <Field label="Máquinas" path="menuLabels.maquinas" />
            <Field label="Clientes" path="menuLabels.clientes" />
            <Field label="Configurações" path="menuLabels.configuracoes" />
          </div>
        </Section>

        {/* Seção de Usuários */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowUserForm(!showUserForm)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500"><Users size={18} /></div>
              <span className="font-black text-zinc-900 dark:text-white italic uppercase tracking-tight">Criar Novo Usuário</span>
            </div>
            {showUserForm ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
          </button>

          {showUserForm && (
            <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleCreateUser} className="px-6 pb-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome</label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="name" required placeholder="Nome completo" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 pl-10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="email" type="email" required placeholder="usuario@empresa.com" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 pl-10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="password" type="password" required minLength={6} placeholder="••••••••" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 pl-10 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo de Acesso</label>
                <select name="role" className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white">
                  <option value="operador">Operador (acesso básico)</option>
                  <option value="admin">Administrador (acesso total)</option>
                </select>
              </div>
              {userMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-2xl text-sm font-medium ${userMsg.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {userMsg.type === 'ok' ? <CheckCircle2 size={16} /> : null}
                  {userMsg.text}
                </div>
              )}
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20">
                Criar Usuário
              </button>
            </motion.form>
          )}
        </div>
      </main>
    </div>
  );
}
