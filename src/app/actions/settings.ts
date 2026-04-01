'use server';

import { prisma } from '@/lib/prisma';

export type AppSettingsData = {
  companyName: string;
  companyCnpj?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyLogo?: string | null;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  footerText: string;
  menuLabels: {
    orcamento: string;
    dashboard: string;
    materiais: string;
    maquinas: string;
    clientes: string;
    configuracoes: string;
  };
};

const defaultSettings: AppSettingsData = {
  companyName: 'PremiumBudget',
  companyCnpj: '',
  companyPhone: '',
  companyEmail: '',
  companyLogo: null,
  heroTitle: 'ORÇAMENTOS ULTRA PRECISOS',
  heroSubtitle: 'A plataforma definitiva para gerenciar sua produção. Cálculos cirúrgicos para Impressão 3D e Laser em segundos.',
  heroBadge: 'O futuro da manufatura chegou',
  footerText: 'Todos os direitos reservados.',
  menuLabels: {
    orcamento: 'Novo Orçamento',
    dashboard: 'Dashboard',
    materiais: 'Materiais',
    maquinas: 'Máquinas',
    clientes: 'Clientes',
    configuracoes: 'Configurações',
  },
};

export async function getSettings(): Promise<AppSettingsData> {
  try {
    const record = await prisma.appSettings.findUnique({ where: { id: 'singleton' } });
    if (!record) return defaultSettings;
    return JSON.parse(record.data) as AppSettingsData;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(data: AppSettingsData) {
  await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  });
  return { success: true };
}
