"use server"

import { prisma } from "@/lib/prisma";
import { CalculationInput, CalculationResult } from "@/lib/calculations";
import { revalidatePath } from "next/cache";

export async function saveBudget(
  input: CalculationInput & { 
    nomePeca?: string; 
    nomeMaterial?: string; 
    clientId?: string; 
    materialBase?: string;
    prazoEntrega?: string;
    observacao?: string;
    pdfBase64?: string;
    materialId?: string;
    pesoTotalG?: number;
    machineId?: string;
    status?: string;
    novoClienteNome?: string;
    formaPagamento?: string;
    condicoesComerciais?: string;
    corPeca?: string;
  }, 
  result: CalculationResult,
  id?: string
) {
  try {
    let clientId = input.clientId;
    
    // Se for cliente novo (não tem ID)
    if (clientId === "novo") {
      const client = await prisma.client.create({
        data: {
          name: input.novoClienteNome || "Cliente Sem Nome",
          phone: "000000000",
          email: "contato@cliente.com"
        }
      });
      clientId = client.id;
    }

    const budgetData = {
      nomePeca: input.nomePeca || (input.isLaser ? "Serviço Laser" : "Impressão 3D"),
      clientId: clientId!, 
      nomeMaterial: input.isLaser ? (input.materialBase || input.nomeMaterial || "Material Laser") : (input.nomeMaterial || "Material Padrão"),
      pesoG: input.pesoG || 0,
      tempoH: Math.round(input.tempoH || 0),
      tempoM: Math.round(input.tempoM || 0),
      custoMaterial: result.custoMaterial,
      custoEnergia: result.custoEnergia,
      custoMaquina: result.custoMaquina,
      custoDepreciacao: result.custoDepreciacao,
      custoTotal: result.custoTotal,
      margemPercent: input.margemPercent,
      impostoPercent: input.impostoPercent,
      setupCost: input.extras.setup || 0,
      finishingCost: input.extras.acabamento || 0,
      urgencyCost: input.extras.urgencia || 0,
      shippingCost: input.extras.frete || 0,
      precoFinal: result.precoFinal,
      lucro: result.lucro,
      prazoEntrega: input.prazoEntrega || null,
      observacao: input.observacao || null,
      pdfBase64: input.pdfBase64 || null,
      machineId: input.machineId || null,
      status: input.status || "PENDENTE",
      formaPagamento: input.formaPagamento || null,
      condicoesComerciais: input.condicoesComerciais || null,
      corPeca: input.corPeca || null,
    };

    let budget;
    if (id) {
      // Se já temos um ID, apenas atualizamos
      budget = await prisma.budget.update({
        where: { id },
        data: budgetData
      });
    } else {
      // Se não tem ID, criamos um novo com número oficial
      budget = await prisma.budget.create({
        data: {
          ...budgetData,
          budgetNumber: await generateBudgetNumber(),
        }
      });
    }

    // Consumo de estoque para Impressão 3D (usa o peso total com perda)
    if (!input.isLaser && input.materialId && result.pesoTotalG > 0) {
      await (prisma.material as any).update({
        where: { id: input.materialId },
        data: {
          estoqueG: {
            decrement: result.pesoTotalG
          }
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/historico");
    revalidatePath(`/orcamento/${budget.id}`);

    return { success: true, budgetId: budget.id, budgetNumber: budget.budgetNumber, orderNumber: budget.orderNumber };
  } catch (error: any) {
    console.error("ERRO CRÍTICO AO SALVAR ORÇAMENTO:");
    console.error("Mensagem:", error?.message);
    console.error("Código:", error?.code);
    return { success: false, error: "Falha ao salvar no banco. Verifique se as novas colunas existem via 'npx prisma db push'." };
  }
}

export async function getBudgetById(id: string) {
  try {
    return await prisma.budget.findUnique({
      where: { id },
      include: { cliente: true }
    });
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return null;
  }
}

export async function getBudgetHistory() {
  return await prisma.budget.findMany({
    include: { cliente: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateBudgetStatus(id: string, status: string) {
  try {
    const currentBudget = await prisma.budget.findUnique({ where: { id } });
    const data: any = { status };

    if (status === "APROVADO" && currentBudget && !currentBudget.orderNumber) {
      data.orderNumber = await generateOrderNumber();
    }

    const budget = await prisma.budget.update({
      where: { id },
      data
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/historico");
    revalidatePath(`/orcamento/${id}`);

    return { success: true, budget };
  } catch (error) {
    console.error("Erro ao atualizar status do orçamento:", error);
    return { success: false, error: "Falha ao atualizar status" };
  }
}

async function generateBudgetNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.budget.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      }
    }
  });
  return `ORÇ-${year}-${(count + 1).toString().padStart(4, '0')}`;
}

async function generateOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.budget.count({
    where: {
      orderNumber: { 
        startsWith: `PED-${year}-` 
      }
    }
  });
  return `PED-${year}-${(count + 1).toString().padStart(4, '0')}`;
}

export async function getMaterials() {
  return await (prisma.material as any).findMany({
    orderBy: { nome: 'asc' }
  });
}

export async function getClients() {
  return await prisma.client.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createClient(data: any) {
  try {
    const client = await prisma.client.create({
      data: {
        name: data.name,
        documento: data.documento,
        email: data.email,
        phone: data.phone,
      }
    });
    return { success: true, client };
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return { success: false, error: "Falha ao criar cliente" };
  }
}

export async function updateClient(id: string, data: any) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        documento: data.documento,
        email: data.email,
        phone: data.phone,
      }
    });
    return { success: true, client };
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return { success: false, error: "Falha ao atualizar cliente" };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return { success: false, error: "Falha ao excluir cliente" };
  }
}

export async function getMachines() {
  return await prisma.machine.findMany({
    orderBy: { name: 'asc' },
    include: { budgets: true }
  });
}

export async function createMaterial(data: any) {
  try {
    const material = await (prisma.material as any).create({
      data: {
        nome: `${data.marca} ${data.tipo} ${data.linha} ${data.cor}`,
        marca: data.marca,
        tipo: data.tipo,
        linha: data.linha,
        cor: data.cor,
        precoKg: parseFloat(data.precoKg),
        precoCompra: parseFloat(data.precoCompra),
        estoqueG: parseFloat(data.estoqueG) || 0,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : new Date(),
      }
    });
    return { success: true, material };
  } catch (error) {
    console.error("Erro ao criar material:", error);
    return { success: false, error: "Falha ao criar material" };
  }
}

export async function updateMaterial(id: string, data: any) {
  try {
    const material = await (prisma.material as any).update({
      where: { id },
      data: {
        nome: `${data.marca} ${data.tipo} ${data.linha} ${data.cor}`,
        marca: data.marca,
        tipo: data.tipo,
        linha: data.linha,
        cor: data.cor,
        precoKg: parseFloat(data.precoKg),
        precoCompra: parseFloat(data.precoCompra),
        estoqueG: parseFloat(data.estoqueG) || 0,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : new Date(),
      }
    });
    return { success: true, material };
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    return { success: false, error: "Falha ao atualizar material" };
  }
}

export async function deleteMaterial(id: string) {
  try {
    await (prisma.material as any).delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    return { success: false, error: "Falha ao excluir material" };
  }
}

export async function createMachine(data: any) {
  try {
    const machine = await (prisma.machine as any).create({
      data: {
        name: data.name,
        tipo: data.tipo || "3D",
        marca: data.marca,
        modelo: data.modelo,
        numeroSerie: data.numeroSerie,
        dataAquisicao: data.dataAquisicao ? new Date(data.dataAquisicao) : new Date(),
        precoAquisicao: parseFloat(data.precoAquisicao),
        custoMaquinaH: parseFloat(data.custoMaquinaH) || 0,
        custoEnergiaH: parseFloat(data.custoEnergiaH) || 0,
      }
    });
    return { success: true, machine };
  } catch (error) {
    console.error("Erro ao criar máquina:", error);
    return { success: false, error: "Falha ao criar máquina" };
  }
}

export async function updateMachine(id: string, data: any) {
  try {
    const machine = await (prisma.machine as any).update({
      where: { id },
      data: {
        name: data.name,
        tipo: data.tipo || "3D",
        marca: data.marca,
        modelo: data.modelo,
        numeroSerie: data.numeroSerie,
        dataAquisicao: data.dataAquisicao ? new Date(data.dataAquisicao) : new Date(),
        precoAquisicao: parseFloat(data.precoAquisicao),
        custoMaquinaH: parseFloat(data.custoMaquinaH) || 0,
        custoEnergiaH: parseFloat(data.custoEnergiaH) || 0,
      }
    });
    return { success: true, machine };
  } catch (error) {
    console.error("Erro ao atualizar máquina:", error);
    return { success: false, error: "Falha ao atualizar máquina" };
  }
}

export async function deleteMachine(id: string) {
  try {
    await (prisma.machine as any).delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir máquina:", error);
    return { success: false, error: "Falha ao excluir máquina" };
  }
}

export async function deleteBudget(id: string) {
  try {
    await prisma.budget.delete({ where: { id } });
    
    revalidatePath("/dashboard");
    revalidatePath("/historico");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return { success: false, error: "Falha ao excluir orçamento" };
  }
}
