"use client"

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/app/actions/budget';
import { formatBRL } from '@/lib/currency';
import { Plus, Package, Calendar, Tag, Info, DollarSign, Database, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    marca: '',
    tipo: 'PLA',
    linha: 'Premium',
    cor: '',
    precoKg: '',
    precoCompra: '',
    estoqueG: '',
    dataCompra: new Date().toISOString().split('T')[0]
  });

  const loadMaterials = async () => {
    const data = await getMaterials();
    setMaterials(data);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingId) {
      res = await updateMaterial(editingId, formData);
    } else {
      res = await createMaterial(formData);
    }

    if (res.success) {
      setShowForm(false);
      setEditingId(null);
      setFormData({
        marca: '',
        tipo: 'PLA',
        linha: 'Premium',
        cor: '',
        precoKg: '',
        precoCompra: '',
        estoqueG: '',
        dataCompra: new Date().toISOString().split('T')[0]
      });
      loadMaterials();
    }
  };

  const handleEdit = (m: any) => {
    setFormData({
      marca: m.marca || '',
      tipo: m.tipo || 'PLA',
      linha: m.linha || '',
      cor: m.cor || '',
      precoKg: m.precoKg.toString(),
      precoCompra: m.precoCompra ? m.precoCompra.toString() : '',
      estoqueG: m.estoqueG ? m.estoqueG.toString() : '0',
      dataCompra: m.dataCompra ? new Date(m.dataCompra).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      const res = await deleteMaterial(id);
      if (res.success) {
        loadMaterials();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-indigo-500 selection:text-white font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase">
              Gestão de <span className="text-indigo-600">Materiais</span>
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">Controle total do seu estoque de filamentos e insumos</p>
          </div>
          
          <button 
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  marca: '',
                  tipo: 'PLA',
                  linha: 'Premium',
                  cor: '',
                  precoKg: '',
                  precoCompra: '',
                  estoqueG: '',
                  dataCompra: new Date().toISOString().split('T')[0]
                });
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {showForm ? <Plus className="rotate-45 transition-transform" /> : <Plus />}
            {showForm ? 'Fechar Formulário' : 'Novo Material'}
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
                  <InputField label="Marca" name="marca" value={formData.marca} onChange={handleInputChange} placeholder="Ex: Voolt3D" icon={<Tag size={16}/>} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white uppercase transition-all">
                      <option value="PLA">PLA</option>
                      <option value="ABS">ABS</option>
                      <option value="PETG">PETG</option>
                      <option value="TPU">TPU</option>
                      <option value="OUTRO">OUTRO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <InputField label="Linha" name="linha" value={formData.linha} onChange={handleInputChange} placeholder="Ex: Premium / Silk" icon={<Package size={16}/>} />
                  <InputField label="Cor" name="cor" value={formData.cor} onChange={handleInputChange} placeholder="Ex: Branco / Mármore" icon={<Info size={16}/>} />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Preço Compra (R$)" name="precoCompra" value={formData.precoCompra} onChange={handleInputChange} placeholder="0.00" icon={<DollarSign size={16}/>} type="number" />
                    <InputField label="Estoque Atual (g)" name="estoqueG" value={formData.estoqueG} onChange={handleInputChange} placeholder="Ex: 1000" icon={<Database size={16}/>} type="number" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Preço/kg (R$)" name="precoKg" value={formData.precoKg} onChange={handleInputChange} placeholder="0.00" icon={<DollarSign size={16}/>} type="number" />
                    <InputField label="Data da Compra" name="dataCompra" value={formData.dataCompra} onChange={handleInputChange} type="date" icon={<Calendar size={16}/>} />
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-end pt-4">
                  <button type="submit" className="bg-zinc-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center gap-2">
                    {editingId ? 'Atualizar Material' : 'Salvar no Estoque'} <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Marca</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tipo / Linha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Cor</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Preço Compra</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Preço/kg</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Estoque</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400 italic">
                        <Package size={40} className="mb-2 opacity-20" />
                        <p>Nenhum material cadastrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  materials.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-bold text-xs uppercase">
                          <Calendar size={14} className="text-zinc-300" />
                          {m.dataCompra ? new Date(m.dataCompra).toLocaleDateString('pt-BR') : '---'}
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black text-zinc-800 dark:text-zinc-100 tracking-tight italic uppercase">
                        {m.marca}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{m.tipo}</span>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">{m.linha}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                          {m.cor}
                        </span>
                      </td>
                      <td className="px-6 py-6 font-bold text-zinc-700 dark:text-zinc-300">
                         {m.precoCompra ? `R$ ${formatBRL(m.precoCompra)}` : '---'}
                      </td>
                      <td className="px-6 py-6">
                        <div className="px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit border border-indigo-500/20 text-sm font-black italic">
                          R$ {formatBRL(m.precoKg)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`px-4 py-2 rounded-2xl w-fit border text-sm font-black italic flex items-center gap-2 ${m.estoqueG < 100 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                          <Database size={14} />
                          {m.estoqueG}g
                          {m.estoqueG < 100 && <span className="ml-1 text-[8px] uppercase not-italic animate-pulse">Crítico!</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(m)}
                            className="p-2 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-600 rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(m.id)}
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

const InputField = ({ label, name, value, onChange, placeholder, icon, type = "text" }: any) => (
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
        className={`w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 ${icon ? 'pl-11' : 'px-4'} rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white transition-all`}
      />
    </div>
  </div>
);
