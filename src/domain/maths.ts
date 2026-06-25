export function getRate(amount: number, total: number): number {
  return total > 0 ? Math.round((amount / total) * 1000) / 10 : 0
}
