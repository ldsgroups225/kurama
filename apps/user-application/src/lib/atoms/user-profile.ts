import { atomWithStorage } from 'jotai/utils'

const defaultOpts = { getOnInit: true }

// Check if we're on the client side
const isClient = typeof window !== 'undefined'

// Extended profile data with additional fields from session
export interface UserProfileData {
  userType?: 'student' | 'parent' | 'admin'
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  name?: string
  phone?: string
  age?: number
  gender?: 'male' | 'female'
  city?: string
  idNumber?: string
  gradeName?: string
  seriesName?: string
  favoriteSubjects?: string[]
  learningGoals?: string
  studyTime?: string
  childrenMatricules?: string[]
}

/**
 * Atom for storing user profile data with localStorage persistence
 * This provides fast access to user data without querying the database
 */
export const userProfileAtom = atomWithStorage<UserProfileData | null>(
  'kurama:userProfile',
  null,
  {
    getItem(key, initialValue) {
      if (!isClient)
        return initialValue
      const item = localStorage.getItem(key)
      if (item === null)
        return initialValue
      try {
        return JSON.parse(item)
      }
      catch {
        return initialValue
      }
    },
    setItem: (key, newValue) => {
      if (!isClient)
        return
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    removeItem: (key) => {
      if (!isClient)
        return
      localStorage.removeItem(key)
    },
  },
  defaultOpts,
)

/**
 * Synchronous helper to get stored user profile directly from localStorage
 * Useful in non-React contexts like route beforeLoad hooks
 */
export function getStoredUserProfile(): UserProfileData | null {
  if (!isClient)
    return null
  try {
    const item = localStorage.getItem('kurama:userProfile')
    if (item === null)
      return null
    return JSON.parse(item)
  }
  catch {
    return null
  }
}
