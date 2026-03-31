import { defineStore } from 'pinia'

const seedRole = () => localStorage.getItem('flexicare-role') || 'client'
const seedAuth = () => localStorage.getItem('flexicare-auth') === 'true'
const seedOnboarding = () => localStorage.getItem('flexicare-onboarding-seen') === 'true'
const seedToken = () => localStorage.getItem('flexicare-token') || ''
const seedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('flexicare-user') || 'null')
  } catch {
    return null
  }
}

export const useAppStore = defineStore('app', {
  state: () => ({
    role: seedRole(),
    isAuthenticated: seedAuth(),
    onboardingSeen: seedOnboarding(),
    token: seedToken(),
    user: seedUser(),
    splashReady: false,
    toasts: [],
    profile: {
      name: 'FlexiCare User',
      email: 'user@flexicare.app',
      phone: '+234 800 000 0000',
    },
  }),
  getters: {
    isProvider: (state) => state.role === 'provider',
    isClient: (state) => state.role === 'client',
  },
  actions: {
    setRole(role) {
      this.role = role
      localStorage.setItem('flexicare-role', role)
    },
    setSession({ user, token }) {
      this.user = user || null
      this.token = token || ''
      this.role = user?.role || this.role
      this.profile = {
        name: user?.name || this.profile?.name || 'FlexiCare User',
        email: user?.email || this.profile?.email || 'user@flexicare.app',
        phone: user?.phone || this.profile?.phone || '',
      }
      localStorage.setItem('flexicare-token', this.token)
      localStorage.setItem('flexicare-user', JSON.stringify(this.user))
      localStorage.setItem('flexicare-role', this.role)
    },
    setAuthenticated(value) {
      this.isAuthenticated = value
      localStorage.setItem('flexicare-auth', value ? 'true' : 'false')
    },
    markOnboardingSeen() {
      this.onboardingSeen = true
      localStorage.setItem('flexicare-onboarding-seen', 'true')
    },
    updateProfile(profile) {
      this.profile = {
        ...(this.profile || {}),
        ...profile,
      }
      if (this.user) {
        this.user = {
          ...this.user,
          ...profile,
        }
        localStorage.setItem('flexicare-user', JSON.stringify(this.user))
      }
    },
    markSplashReady() {
      this.splashReady = true
    },
    pushToast(payload) {
      const id = Date.now() + Math.random()
      this.toasts.unshift({
        id,
        type: payload.type || 'info',
        title: payload.title || 'FlexiCare',
        message: payload.message || '',
      })
      window.setTimeout(() => this.dismissToast(id), 3200)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    logout() {
      localStorage.removeItem('flexicare-role')
      localStorage.removeItem('flexicare-auth')
      localStorage.removeItem('flexicare-token')
      localStorage.removeItem('flexicare-user')
      this.role = 'client'
      this.isAuthenticated = false
      this.token = ''
      this.user = null
      this.profile = {
        name: 'FlexiCare User',
        email: 'user@flexicare.app',
        phone: '+234 800 000 0000',
      }
    },
  },
})
