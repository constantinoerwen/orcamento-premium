"use client"

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getMachines, createMachine, updateMachine, deleteMachine } from '@/app/actions/budget';
import { formatBRL } from '@/lib/currency';
import { Plus, Cpu, Calendar, Tag, Info, DollarSign, Database, ArrowRight, Zap, Target, Edit2, Trash2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MaquinasPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tipo: '3D', // 3D ou LASER
    marca: '',
    modelo: '',
    numeroSerie: '',
    dataAquisicao: new Date().toISOString().split('T')[0],
    precoAquisicao: '',
    custoMaquinaH: '',
    custoEnergiaH: '',
    consumoW: '' // Campo auxiliar para cálculo
  });

  const loadMachines = async () => {
    const data = await getMachines();
    setMachines(data);
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingId) {
      res = await updateMachine(editingId, formData);
    } else {
      res = await createMachine(formData);
    }

    if (res.success) {
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        tipo: '3D',
        marca: '',
        modelo: '',
        numeroSerie: '',
        dataAquisicao: new Date().toISOString().split('T')[0],
        precoAquisicao: '',
        custoMaquinaH: '',
        custoEnergiaH: '',
        consumoW: ''
      });
      loadMachines();
    }
  };

  const handleEdit = (m: any) => {
    setFormData({
      name: m.name || '',
      tipo: m.tipo || '3D',
      marca: m.marca || '',
      modelo: m.modelo || '',
      numeroSerie: m.numeroSerie || '',
      dataAquisicao: m.dataAquisicao ? new Date(m.dataAquisicao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      precoAquisicao: m.precoAquisicao ? m.precoAquisicao.toString() : '',
      custoMaquinaH: m.custoMaquinaH ? m.custoMaquinaH.toString() : '',
      custoEnergiaH: m.custoEnergiaH ? m.custoEnergiaH.toString() : '',
      consumoW: m.consumoW ? m.consumoW.toString() : ''
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta máquina?')) {
      const res = await deleteMachine(id);
      if (res.success) {
        loadMachines();
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
              Gestão de <span className="text-indigo-600">Máquinas</span>
            </h1>
            <p className="text-zinc-500 mt-1 font-medium">Controle seus equipamentos de impressão 3D e corte laser</p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  name: '',
                  tipo: '3D',
                  marca: '',
                  modelo: '',
                  numeroSerie: '',
                  dataAquisicao: new Date().toISOString().split('T')[0],
                  precoAquisicao: '',
                  custoMaquinaH: '',
                  custoEnergiaH: '',
                  consumoW: ''
                });
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {showForm ? <Plus className="rotate-45 transition-transform" /> : <Plus />}
            {showForm ? 'Fechar Formulário' : 'Nova Máquina'}
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
                  <InputField label="Nome do Equipamento" name="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Impressora Principal" icon={<Tag size={16} />} required />
                  <InputField label="Marca" name="marca" value={formData.marca} onChange={handleInputChange} placeholder="Ex: Bambu Lab" icon={<Building2 size={16} />} required />
                  <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} placeholder="Ex: P1S Combo" icon={<Info size={16} />} required />

                  <InputField
                    label="Custo da Máquina (R$)"
                    name="precoAquisicao"
                    value={formData.precoAquisicao}
                    onChange={handleInputChange}
                    placeholder="8000"
                    type="number"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipo de Tecnologia</label>
                    <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white uppercase transition-all">
                      <option value="3D">Impressora 3D</option>
                      <option value="LASER">Máquina Laser</option>
                    </select>
                  </div>
                  <InputField label="Número de Série" name="numeroSerie" value={formData.numeroSerie} onChange={handleInputChange} placeholder="Ex: SN123456" icon={<Database size={16} />} required />
                  <InputField label="Data de Aquisição" name="dataAquisicao" value={formData.dataAquisicao} onChange={handleInputChange} type="date" icon={<Calendar size={16} />} />
                </div>

                <div className="space-y-4">
                  <InputField label="Custo Operacional/Hora (R$)" name="custoMaquinaH" value={formData.custoMaquinaH} onChange={handleInputChange} placeholder="5.00" icon={<Cpu size={16} />} type="number" />
                  <InputField label="Custo Energia/Hora (R$)" name="custoEnergiaH" value={formData.custoEnergiaH} onChange={handleInputChange} placeholder="0.50" icon={<Zap size={16} />} type="number" />
                </div>

                <div className="md:col-span-3 flex justify-end pt-4">
                  <button type="submit" className="bg-zinc-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center gap-2">
                    {editingId ? 'Atualizar Equipamento' : 'Salvar Equipamento'} <ArrowRight size={18} />
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
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Data Aquisição</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Equipamento / Marca</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Modelo / Série</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tipo</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Custo/Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {machines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-zinc-400 italic">
                        <Cpu size={40} className="mb-2 opacity-20" />
                        <p>Nenhuma máquina cadastrada.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  machines.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-bold text-xs uppercase">
                          <Calendar size={14} className="text-zinc-300" />
                          {m.dataAquisicao ? new Date(m.dataAquisicao).toLocaleDateString('pt-BR') : '---'}
                        </div>
                      </td>
                      <td className="px-6 py-6 font-black text-zinc-800 dark:text-zinc-100 tracking-tight italic uppercase">
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                          {m.marca && <span className="text-[10px] text-zinc-400 normal-case font-bold">{m.marca}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-zinc-800 dark:text-zinc-200 font-bold text-sm uppercase italic">{m.modelo}</span>
                          {m.numeroSerie && <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-tighter">SN: {m.numeroSerie}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          {m.tipo === 'LASER' ? (
                            <span className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg"><Target size={16} /></span>
                          ) : (
                            <span className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg"><Cpu size={16} /></span>
                          )}
                          <span className="text-xs font-black uppercase tracking-widest">{m.tipo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-zinc-700 dark:text-zinc-300">
                        {m.precoAquisicao ? `R$ ${formatBRL(m.precoAquisicao)}` : '---'}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-white italic">R$ {formatBRL(m.custoMaquinaH + m.custoEnergiaH)}/h</span>
                          <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Base + Energia</span>
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
