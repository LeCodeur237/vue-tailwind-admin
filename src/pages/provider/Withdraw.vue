<template>
  <div class="space-y-6 pb-5 sm:pb-4 lg:pb-4">
    <RouterLink
      to="/provider/earnings"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      Retour
    </RouterLink>

    <Loader v-if="loadingBalance" class="py-8" />

    <section v-else class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="section-title">Retrait</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Retirer vers un numéro</h1>
        </div>
        <div class="rounded-[1rem] bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
          <BanknotesIcon class="h-6 w-6" />
        </div>
      </div>

      <div class="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <p class="text-sm text-slate-500">
          Solde actuel:
          <span class="font-semibold text-slate-900">{{ loadingBalance ? '...' : formatMoney(wallet.balance, wallet.currency) }}</span>
        </p>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="submitWithdraw">
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="space-y-2 sm:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Numéro à créditer</span>
            <div class="flex items-stretch gap-2">
              <div ref="countryMenuRef" class="relative w-[112px] shrink-0">
                <button
                  type="button"
                  class="flex h-12 w-full items-center justify-between gap-2 rounded-[1rem] border border-slate-200 bg-white px-3 text-left transition hover:border-violet-200 hover:bg-violet-50/30"
                  :disabled="countryCodesLoading"
                  @click="countryMenuOpen = !countryMenuOpen"
                >
                  <span class="min-w-0 truncate text-sm font-semibold text-slate-900">
                    {{ selectedCountryLabel }}
                  </span>
                  <ChevronDownIcon class="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                <div
                  v-if="countryMenuOpen"
                  class="absolute left-0 right-0 bottom-full z-20 mb-2 max-h-72 overflow-auto rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
                >
                  <button
                    v-for="code in countryCodes"
                    :key="code.value"
                    type="button"
                    class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition"
                    :class="selectedCountryCode === code.value
                      ? 'bg-violet-50 text-violet-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'"
                    @click="selectedCountryCode = code.value; countryMenuOpen = false"
                  >
                    <span class="truncate text-sm font-semibold">{{ code.value }}</span>
                    <span
                      v-if="selectedCountryCode === code.value"
                      class="h-2.5 w-2.5 rounded-full bg-violet-600"
                    />
                  </button>
                </div>
              </div>

              <input
                v-model="localPhone"
                type="tel"
                class="input-base h-12 min-w-0 flex-1"
                :placeholder="phonePlaceholder"
                autocomplete="tel"
                inputmode="tel"
              />
            </div>
            <p class="text-xs text-slate-400">Numéro du compte: {{ profilePhone || 'non disponible' }}</p>
          </label>

          <label class="space-y-2 sm:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Montant</span>
            <input v-model="form.amount" type="number" min="1" class="input-base" placeholder="25000" />
          </label>

          <label class="space-y-2 sm:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Réseau</span>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="rounded-[1rem] border px-4 py-4 text-left transition"
                :class="form.payment_method === 'orange_money'
                  ? 'border-violet-200 bg-violet-50 ring-1 ring-violet-100'
                  : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'"
                @click="form.payment_method = 'orange_money'"
              >
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">OM</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">Orange Money</p>
              </button>

              <button
                type="button"
                class="rounded-[1rem] border px-4 py-4 text-left transition"
                :class="form.payment_method === 'mtn_money'
                  ? 'border-violet-200 bg-violet-50 ring-1 ring-violet-100'
                  : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'"
                @click="form.payment_method = 'mtn_money'"
              >
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">MoMo</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">MTN Mobile Money</p>
              </button>
            </div>
          </label>
        </div>

        <button
          type="submit"
          class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Traitement...' : 'Confirmer le retrait' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/services/api'
import Loader from '@/components/Loader.vue'
import { ArrowLeftIcon, BanknotesIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import { useAppStore } from '@/stores/app'
import { formatMoney as formatMoneyUtil } from '@/utils/display'
import { normalizePhoneNumber } from '@/utils/phone'

const router = useRouter()
const app = useAppStore()

const loadingBalance = ref(false)
const loading = ref(false)
const wallet = ref({
  balance: '0.00',
  currency: 'XOF',
})
const profilePhone = computed(() => app.user?.phone || app.profile?.phone || '')

const countryCodesLoading = ref(false)
const countryCodes = ref([])
const selectedCountryCode = ref('+237')
const localPhone = ref('')
const countryMenuOpen = ref(false)
const countryMenuRef = ref(null)

const form = reactive({
  amount: '',
  payment_method: 'orange_money',
})

const selectedCountryLabel = computed(() => selectedCountryCode.value || 'Pays')
const phonePlaceholder = computed(() =>
  selectedCountryCode.value ? `${selectedCountryCode.value} 677676545` : '677676545'
)

watch(
  profilePhone,
  (value) => {
    if (!localPhone.value) {
      applyDefaultPhone(value)
    }
  },
  { immediate: true }
)

function formatMoney(value, currency = 'XOF') {
  return formatMoneyUtil(Number(value || 0), currency)
}

function normalizeCodeItem(item) {
  const value = String(item?.dial_code || '').trim()
  const name = String(item?.country_name || item?.name || item?.country || item?.label || '').trim()
  return {
    value,
    label: name ? `${name} (${value})` : value,
  }
}

function splitPhoneNumber(value) {
  const normalized = normalizePhoneNumber(value)
  if (!normalized) {
    return { code: selectedCountryCode.value || '+237', local: '' }
  }

  const candidates = [...countryCodes.value]
    .map((item) => item.value)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  const match = candidates.find((code) => normalized.startsWith(normalizePhoneNumber(code)))
  if (!match) {
    return { code: selectedCountryCode.value || '+237', local: normalized.replace(/^\+/, '') }
  }

  const code = normalizePhoneNumber(match)
  let local = normalized.slice(code.length)
  local = local.replace(/^0+/, '')

  return {
    code: match,
    local,
  }
}

function composePhoneNumber(code, local) {
  const dial = normalizePhoneNumber(code).replace(/^\+/, '')
  const localDigits = normalizePhoneNumber(local).replace(/^0+/, '')
  if (!dial) return localDigits
  if (!localDigits) return `+${dial}`
  return `+${dial}${localDigits}`
}

function isValidInternationalPhoneNumber(code, local) {
  const dial = normalizePhoneNumber(code).replace(/^\+/, '')
  const localDigits = normalizePhoneNumber(local).replace(/^0+/, '')
  if (!dial || !localDigits) return false
  if (!/^\d+$/.test(dial) || !/^\d+$/.test(localDigits)) return false
  const totalLength = `${dial}${localDigits}`.length
  return totalLength >= 8 && totalLength <= 15
}

function applyDefaultPhone(value = profilePhone.value) {
  const parts = splitPhoneNumber(value || '')
  selectedCountryCode.value = parts.code || selectedCountryCode.value || '+237'
  localPhone.value = parts.local || localPhone.value || ''
}

function closeCountryMenuOnOutsideClick(event) {
  if (!countryMenuOpen.value) return
  if (!countryMenuRef.value) return
  if (countryMenuRef.value.contains(event.target)) return
  countryMenuOpen.value = false
}

async function loadWallet() {
  loadingBalance.value = true
  try {
    const { data } = await api.get('/wallet/balance')
    if (data?.success && data?.data) {
      wallet.value = {
        balance: data.data.balance || '0.00',
        currency: data.data.currency || 'XOF',
      }
    }
  } catch (err) {
    console.warn('Wallet balance fallback', err?.message)
  } finally {
    loadingBalance.value = false
  }
}

async function loadCountryCodes() {
  countryCodesLoading.value = true
  try {
    const { data } = await api.get('/country-codes', { params: { per_page: 15 } })
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    countryCodes.value = items.map(normalizeCodeItem).filter((item) => item.value)
    if (!countryCodes.value.length) {
      countryCodes.value = [{ value: '+237', label: 'Cameroun (+237)' }]
    }
    applyDefaultPhone()
  } catch {
    countryCodes.value = [{ value: '+237', label: 'Cameroun (+237)' }]
    applyDefaultPhone()
  } finally {
    countryCodesLoading.value = false
  }
}

async function submitWithdraw() {
  const userId = app.user?.id
  const amount = Number(form.amount)

  if (!userId) {
    app.pushToast({
      type: 'error',
      title: 'Retrait refusé',
      message: 'Utilisateur connecté introuvable.',
    })
    return
  }

  if (!localPhone.value.trim()) {
    app.pushToast({
      type: 'warning',
      title: 'Numéro requis',
      message: 'Veuillez saisir le numéro à créditer.',
    })
    return
  }

  if (!isValidInternationalPhoneNumber(selectedCountryCode.value, localPhone.value)) {
    app.pushToast({
      type: 'warning',
      title: 'Numéro invalide',
      message: 'Veuillez saisir un numéro valide selon le pays sélectionné.',
    })
    return
  }

  if (!amount || amount <= 0) {
    app.pushToast({
      type: 'warning',
      title: 'Montant invalide',
      message: 'Veuillez saisir un montant valide.',
    })
    return
  }

  loading.value = true
  try {
    const reference = `WITHDRAW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
      .toString()
      .slice(-3)}`

    await api.post('/wallet/withdraw', {
      user_id: userId,
      amount,
      reference,
      phone_number: composePhoneNumber(selectedCountryCode.value, localPhone.value),
      payment_method: form.payment_method,
      description: form.payment_method === 'mtn_money' ? 'Retrait vers MTN MoMo' : 'Retrait vers Orange Money',
    })

    app.pushToast({
      type: 'success',
      title: 'Retrait envoyé',
      message: 'Votre demande de retrait a été transmise avec succès.',
    })

    await loadWallet()
    router.replace('/provider/earnings')
  } catch (err) {
    app.pushToast({
      type: 'error',
      title: 'Retrait refusé',
      message: err?.response?.data?.message || 'Impossible d’effectuer le retrait.',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadWallet()
  await loadCountryCodes()
  document.addEventListener('click', closeCountryMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeCountryMenuOnOutsideClick)
})
</script>
