import { useLocation, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useReducer } from 'react'

const REFERRAL_STORAGE_KEY = 'kurama_referral_code'
const REFERRAL_EXPIRY_KEY = 'kurama_referral_expiry'
const REFERRAL_EXPIRY_DAYS = 30

interface ReferralState {
  referralCode: string | null
}

type ReferralAction
  = | { type: 'SET_CODE', payload: string }
    | { type: 'CLEAR_CODE' }

function referralReducer(state: ReferralState, action: ReferralAction): ReferralState {
  switch (action.type) {
    case 'SET_CODE':
      return { referralCode: action.payload }
    case 'CLEAR_CODE':
      return { referralCode: null }
    default:
      return state
  }
}

/**
 * Hook to manage referral code capture and storage
 */
export function useReferral() {
  const location = useLocation()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(referralReducer, { referralCode: null })

  // Capture referral code from URL on mount
  useEffect(() => {
    const searchString = typeof location.search === 'string' ? location.search : ''
    const searchParams = new URLSearchParams(searchString)
    const refParam = searchParams.get('ref')

    if (refParam) {
      // Store referral code with expiry
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS)

      localStorage.setItem(REFERRAL_STORAGE_KEY, refParam.toUpperCase())
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString())

      dispatch({ type: 'SET_CODE', payload: refParam.toUpperCase() })

      // Clean URL by removing ref parameter
      const newSearchParams = new URLSearchParams(searchString)
      newSearchParams.delete('ref')

      const newSearch = newSearchParams.toString()
      const newUrl = location.pathname + (newSearch ? `?${newSearch}` : '')

      // Replace current URL without ref parameter
      navigate({ to: newUrl as any, replace: true })
    }
    else {
      // Check if we have a stored referral code that hasn't expired
      const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY)
      const storedExpiry = localStorage.getItem(REFERRAL_EXPIRY_KEY)

      if (storedCode && storedExpiry) {
        const expiryDate = new Date(storedExpiry)
        const now = new Date()

        if (now < expiryDate) {
          dispatch({ type: 'SET_CODE', payload: storedCode })
        }
        else {
          // Expired, clean up
          localStorage.removeItem(REFERRAL_STORAGE_KEY)
          localStorage.removeItem(REFERRAL_EXPIRY_KEY)
        }
      }
    }
  }, [location.search, location.pathname, navigate])

  // Function to get current referral code
  const getCurrentReferralCode = (): string | null => {
    const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY)
    const storedExpiry = localStorage.getItem(REFERRAL_EXPIRY_KEY)

    if (storedCode && storedExpiry) {
      const expiryDate = new Date(storedExpiry)
      const now = new Date()

      if (now < expiryDate) {
        return storedCode
      }
      else {
        // Expired, clean up
        localStorage.removeItem(REFERRAL_STORAGE_KEY)
        localStorage.removeItem(REFERRAL_EXPIRY_KEY)
      }
    }

    return null
  }

  // Function to clear referral code
  const clearReferralCode = useCallback(() => {
    localStorage.removeItem(REFERRAL_STORAGE_KEY)
    localStorage.removeItem(REFERRAL_EXPIRY_KEY)
    dispatch({ type: 'CLEAR_CODE' })
  }, [])

  return {
    referralCode: state.referralCode,
    getCurrentReferralCode,
    clearReferralCode,
  }
}
