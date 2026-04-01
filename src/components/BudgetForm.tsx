"use client"

import React, { useState, useEffect } from 'react';
import { calculateBudget, CalculationInput, CalculationResult, getSmartMarginAlert } from '@/lib/calculations';
import { formatBRL } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBudget, getMaterials, getClients, getMachines, createClient } from '@/app/actions/budget';
import { getSettings } from '@/app/actions/settings';
import { 
  Calculator, 
  FileText, 
  Share2, 
  Info, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Layers, 
  Zap, 
  Building2, 
  ImageIcon, 
  X, 
  Database,
  User,
  Plus,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';

import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BudgetForm = () => {
  const [input, setInput] = useState<CalculationInput & { nomePeca: string; nomeMaterial: string; clientId?: string; materialId?: string; machineId?: string; materialBase?: string; prazoEntrega: string; observacao: string; perdaTecnicaPercent: number }>({
    nomePeca: '',
    nomeMaterial: 'Material Manual',
    clientId: undefined,
    materialId: undefined,
    prazoEntrega: '',
    observacao: '',
    pesoG: 0,
    precoKg: 120,
    tempoH: 0,
    tempoM: 0,
    custoHoraMaquina: 5,
    custoHoraEnergia: 0.5,
    margemPercent: 100,
    impostoPercent: 25,
    isLaser: false,
    materialCliente: false,
    custoItemBase: 0,
    materialBase: 'Acrílico',
    perdaTecnicaPercent: 5,
    tipoTrabalho: 'GRAVACAO',
    precoAquisicao: 0,
    extras: {
      setup: 0,
      acabamento: 0,
      urgencia: 0,
      frete: 0,
    }
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados para Busca de Cliente
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', phone: '', documento: '' });
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    (c.documento && c.documento.includes(clientSearch))
  );

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setInput(prev => ({ ...prev, clientId: client.id }));
    setClientSearch(client.name);
    setShowClientResults(false);
  };

  const handleQuickCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.phone) {
      alert("O telefone é fundamental para o cadastro!");
      return;
    }
    const res = await createClient(newClientData);
    if (res.success && res.client) {
      const client = res.client;
      setClients(prev => [...prev, client]);
      handleSelectClient(client);
      setIsCreatingClient(false);
      setNewClientData({ name: '', phone: '', documento: '' });
    }
  };

  useEffect(() => {
    async function loadData() {
      const [mats, cls, macs, sets] = await Promise.all([getMaterials(), getClients(), getMachines(), getSettings()]);
      setMaterials(mats);
      setClients(cls);
      setMachines(macs);
      setCompanySettings(sets);
    }
    loadData();
  }, []);

  useEffect(() => {
    const res = calculateBudget(input);
    setResult(res);
  }, [input]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('extra.')) {
      const extraKey = name.split('.')[1];
      setInput(prev => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extraKey as keyof typeof prev.extras]: parseFloat(value) || 0
        }
      }));
    } else if (name === 'nomePeca' || name === 'prazoEntrega' || name === 'observacao') {
      setInput(prev => ({ ...prev, [name]: value }));
    } else {
      setInput(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  // Filter machines by the current tab type
  const filteredMachines = machines.filter((m: any) => {
    if (input.isLaser) return m.tipo === 'LASER';
    return m.tipo === '3D';
  });

  const handleGeneratePDF = async (shouldSave = true) => {
    if (!result) return;
    const doc = new jsPDF();
    
    // Configurações e QR Code
    const budgetUrl = `${window.location.origin}/orcamento/temp`; // Placeholder
    
    // Header with company info
    let headerY = 15;
    
    if (companySettings?.companyLogo) {
      try {
        doc.addImage(companySettings.companyLogo, 'PNG', 14, 10, 30, 30);
        headerY = 15;
      } catch {
        // If logo fails to load, skip it
      }
    }
    
    const textX = companySettings?.companyLogo ? 50 : 14;
    
    if (companySettings?.companyName) {
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(companySettings.companyName, textX, headerY);
      headerY += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(120);
      if (companySettings.companyCnpj) {
        doc.text(`CNPJ: ${companySettings.companyCnpj}`, textX, headerY);
        headerY += 5;
      }
      if (companySettings.companyPhone) {
        doc.text(`Tel: ${companySettings.companyPhone}`, textX, headerY);
        headerY += 5;
      }
      if (companySettings.companyEmail) {
        doc.text(`Email: ${companySettings.companyEmail}`, textX, headerY);
        headerY += 5;
      }
      headerY += 2; // Extra spacing before title
    }
    
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text('ORÇAMENTO DE PRODUÇÃO', textX, headerY);
    
    const startInfoY = Math.max(headerY + 14, companySettings?.companyLogo ? 48 : 28);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, startInfoY);
    
    if (input.prazoEntrega) {
      doc.text(`Prazo Estimado: ${input.prazoEntrega}`, 14, startInfoY + 5);
    }
    
    // Client name
    const selectedClient = clients.find(c => c.id === input.clientId);
    const clientName = selectedClient ? selectedClient.name : 'Cliente Padrão';
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Cliente: ${clientName}`, 14, startInfoY + 12);
    
    // Piece Info
    doc.text(`Item: ${input.nomePeca || 'Não informada'}`, 14, startInfoY + 20);
    
    // Details
    const tableData = input.isLaser ? [
      ['Tipo de Serviço', `Laser (${input.tipoTrabalho})`],
      ['Material Base', input.materialBase || 'N/A'],
      ['Material do Cliente', input.materialCliente ? 'Sim' : 'Não'],
      ['Custo Item (Shop)', input.materialCliente ? 'R$ 0,00' : `R$ ${formatBRL(input.custoItemBase || 0)}`],
      ['Tempo Estimado', `${input.tempoH}h ${input.tempoM}m`],
      ['Impostos Totais', `${input.impostoPercent}%`],
    ] : [
      ['Tipo de Serviço', 'Impressão 3D'],
      ['Peso da Peça', `${input.pesoG}g`],
      ['Tempo Estimado', `${input.tempoH}h ${input.tempoM}m`],
      ['Material Utilizado', input.nomeMaterial],
      ['Preço do Material', `R$ ${formatBRL(input.precoKg)}/kg`],
      ['Impostos Totais', `${input.impostoPercent}%`],
    ];
    
    autoTable(doc, {
      startY: startInfoY + 28,
      head: [['Item', 'Valor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    // Totals
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    if (input.observacao) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Observações:', 14, finalY);
      doc.setFontSize(9);
      doc.setTextColor(120);
      const splitObs = doc.splitTextToSize(input.observacao, 180);
      doc.text(splitObs, 14, finalY + 5);
      finalY += (splitObs.length * 5) + 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('RESUMO FINANCEIRO', 14, finalY);
    
    const totalsData = [
      ['Custo de Produção Total', `R$ ${formatBRL(result.custoTotal)}`],
      ['Total em Adicionais/Extras', `R$ ${formatBRL(result.somaExtras)}`],
      ['Valor do Imposto', `R$ ${formatBRL(result.valorImposto)}`],
      ['', ''],
      ['VALOR TOTAL FINAL', `R$ ${formatBRL(result.precoFinal)}`],
    ];
    
    autoTable(doc, {
      startY: finalY + 5,
      body: totalsData,
      theme: 'plain',
      styles: { fontSize: 12, fontStyle: 'bold' }
    });
    
    const finalTableY = (doc as any).lastAutoTable.finalY;

    // QR CODE - Only if we are saving (to get ID) or as a placeholder
    // We'll save first to get the ID, then update with PDF including real QR
    let budgetId = '';
    if (shouldSave) {
      // 1. Save without PDF initially to get ID
      const saveRes = await saveBudget(input, result);
      if (saveRes.success && saveRes.budgetId) {
        budgetId = saveRes.budgetId;
        
        // 2. Generate real QR
        const realUrl = `${window.location.origin}/orcamento/${budgetId}`;
        const qrDataUrl = await QRCode.toDataURL(realUrl);
        
        // 3. Add QR to doc
        doc.addImage(qrDataUrl, 'PNG', 160, finalTableY + 5, 30, 30);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Escaneie para ver online', 160, finalTableY + 38);

        // 4. Update with final PDF (base64)
        const pdfBase64 = doc.output('datauristring');
        await saveBudget({ ...input, pdfBase64 }, result);
      }
    }

    doc.save(`orcamento_${input.nomePeca || 'producao'}_${new Date().getTime()}.pdf`);
    return budgetId;
  };

  const handleWhatsApp = async () => {
    if (!result) return;
    
    // GGerar PDF e salvar (retorna ID)
    const budgetId = await handleGeneratePDF(true);
    
    const tipoServico = input.isLaser ? `Laser (${input.tipoTrabalho === 'GRAVACAO' ? 'Gravação' : 'Corte'})` : 'Impressão 3D';
    const budgetUrl = `${window.location.origin}/orcamento/${budgetId}`;
    
    const message = `Olá! Segue o orçamento solicitado:\n\n*Serviço:* ${tipoServico}\n*Peça:* ${input.nomePeca || 'Nova Produção'}\n*VALOR TOTAL:* R$ ${formatBRL(result.precoFinal)}\n\n*Visualize os detalhes e baixe o PDF aqui:* \n${budgetUrl}\n\n_Gerado por PremiumBudget_`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const marginAlert = result ? getSmartMarginAlert(result) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto p-4 py-12">
      {/* Formulário */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 h-fit"
      >
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 rounded-2xl text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 italic">Novo Orçamento</h2>
              <p className="text-zinc-500 text-sm">Preencha os dados e veja o preço em tempo real</p>
            </div>
          </div>

          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
            <button 
              onClick={() => setInput(prev => ({ ...prev, isLaser: false }))}
              className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${!input.isLaser ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            >
              Impressão 3D
            </button>
            <button 
              onClick={() => setInput(prev => ({ ...prev, isLaser: true }))}
              className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${input.isLaser ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            >
              Gravação/Corte Laser
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* CLIENTE INTELIGENTE */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider text-indigo-500">CLIENTE</label>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                <User size={18} />
              </div>
              <input 
                type="text"
                placeholder="Buscar por Nome ou CPF..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientResults(true);
                  if (!e.target.value) {
                    setSelectedClient(null);
                    setInput(prev => ({ ...prev, clientId: undefined }));
                  }
                }}
                onFocus={() => setShowClientResults(true)}
                className="w-full bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold"
              />
              {selectedClient && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-black uppercase italic">
                  <Check size={12} /> Selecionado
                </div>
              )}
            </div>

            {/* Resultados da Busca */}
            <AnimatePresence>
              {showClientResults && (clientSearch.length > 0 || filteredClients.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[60] overflow-hidden max-h-[300px] overflow-y-auto"
                >
                  <div className="p-2 space-y-1">
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors text-left group"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm italic uppercase">{c.name}</span>
                          <span className="text-[10px] text-zinc-400 font-medium tracking-tight">
                            {c.documento || 'Sem Documento'} • {c.phone || 'Sem Telefone'}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}

                    {/* Opção Novo Cliente */}
                    {clientSearch.length > 1 && !filteredClients.find(c => c.name.toLowerCase() === clientSearch.toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingClient(true);
                          setNewClientData(prev => ({ ...prev, name: clientSearch }));
                          setShowClientResults(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                      >
                        <Plus size={18} />
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-black italic uppercase">Cadastrar Novo</span>
                          <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest leading-none">Crie o cliente "{clientSearch}"</span>
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Rápido de Cadastro */}
            <AnimatePresence>
              {isCreatingClient && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                  <motion.form 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onSubmit={handleQuickCreateClient}
                    className="bg-white dark:bg-zinc-900 w-full max-w-md p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-4">Cadastro Rápido</h2>
                        <p className="text-zinc-400 text-xs font-bold mt-2 uppercase tracking-widest">Informações Essenciais</p>
                      </div>
                      <button onClick={() => setIsCreatingClient(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} className="text-zinc-400" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Nome do Cliente</label>
                        <input 
                          type="text" 
                          required
                          value={newClientData.name}
                          onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none font-bold italic dark:text-white"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase ml-1 tracking-widest">Telefone / WhatsApp (Obrigatório) 🏁</label>
                        <input 
                          type="text" 
                          required
                          placeholder="(00) 00000-0000"
                          value={newClientData.phone}
                          onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                          className="w-full bg-indigo-500/5 dark:bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 focus:ring-2 focus:ring-indigo-500 outline-none font-black dark:text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">CPF / CNPJ (Opcional)</label>
                        <input 
                          type="text" 
                          placeholder="000.000.000-00"
                          value={newClientData.documento}
                          onChange={(e) => setNewClientData({ ...newClientData, documento: e.target.value })}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none font-bold dark:text-white"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20">
                      Concluir e Selecionar
                    </button>
                  </motion.form>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Nome da Peça / Projeto</label>
            <input 
              type="text" 
              name="nomePeca"
              value={input.nomePeca}
              onChange={handleInputChange as any}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold placeholder:font-normal"
              placeholder="Ex: Suporte Articulado"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Prazo de Entrega</label>
              <input 
                type="text" 
                name="prazoEntrega"
                value={input.prazoEntrega}
                onChange={handleInputChange as any}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold placeholder:font-normal"
                placeholder="Ex: 3 dias úteis"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Observações (Interno/PDF)</label>
              <input 
                type="text" 
                name="observacao"
                value={input.observacao}
                onChange={handleInputChange as any}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold placeholder:font-normal"
                placeholder="Detalhes adicionais..."
              />
            </div>
          </div>

            <div className="flex flex-col gap-1.5 col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Selecionar Máquina</label>
              <select 
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold"
                onChange={(e) => {
                  const machine = machines.find((m: any) => m.id === e.target.value);
                  if (machine) {
                    setInput(prev => ({ 
                      ...prev, 
                      machineId: machine.id,
                      custoHoraMaquina: machine.custoMaquinaH,
                      custoHoraEnergia: machine.custoEnergiaH,
                      precoAquisicao: machine.precoAquisicao
                    }));
                  } else {
                    setInput(prev => ({
                      ...prev,
                      machineId: undefined,
                      precoAquisicao: 0
                    }));
                  }
                }}
              >
                <option value="">Manual / Configuração Padrão</option>
                {filteredMachines.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} | {m.marca} {m.modelo}</option>
                ))}
              </select>
            </div>

            {input.isLaser ? (
              <div className="col-span-2 space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Tipo de Trabalho Laser</label>
                  <select 
                    value={input.tipoTrabalho}
                    onChange={(e) => setInput(prev => ({ ...prev, tipoTrabalho: e.target.value as any }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold"
                  >
                    <option value="GRAVACAO">Gravação</option>
                    <option value="CORTE">Corte</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <input 
                    type="checkbox" 
                    id="materialCliente"
                    checked={input.materialCliente}
                    onChange={(e) => setInput(prev => ({ ...prev, materialCliente: e.target.checked }))}
                    className="w-5 h-5 accent-indigo-500"
                  />
                  <label htmlFor="materialCliente" className="text-sm font-bold text-zinc-600 dark:text-zinc-300 pointer-events-none lowercase italic">Material fornecido pelo cliente (Custo Material = 0)</label>
                </div>

                {!input.materialCliente && (
                  <InputField label="Custo do Item/Base (R$)" name="custoItemBase" value={input.custoItemBase} onChange={handleInputChange} icon={<DollarSign size={18}/>} />
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Material de Trabalho</label>
                  <input 
                    type="text"
                    value={input.materialBase}
                    onChange={(e) => setInput(prev => ({ ...prev, materialBase: e.target.value }))}
                    placeholder="Ex: Acrílico 3mm / MDF / Couro"
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Selecionar Material do Estoque</label>
                  <select 
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-bold"
                    onChange={(e) => {
                      const mat = materials.find((m: any) => m.id === e.target.value);
                      if (mat) {
                        setInput(prev => ({ ...prev, precoKg: mat.precoKg, nomeMaterial: mat.nome, materialId: mat.id }));
                      } else {
                        setInput(prev => ({ ...prev, nomeMaterial: 'Material Manual', materialId: undefined }));
                      }
                    }}
                  >
                    <option value="">Manual / Digite o preço abaixo...</option>
                    {materials.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} | {m.estoqueG}g disp. | R$ {formatBRL(m.precoKg)}/kg
                      </option>
                    ))}
                  </select>
                </div>
                
                {input.materialId && (
                  <div className="flex flex-col gap-1.5 col-span-2">
                    {(() => {
                      const selectedMat = materials.find(m => m.id === input.materialId);
                      if (!selectedMat) return null;
                      const insufficient = input.pesoG > selectedMat.estoqueG;
                      return (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 border ${insufficient ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-green-500/10 border-green-500/30 text-green-600'}`}>
                          <Database size={18} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest">Estoque desse Material</span>
                            <span className="text-sm font-bold">
                              {selectedMat.estoqueG}g disponível {insufficient && `(Necessário +${(input.pesoG - selectedMat.estoqueG).toFixed(0)}g)`}
                            </span>
                          </div>
                          {insufficient && <AlertTriangle size={20} className="ml-auto animate-bounce" />}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <InputField label="Peso (gramas)" name="pesoG" value={input.pesoG} onChange={handleInputChange} icon={<Layers size={18}/>} />
                <InputField label="Preço Material (R$/kg)" name="precoKg" value={input.precoKg} onChange={handleInputChange} icon={<DollarSign size={18}/>} />
              </>
            )}

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Tempo (Horas)" name="tempoH" value={input.tempoH} onChange={handleInputChange} icon={<Clock size={18}/>} />
            <InputField label="Tempo (Minutos)" name="tempoM" value={input.tempoM} onChange={handleInputChange} icon={<Clock size={18}/>} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <InputField label="Margem (%)" name="margemPercent" value={input.margemPercent} onChange={handleInputChange} icon={<TrendingUp size={18}/>} />
            <InputField label="Imposto (%)" name="impostoPercent" value={input.impostoPercent} onChange={handleInputChange} icon={<Zap size={18}/>} />
            <InputField label="Perda Técnica (%)" name="perdaTecnicaPercent" value={input.perdaTecnicaPercent} onChange={handleInputChange} icon={<TrendingUp size={18}/>} />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              Adicionais Extras <Info size={14} className="text-zinc-300"/>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Setup (R$)" name="extra.setup" value={input.extras.setup} onChange={handleInputChange} />
              <InputField label="Acabamento (R$)" name="extra.acabamento" value={input.extras.acabamento} onChange={handleInputChange} />
              <InputField label="Urgência (R$)" name="extra.urgencia" value={input.extras.urgencia} onChange={handleInputChange} />
              <InputField label="Frete (R$)" name="extra.frete" value={input.extras.frete} onChange={handleInputChange} />
            </div>
          </div>


        </div>
      </motion.div>

      {/* Resultados e Resumo */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <TrendingUp size={160} />
              </div>

              <div className="relative z-10">
                <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Resultado do Cálculo</span>
                <h1 className="text-5xl md:text-6xl font-black mt-2 text-indigo-400">
                  R$ {formatBRL(result.precoFinal)}
                </h1>

                <div className="grid grid-cols-2 gap-8 mt-10">
                  <ResultItem label="Lucro Estimado" value={result.lucro} highlight />
                  <ResultItem label="Custo Total Base" value={result.custoTotal} />
                  <ResultItem label="Custo Material" value={result.custoMaterial} />
                  <ResultItem label="Custo Eq. + Energia" value={result.custoMaquina + result.custoEnergia} />
                  <div className="col-span-2 mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <ResultItem label="Fundo de Depreciação (Reserva)" value={result.custoDepreciacao} highlight />
                  </div>
                </div>

                {marginAlert && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-start gap-3 p-4 bg-orange-500/20 border border-orange-500/50 rounded-2xl text-orange-200 text-sm"
                  >
                    <AlertTriangle size={20} className="shrink-0 text-orange-400" />
                    <p>{marginAlert.message}</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button 
                    onClick={() => handleGeneratePDF()}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all p-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20"
                  >
                    <FileText size={20} />
                    Gerar PDF
                  </button>
                  <button 
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-all p-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20"
                  >
                    <Share2 size={20} />
                    WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detalhes Técnicos */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-zinc-800 dark:text-white uppercase tracking-tighter italic">Resumo Técnico</h3>
            <div className="space-y-4">
                <DetailRow label="Tempo de Produção" value={`${input.tempoH}h ${input.tempoM}m`} />
                <DetailRow label="Peso Peça" value={`${input.pesoG}g`} />
                <DetailRow label="Peso Total (+Perda)" value={`${result?.pesoTotalG.toFixed(1)}g`} />
                <DetailRow label="Impostos Totais" value={`R$ ${formatBRL(result?.valorImposto ?? 0)}`} />
                <DetailRow label="Custos Operacionais" value={`R$ ${formatBRL(result ? result.custoMaquina + result.custoEnergia : 0)}`} />
                <DetailRow label="Total em Extras" value={`R$ ${formatBRL(result?.somaExtras ?? 0)}`} />
            </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</div>}
      <input 
        type="number" 
        name={name}
        value={value === 0 ? '' : value}
        onChange={onChange}
        className={`w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-3.5 ${icon ? 'pl-11' : 'px-4'} rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-zinc-100 text-zinc-800 font-medium`}
        placeholder="0,00"
      />
    </div>
  </div>
);

const ResultItem = ({ label, value, highlight }: any) => (
  <div>
    <span className="text-zinc-500 text-[10px] font-bold uppercase block mb-1 tracking-widest">{label}</span>
    <span className={`text-xl font-bold ${highlight ? 'text-emerald-400' : 'text-zinc-200'}`}>
      R$ {formatBRL(value)}
    </span>
  </div>
);

const DetailRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
    <span className="text-zinc-500 text-sm">{label}</span>
    <span className="text-zinc-800 dark:text-zinc-200 font-bold">{value}</span>
  </div>
);

export default BudgetForm;
