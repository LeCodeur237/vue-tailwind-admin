<template>
  <div class="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-2 lg:grid-cols-[0.95fr_1.05fr]">
      <section class="relative overflow-hidden rounded-[1rem] border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_55%,#a855f7_100%)] p-6 text-white sm:p-3">
        <div class="absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div class="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div class="relative">
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Connexion</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Bienvenue.</h1>
        </div>
      </section>

      <section class="px-3 sm:p-8">
        <form class="space-y-4" @submit.prevent="login">
          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Email</span>
            <input v-model="form.email" type="email" class="input-base" placeholder="votre@email.com" required />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Mot de passe</span>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input-base pr-12"
                placeholder="********"
                required
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </label>
          <button
            type="submit"
            class="wide-action bg-violet-600 text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading || !canSubmit"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="mt-6 text-sm text-slate-600">
          Nouveau client ?
          <RouterLink to="/client/register" class="font-semibold text-violet-700 hover:text-violet-500">
            Créer un compte client
          </RouterLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const app = useAppStore()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const form = reactive({
  email: app.profile?.email || '',
  password: '',
  device_name: 'web',
})

const canSubmit = computed(() => Boolean(form.email.trim() && form.password.trim()))

async function redirectAfterLogin(user) {
  const role = user?.role
  if (role === 'client') return router.replace('/client/dashboard')
  if (role === 'provider') return router.replace('/provider/dashboard')
  if (role === 'admin' || role === 'superadmin') return router.replace('/provider/dashboard')
  return router.replace('/client/dashboard')
}

async function routeAfterClientLogin(user) {
  try {
    const profileResponse = await api.get('/client/profile')
    const profile = profileResponse?.data?.data
    if (!profile) {
      app.pushToast({
        type: 'info',
        title: 'Profil client requis',
        message: 'Completez votre profil avant de continuer.',
      })
      return router.replace('/client/profile/edit?setup=1')
    }
  } catch (profileError) {
    app.pushToast({
      type: 'warning',
      title: 'Profil client',
      message: 'Nous allons vous conduire vers la page de profil.',
    })
    return router.replace('/client/profile/edit?setup=1')
  }

  return redirectAfterLogin(user)
}

async function login() {
  if (!canSubmit.value) {
    error.value = 'Tous les champs sont obligatoires.'
    app.pushToast({
      type: 'error',
      title: 'Connexion impossible',
      message: error.value,
    })
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data } = await api.post('/auth/login', {
      email: form.email,
      password: form.password,
      device_name: form.device_name,
    })

    const user = data?.data?.user
    const token = data?.data?.token

    if (!user || !token) {
      throw new Error('Reponse de connexion invalide')
    }

    if (!['client', 'provider', 'admin', 'superadmin'].includes(user.role)) {
      error.value = 'Compte non autorise.'
      app.pushToast({
        type: 'error',
        title: 'Connexion refusee',
        message: 'Votre compte n est pas autorise sur cette interface.',
      })
      return
    }

    app.setSession({ user, token })
    app.setAuthenticated(true)
    app.markOnboardingSeen()
    app.pushToast({
      type: 'success',
      title: 'Connexion reussie',
      message: data?.message || 'Bienvenue sur FlexiCare.',
    })

    if (user.role === 'client') {
      await routeAfterClientLogin(user)
      return
    }

    await redirectAfterLogin(user)
  } catch (err) {
    const status = err?.response?.status
    if (status === 401 || status === 403) {
      error.value = 'Compte non autorise.'
      app.pushToast({
        type: 'error',
        title: 'Connexion refusee',
        message: error.value,
      })
    } else {
      error.value = 'Connexion impossible. Verifiez vos identifiants.'
      app.pushToast({
        type: 'error',
        title: 'Connexion impossible',
        message: error.value,
      })
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!app.isAuthenticated || !app.user?.role) return

  if (app.user.role === 'client') {
    await routeAfterClientLogin(app.user)
    return
  }

  await redirectAfterLogin(app.user)
})
</script>
