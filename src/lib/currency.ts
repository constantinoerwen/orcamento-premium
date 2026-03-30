/**
 * Formata um valor numérico no padrão brasileiro de moeda: R$ X.XXX,XX
 * Usa vírgula como separador decimal e ponto como separador de milhar.
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
