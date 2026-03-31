<template>
  <div class="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section class="relative overflow-hidden rounded-[1rem] border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_55%,#a855f7_100%)] p-6 text-white sm:p-3">
        <div class="absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
        <div class="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div class="relative">
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">Client</p>
          <h1 class="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Créer un compte</h1>
        </div>
      </section>

      <section class="px-3 sm:p-8">
        <form class="mt-6 flex h-full flex-col justify-between gap-4" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-500">
                  Étape {{ currentStep + 1 }}/2
                </p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">
                  {{ currentStep === 0 ? 'Vos coordonnées' : 'Sécurité du compte' }}
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <span class="h-2.5 rounded-full transition-all" :class="currentStep === 0 ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'" />
                <span class="h-2.5 rounded-full transition-all" :class="currentStep === 1 ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'" />
              </div>
            </div>

            <template v-if="currentStep === 0">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Nom complet</span>
                <input v-model="form.name" type="text" class="input-base" placeholder="MBOUNDA Justine" />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Téléphone</span>
                <div class="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <select v-model="selectedCountryCode" class="select-base" :disabled="countryCodesLoading">
                    <option v-if="countryCodesLoading" value="">Chargement...</option>
                    <option v-for="code in countryCodes" :key="code.value" :value="code.value">
                      {{ code.label }}
                    </option>
                  </select>
                  <input v-model="localPhone" type="tel" class="input-base" placeholder="677676545" />
                </div>
              </label>
            </template>

            <template v-else>
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Email</span>
                <input v-model="form.email" type="email" class="input-base" placeholder="votre@email.com" />
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Mot de passe</span>
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input-base pr-12"
                    placeholder="********"
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

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Confirmation</span>
                <div class="relative">
                  <input
                    v-model="form.password_confirmation"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="input-base pr-12"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                    <EyeSlashIcon v-else class="h-5 w-5" />
                  </button>
                </div>
              </label>
            </template>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <button
                v-if="currentStep > 0"
                type="button"
                class="rounded rounded-[1rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
                @click="previousStep"
              >
                Retour
              </button>

              <button
                type="submit"
                class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="loading"
              >
                {{ loading ? 'Création...' : currentStep === 0 ? 'Suivant' : 'Créer mon compte client' }}
              </button>
            </div>

            <RouterLink to="/login" class="block text-center text-sm font-semibold text-violet-700 hover:text-violet-500">
              J’ai déjà un compte
            </RouterLink>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const app = useAppStore()
const loading = ref(false)
const error = ref('')
const currentStep = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const countryCodesLoading = ref(false)
const countryCodes = ref([])
const selectedCountryCode = ref('')
const localPhone = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const stepOneComplete = computed(() => Boolean(form.name.trim() && selectedCountryCode.value && localPhone.value.trim()))
const stepTwoComplete = computed(() => Boolean(form.email.trim() && form.password.trim() && form.password_confirmation.trim()))

function normalizeCodeItem(item) {
  const value = String(item?.dial_code || '').trim()
  const name = String(item?.country_name || item?.name || item?.country || item?.label || '').trim()
  return {
    value,
    label: name ? `${name} (${value})` : value,
  }
}

function composePhoneNumber(code, number) {
  const dial = String(code || '').trim().replace(/\s+/g, '')
  const local = String(number || '').trim().replace(/\s+/g, '')
  if (!dial) return local
  if (!local) return dial
  return `${dial}${local.startsWith('0') ? local.slice(1) : local}`
}

async function loadCountryCodes() {
  countryCodesLoading.value = true
  try {
    const { data } = await api.get('/country-codes', {
      params: { per_page: 15 },
    })

    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    countryCodes.value = items
      .map(normalizeCodeItem)
      .filter((item) => item.value)

    if (!selectedCountryCode.value) {
      const preferred = countryCodes.value.find((item) => item.value === '+237')
      selectedCountryCode.value = preferred?.value || countryCodes.value[0]?.value || ''
    }
  } catch {
    countryCodes.value = [
      { value: '+237', label: 'Cameroun (+237)' },
    ]
    selectedCountryCode.value = '+237'
  } finally {
    countryCodesLoading.value = false
  }
}

async function register() {
  if (!stepOneComplete.value || !stepTwoComplete.value) {
    error.value = 'Tous les champs sont obligatoires.'
    app.pushToast({
      type: 'error',
      title: 'Inscription impossible',
      message: error.value,
    })
    return
  }

  if (form.password !== form.password_confirmation) {
    error.value = 'Les mots de passe ne correspondent pas.'
    app.pushToast({
      type: 'error',
      title: 'Inscription impossible',
      message: error.value,
    })
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data } = await api.post('/auth/register', {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: composePhoneNumber(selectedCountryCode.value, localPhone.value),
      password: form.password,
      password_confirmation: form.password_confirmation,
    })

    app.pushToast({
      type: 'success',
      title: 'Compte créé',
      message: data?.message || 'Votre compte client a été créé.',
    })

    router.replace('/login')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de créer le compte.'
    app.pushToast({
      type: 'error',
      title: 'Inscription impossible',
      message: error.value,
    })
  } finally {
    loading.value = false
  }
}

function nextStep() {
  if (currentStep.value < 1) {
    currentStep.value += 1
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

function handleSubmit() {
  if (currentStep.value === 0) {
    if (!stepOneComplete.value) {
      error.value = 'Tous les champs sont obligatoires.'
      app.pushToast({
        type: 'error',
        title: 'Inscription impossible',
        message: error.value,
      })
      return
    }
    nextStep()
    return
  }

  register()
}

loadCountryCodes()
</script>
