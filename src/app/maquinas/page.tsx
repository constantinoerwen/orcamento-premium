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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fechar' : 'Nova Máquina'}
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.div>
              <form onSubmit={handleSubmit}>

                {/* CAMPOS PRINCIPAIS */}
                <InputField label="Nome do Equipamento" name="name" value={formData.name} onChange={handleInputChange} required />
                <InputField label="Marca" name="marca" value={formData.marca} onChange={handleInputChange} required />
                <InputField label="Modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} required />

                {/* ✅ NOVO CAMPO ADICIONADO */}
                <InputField
                  label="Custo da Máquina (R$)"
                  name="precoAquisicao"
                  value={formData.precoAquisicao}
                  onChange={handleInputChange}
                  placeholder="Ex: 8000"
                  icon={<DollarSign size={16} />}
                  type="number"
                />

                {/* CAMPOS EXISTENTES */}
                <InputField label="Custo Operacional/Hora (R$)" name="custoMaquinaH" value={formData.custoMaquinaH} onChange={handleInputChange} type="number" />
                <InputField label="Custo Energia/Hora (R$)" name="custoEnergiaH" value={formData.custoEnergiaH} onChange={handleInputChange} type="number" />

                <button type="submit">Salvar</button>

              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <table>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>

                {/* ✅ VALOR DA MÁQUINA */}
                <td>
                  {m.precoAquisicao ? `R$ ${formatBRL(m.precoAquisicao)}` : '---'}
                </td>

                {/* CUSTO/HORA */}
                <td>
                  R$ {formatBRL((m.custoMaquinaH || 0) + (m.custoEnergiaH || 0))}/h
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </div>
  );
}

const InputField = ({ label, name, value, onChange, placeholder, icon, type = "text", required = false }: any) => (
  <div>
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);