"use client"

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getClients, createClient, updateClient, deleteClient } from '@/app/actions/budget';
import { Plus, User, Mail, Phone, Edit2, Trash2, ArrowRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    documento: '',
    email: '',
    phone: ''
  });

  const loadClients = async () => {
    const data = await getClients();
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingId) {
      res = await updateClient(editingId, formData);
    } else {
      res = await createClient(formData);
    }

    if (res.success) {
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', documento: '', email: '', phone: '' });
      loadClients();
    }
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      documento: client.documento || '',
      email: client.email || '',
      phone: client.phone || ''
    });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const res = await deleteClient(id);
      if (res.success) {
        loadClients();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.documento && c.documento.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase">
              Gestão de <span className="text-indigo-600">Clientes</span>
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">Cadastre e organize sua base de contatos</p>
          </div>
          
          <button 
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', documento: '', email: '', phone: '' });
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {showForm ? <Plus className="rotate-45 transition-transform" /> : <Plus />}
            {showForm ? 'Fechar Formulário' : 'Novo Cliente'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <InputField label="Nome Completo" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: João Silva" icon={<User size={16}/>} required />
                  <InputField label="CPF / CNPJ (Opcional)" name="documento" value={formData.documento} onChange={handleInputChange} placeholder="000.000.000-00" icon={<Search size={16}/>} />
                </div>

                <div className="space-y-4">
                  <InputField label="E-mail" name="email" value={formData.email} onChange={handleInputChange} placeholder="exemplo@email.com" icon={<Mail size={16}/>} type="email" />
                </div>

                <div className="space-y-4">
                  <InputField label="Telefone / WhatsApp" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" icon={<Phone size={16}/>} />
                </div>

                <div className="md:col-span-3 flex justify-end pt-4">
                  <button type="submit" className="bg-zinc-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center gap-2">
                    {editingId ? 'Atualizar Cliente' : 'Salvar Cliente'} <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Contato</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cadastrado em</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400 italic">
                        <User size={40} className="mb-2 opacity-20" />
                        <p>Nenhum cliente encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black italic">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-zinc-800 dark:text-zinc-100 tracking-tight uppercase italic">{c.name}</span>
                            {c.documento && <span className="text-[10px] text-zinc-400 font-bold">{c.documento}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          {c.email && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold lowercase">
                              <Mail size={12} className="text-zinc-300" />
                              {c.email}
                            </div>
                          )}
                          {c.phone && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold">
                              <Phone size={12} className="text-zinc-300" />
                              {c.phone}
                            </div>
                          )}
                          {!c.email && !c.phone && <span className="text-zinc-300 italic text-xs">Sem contato</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(c)}
                            className="p-2 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-600 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-600 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, placeholder, icon, type = "text", required = false }: any) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 ${icon ? 'pl-11' : 'px-4'} rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white transition-all`}
      />
    </div>
  </div>
);
