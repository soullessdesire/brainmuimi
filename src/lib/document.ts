export const CURRENCY_SYMBOL = 'KES'

export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL} ${price.toLocaleString()}`
}
