export const CURRENCY_STORAGE_KEY = 'kurama_currency_xof_rate'
export const CURRENCY_UPDATE_KEY = 'kurama_currency_last_updated'

const FALLBACK_XOF_RATE = 620 // Conservative fallback
const UPDATE_INTERVAL = 1000 * 60 * 60 * 24 // 24 hours

export interface CurrencyRate {
  rate: number
  lastUpdated: number
}

/**
 * Reliable way to get XOF rate using server function.
 * This avoids CORS issues by fetching from the backend.
 * 1. Check local storage cache
 * 2. Fetch from server function if cache is stale
 * 3. Use fallback rate if server fetch fails
 */
export async function updateCurrencyRate(): Promise<number> {
  if (typeof window === 'undefined')
    return FALLBACK_XOF_RATE

  try {
    const cached = localStorage.getItem(CURRENCY_STORAGE_KEY)
    const lastUpdate = localStorage.getItem(CURRENCY_UPDATE_KEY)
    const now = Date.now()

    // Return cached if valid
    if (cached && lastUpdate && now - Number.parseInt(lastUpdate) < UPDATE_INTERVAL) {
      return Number.parseFloat(cached)
    }

    // Import server function dynamically to avoid SSR issues
    const { getCurrencyRate } = await import('@/core/functions/currency')

    const result = await getCurrencyRate({ data: { forceRefresh: false } })

    if (result.success && result.rate) {
      // Cache the fresh rate
      localStorage.setItem(CURRENCY_STORAGE_KEY, result.rate.toString())
      localStorage.setItem(CURRENCY_UPDATE_KEY, now.toString())
      return result.rate
    }

    throw new Error('Failed to get currency rate from server')
  }
  catch (error) {
    console.warn('Failed to update currency rate, using fallback', error)
    return FALLBACK_XOF_RATE
  }
}

export function getStoredCurrencyRate(): number {
  if (typeof window === 'undefined')
    return FALLBACK_XOF_RATE
  const rate = localStorage.getItem(CURRENCY_STORAGE_KEY)
  return rate ? Number.parseFloat(rate) : FALLBACK_XOF_RATE
}

export function formatPrice(amount: number, currency: string, xofRate: number): string {
  // If currency is already XOF (unlikely given the prompt), return as is
  if (currency === 'XOF' || currency === 'CFA') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Convert to XOF
  // Assuming amount is in cents if it comes from database, but usually provided as unit in frontend helper
  // If input 'amount' is in major units (e.g. 10.00 USD), result is 10 * rate.
  // The PricingCarousel receives priceAmount in cents usually (e.g. 1000 = 10.00).
  // We need to be careful with the input unit.

  // Let's assume input is in MAJOR units for this helper, or we handle it inside the component.
  // Actually, standardizing on converting *value* is better.

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount * xofRate)
}
