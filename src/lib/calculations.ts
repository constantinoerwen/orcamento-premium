export interface CalculationInput {
  pesoG: number;
  precoKg: number;
  tempoH: number;
  tempoM: number;
  custoHoraMaquina: number;
  custoHoraEnergia: number;
  margemPercent: number;
  impostoPercent: number;
  perdaTecnicaPercent?: number;
  isLaser?: boolean;
  materialCliente?: boolean;
  custoItemBase?: number;
  tipoTrabalho?: 'GRAVACAO' | 'CORTE';
  extras: {
    setup: number;
    acabamento: number;
    urgencia: number;
    frete: number;
  };
}

export interface CalculationResult {
  custoMaterial: number;
  tempoTotalHoras: number;
  custoEnergia: number;
  custoMaquina: number;
  custoTotal: number;
  precoSugerido: number;
  valorImposto: number;
  somaExtras: number;
  precoFinal: number;
  lucro: number;
  pesoTotalG: number; // <--- Novo campo (peça + perda)
}

export function calculateBudget(input: CalculationInput): CalculationResult {
  const {
    pesoG,
    precoKg,
    tempoH,
    tempoM,
    custoHoraMaquina,
    custoHoraEnergia,
    margemPercent,
    impostoPercent,
    extras,
    isLaser,
    materialCliente,
    custoItemBase,
    perdaTecnicaPercent = 5 // Novo: Padrão 5%
  } = input;

  // Custo de material
  let custoMaterial = 0;
  if (isLaser) {
    // Para laser: se o material for do cliente é zero. Se for da loja, usa o custo fixo.
    custoMaterial = materialCliente ? 0 : (custoItemBase || 0);
  } else {
    // Para 3D: (peso_em_gramas * (1 + perda/100) / 1000) × preço_kg
    const perda = (perdaTecnicaPercent || 0) / 100;
    const pesoComPerda = pesoG * (1 + perda);
    custoMaterial = (pesoComPerda / 1000) * precoKg;
  }

  // Tempo total: horas + (minutos / 60)
  const tempoTotalHoras = tempoH + (tempoM / 60);

  // Custo de energia: tempo_total_horas × custo_hora_energia
  const custoEnergia = tempoTotalHoras * custoHoraEnergia;

  // Custo máquina: tempo_total_horas × custo_hora_maquina
  const custoMaquina = tempoTotalHoras * custoHoraMaquina;

  // Custo total: custo_material + custo_energia + custo_maquina
  const custoTotal = custoMaterial + custoEnergia + custoMaquina;

  // Aplicação da margem: preco_sugerido = custo_total × (1 + margem/100)
  const precoSugerido = custoTotal * (1 + margemPercent / 100);

  // Impostos: valor_imposto = preco_sugerido × (imposto/100)
  const valorImposto = precoSugerido * (impostoPercent / 100);

  // Adicionais extras
  const somaExtras = (extras.setup || 0) + (extras.acabamento || 0) + (extras.urgencia || 0) + (extras.frete || 0);

  // Preço final: preco_sugerido + valor_imposto + adicionais
  const precoFinal = precoSugerido + valorImposto + somaExtras;

  // Lucro: preco_final - custo_total - valorImposto
  const lucro = precoFinal - custoTotal - valorImposto;

  return {
    custoMaterial,
    tempoTotalHoras,
    custoEnergia,
    custoMaquina,
    custoTotal,
    precoSugerido,
    valorImposto,
    somaExtras,
    precoFinal,
    lucro,
    pesoTotalG: pesoG * (1 + (perdaTecnicaPercent || 0) / 100)
  };
}

export function getSmartMarginAlert(result: CalculationResult, minProfitMargin: number = 20) {
  if (result.precoFinal === 0) return null;
  const profitMarginPercent = (result.lucro / result.precoFinal) * 100;
  if (profitMarginPercent < minProfitMargin) {
    return {
      severity: 'warning',
      message: `Alerta: Lucro baixo (${profitMarginPercent.toFixed(1)}%). A margem mínima recomendada é ${minProfitMargin}%.`
    };
  }
  return null;
}
