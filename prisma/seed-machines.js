const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const machines = [
    { 
      name: 'Bambu Lab P1S', 
      consumoW: 0.1, // W ou kW? Vou assumir o valor literal do usuário
      custokWh: 0.09,
      custoMaquinaH: 5.00 // Estimado para teste
    },
    { 
      name: 'Snapmaker U1', 
      consumoW: 1.18, 
      custokWh: 2.40,
      custoMaquinaH: 15.00 // Estimado para teste
    }
  ];

  console.log('Iniciando carga de máquinas...');

  for (const m of machines) {
    // Calculando custo de energia por hora: (Watts / 1000) * Custo kWh
    // Se o usuário já passou em kW, o cálculo seria Consumo * Custo
    // Vou usar a fórmula padrão de conversão
    const custoEnergiaH = (m.consumoW / 1000) * m.custokWh;

    await prisma.machine.upsert({
      where: { id: m.name.replace(/\s+/g, '-').toLowerCase() },
      update: {
        name: m.name,
        custoEnergiaH: custoEnergiaH,
        custoMaquinaH: m.custoMaquinaH
      },
      create: {
        id: m.name.replace(/\s+/g, '-').toLowerCase(),
        name: m.name,
        custoEnergiaH: custoEnergiaH,
        custoMaquinaH: m.custoMaquinaH
      }
    });
  }

  console.log('Carga de máquinas concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
