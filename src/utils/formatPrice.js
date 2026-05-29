export function formatRupiah(amount) {
  if (!Number.isFinite(amount)) return 'Rp 0'
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`
}

export function parsePriceValue(priceText) {
  if (typeof priceText === 'number') return priceText
  const digits = String(priceText).replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export function savingsPercent(priceValue, oldPriceValue) {
  if (!oldPriceValue || oldPriceValue <= priceValue) return 0
  return Math.round(((oldPriceValue - priceValue) / oldPriceValue) * 100)
}
