import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const FALLBACK_XOF_RATE = 620 // Conservative fallback

/**
 * Fetch current USD to XOF exchange rate from server
 * This avoids CORS issues by making the request server-side
 */
export const fetchCurrencyRate = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      // Use a reliable currency API (you can replace with your preferred service)
      const response = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        {
          headers: {
            'User-Agent': 'Kurama-App/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as {
        rates?: { XOF?: number }
        success?: boolean
      }

      if (data.rates?.XOF) {
        return {
          success: true,
          rate: data.rates.XOF,
          timestamp: Date.now(),
        }
      }

      throw new Error('XOF rate not found in response')
    } catch (error) {
      console.warn('Failed to fetch currency rate from API:', error)

      // Return fallback rate
      return {
        success: false,
        rate: FALLBACK_XOF_RATE,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

/**
 * Get cached currency rate with optional refresh
 */
const CurrencyRateSchema = z.object({
  forceRefresh: z.boolean().optional(),
})

export const getCurrencyRate = createServerFn({ method: 'GET' })
  .inputValidator((data: { forceRefresh?: boolean }) =>
    CurrencyRateSchema.parse(data)
  )
  .handler(async ({ data: { forceRefresh } }) => {
    // For now, always fetch fresh rate
    // In the future, you could implement server-side caching here
    // The forceRefresh parameter is reserved for future use
    const result = await fetchCurrencyRate()

    return {
      rate: result.rate,
      success: result.success,
      timestamp: result.timestamp,
      cached: false,
      forceRefresh, // Include for future use
    }
  })
