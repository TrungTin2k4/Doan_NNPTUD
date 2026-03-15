import { create } from 'zustand'
import { loginRequest, logoutRequest, meRequest, registerRequest, updateProfileRequest } from '../api/auth'
import { setAuthToken } from '../api/client'

const TOKEN_KEY = 'edulearn_token'

function getStoredToken() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_KEY)
}

function persistToken(token) {
  if (typeof window === 'undefined') {
    return
  }

  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_KEY)
  }
}

const initialToken = getStoredToken()
if (initialToken) {
  setAuthToken(initialToken)
}

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  user: null,
  initialized: false,
  loading: false,
  async initialize() {
    const { initialized, token } = get()
    if (initialized) {
      return
    }

    if (!token) {
      set({ initialized: true })
      return
    }

    set({ loading: true })
    try {
      const user = await meRequest()
      set({ user, initialized: true, loading: false })
    } catch {
      persistToken(null)
      setAuthToken(null)
      set({ token: null, user: null, initialized: true, loading: false })
    }
  },
  async login(payload) {
    set({ loading: true })
    try {
      const auth = await loginRequest(payload)
      persistToken(auth.token)
      setAuthToken(auth.token)
      set({ token: auth.token, user: auth.user, loading: false, initialized: true })
      return auth
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  async register(payload) {
    set({ loading: true })
    try {
      const auth = await registerRequest(payload)
      persistToken(auth.token)
      setAuthToken(auth.token)
      set({ token: auth.token, user: auth.user, loading: false, initialized: true })
      return auth
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
  async logout() {
    try {
      await logoutRequest()
    } catch {
      // ignore logout transport error and clear local auth state anyway
    }

    persistToken(null)
    setAuthToken(null)
    set({ token: null, user: null, initialized: true, loading: false })
  },
  async updateProfile(payload) {
    set({ loading: true })
    try {
      const profile = await updateProfileRequest(payload)
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              fullName: profile.fullName,
              avatarUrl: profile.avatarUrl,
            }
          : profile,
        loading: false,
      }))
      return profile
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))
