const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const materials = [
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'ABS', linha: 'HighSpeed', cor: 'Marmorizado', precoKg: 114.89 },
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'ABS', linha: 'Premium', cor: 'Branco', precoKg: 89.90 },
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'PLA', linha: 'V-Silk', cor: 'Silk', precoKg: 129.85 },
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'PLA', linha: 'V-Silk', cor: 'Silk', precoKg: 129.90 },
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'PLA', linha: 'V-Silk', cor: 'Silk', precoKg: 129.90 },
    { data: '17/11/2025', marca: 'Voolt3D', tipo: 'PLA', linha: 'V-Silk', cor: 'Silk', precoKg: 129.90 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Verde', precoKg: 65.00 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Verde', precoKg: 65.00 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Amarelo', precoKg: 65.00 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Branco', precoKg: 65.00 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Azul', precoKg: 65.00 },
    { data: '09/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Preto', precoKg: 88.00 },
    { data: '09/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Branco', precoKg: 88.00 },
    { data: '09/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Preto', precoKg: 88.00 },
    { data: '09/01/2026', marca: 'Voolt3D', tipo: 'PLA', linha: 'High Speed', cor: 'Cinza', precoKg: 92.73 },
    { data: '09/01/2026', marca: 'Voolt3D', tipo: 'PLA', linha: 'High Speed', cor: 'Amarelo', precoKg: 99.05 },
    { data: '12/12/2025', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Vermelho', precoKg: 65.00 },
    { data: '15/01/2026', marca: 'MasterPrint', tipo: 'PETG', linha: 'High Speed', cor: 'Azul', precoKg: 100.00 },
    { data: '15/01/2026', marca: 'Elegoo', tipo: 'PLA', linha: 'Premium', cor: 'Preto', precoKg: 140.00 },
    { data: '20/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Rosa', precoKg: 101.15 },
    { data: '20/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Marrom', precoKg: 101.15 },
    { data: '20/01/2026', marca: 'F3D', tipo: 'ABS', linha: 'Premium', cor: 'Fucsia', precoKg: 101.15 },
    { data: '13/03/2026', marca: 'PolyMaker', tipo: 'PETG', linha: 'Premium', cor: 'Dourado', precoKg: 263.74 }
  ];

  console.log('Iniciando carga de materiais...');

  for (const m of materials) {
    const [day, month, year] = m.data.split('/');
    const dataCompra = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    await prisma.material.create({
      data: {
        nome: `${m.marca} ${m.tipo} ${m.linha} ${m.cor}`,
        marca: m.marca,
        tipo: m.tipo,
        linha: m.linha,
        cor: m.cor,
        precoKg: m.precoKg,
        dataCompra: dataCompra
      }
    });
  }

  console.log('Carga concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
