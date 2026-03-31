<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <div class="flex items-center justify-between gap-3">
      <RouterLink
        to="/provider/profile/informations"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Retour
      </RouterLink>
    </div>

    <Loader v-if="loading" class="py-8" />

    <template v-else>
      <section class="p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="text-lg font-black tracking-tight text-slate-900">Modifier les informations</h3>
            <p class="mt-2 text-sm text-slate-500 leading-6">
              Mets à jour les informations visibles dans ton profil prestataire.
            </p>
          </div>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Bio</span>
            <textarea
              v-model="form.bio"
              rows="4"
              class="input-base resize-none"
              placeholder="Décris ton activité..."
            />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Années d'expérience</span>
            <input v-model.number="form.experience_years" type="number" min="0" class="input-base" />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Adresse</span>
            <input v-model="form.home_address" type="text" class="input-base" placeholder="Adresse de résidence" />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Ville</span>
            <input v-model="form.city" type="text" class="input-base" placeholder="Yaoundé" />
          </label>

          <label class="space-y-2">
            <span class="text-sm font-semibold text-slate-700">Pays</span>
            <div ref="countryMenuRef" class="relative">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-200 hover:bg-violet-50/30"
                :disabled="countryLoading"
                @click="countryMenuOpen = !countryMenuOpen"
              >
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Pays sélectionné</p>
                  <p class="mt-1 truncate text-sm font-semibold text-slate-900">
                    {{ selectedCountryLabel }}
                  </p>
                </div>
                <ChevronDownIcon class="h-5 w-5 shrink-0 text-slate-400" />
              </button>

              <div
                v-if="countryMenuOpen"
                class="absolute left-0 right-0 bottom-full z-20 mb-2 max-h-72 overflow-auto rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              >
                <button
                  v-for="country in countryOptions"
                  :key="country.value"
                  type="button"
                  class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition"
                  :class="form.country === country.value
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'"
                  @click="form.country = country.value; countryMenuOpen = false"
                >
                  <span class="truncate text-sm font-semibold">{{ country.label }}</span>
                  <span
                    v-if="form.country === country.value"
                    class="h-2.5 w-2.5 rounded-full bg-violet-600"
                  />
                </button>
              </div>
            </div>
          </label>

          <div class="space-y-2 md:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Services</span>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="service in serviceOptions"
                :key="service.id"
                class="flex cursor-pointer items-start gap-3 rounded-[1rem] border px-4 py-3 transition"
                :class="form.service_ids.includes(service.id)
                  ? 'border-violet-200 bg-violet-50/60 ring-1 ring-violet-100'
                  : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30'"
              >
                <input
                  v-model="form.service_ids"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  :value="service.id"
                />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-900">{{ service.name }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ service.description || 'Service disponible' }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <p v-if="error" class="mt-5 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </p>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.16)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="saving"
            @click="saveInformation"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
          <button
            type="button"
            class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
            :disabled="saving"
            @click="resetForm"
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/services/api'
import Loader from '@/components/Loader.vue'
import { useAppStore } from '@/stores/app'
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const app = useAppStore()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const providerProfile = ref(null)
const serviceOptions = ref([])
const countryLoading = ref(false)
const countryOptions = ref([])
const countryMenuOpen = ref(false)
const countryMenuRef = ref(null)

const form = reactive({
  bio: '',
  experience_years: 0,
  home_address: '',
  city: '',
  country: '',
  service_ids: [],
})

const selectedCountryLabel = computed(() => {
  const found = countryOptions.value.find((country) => country.value === form.country)
  return found?.label || form.country || 'Choisir un pays'
})

function normalizeServices(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item && typeof item === 'object') return Number(item.id || item.service_id || 0)
      return Number(item || 0)
    })
    .filter((item) => item > 0)
}

function normalizeCountryItem(item) {
  const code = String(item?.dial_code || '').trim()
  const name = String(item?.country_name || item?.name || item?.country || item?.label || '').trim()
  const value = name || code
  return {
    value,
    label: code ? `${name || code} (${code})` : (name || 'Pays'),
  }
}

function resetForm() {
  const provider = providerProfile.value || {}
  Object.assign(form, {
    bio: provider.bio || '',
    experience_years: Number(provider.experience_years || 0),
    home_address: provider.home_address || '',
    city: provider.city || '',
    country: provider.country || '',
    service_ids: normalizeServices(provider.services),
  })
  error.value = ''
}

async function loadServices() {
  try {
    const { data } = await api.get('/provider/services', { params: { per_page: 100 } })
    const items = Array.isArray(data?.data?.items)
      ? data.data.items
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []

    serviceOptions.value = items.map((service) => ({
      id: Number(service.id),
      name: service.name || `Service #${service.id}`,
      description: service.description || '',
    }))

    if (!serviceOptions.value.length && providerProfile.value?.services) {
      serviceOptions.value = normalizeServices(providerProfile.value.services).map((id) => ({
        id,
        name: `Service #${id}`,
        description: '',
      }))
    }
  } catch {
    serviceOptions.value = normalizeServices(providerProfile.value?.services).map((id) => ({
      id,
      name: `Service #${id}`,
      description: '',
    }))
  }
}

async function loadCountries() {
  countryLoading.value = true
  try {
    const { data } = await api.get('/country-codes', { params: { per_page: 250 } })
    const items = Array.isArray(data?.data?.items)
      ? data.data.items
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []
    countryOptions.value = items
      .map(normalizeCountryItem)
      .filter((item) => item.value)
      .sort((a, b) => a.label.localeCompare(b.label))
  } catch {
    countryOptions.value = [
      { value: 'Cameroun', label: 'Cameroun' },
    ]
  } finally {
    countryLoading.value = false
  }
}

async function loadInformation() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get('/profile')
    const payload = data?.data || null
    providerProfile.value = payload?.provider_profile || null

    if (payload?.user) {
      app.updateProfile({
        name: payload.user.name || '',
        email: payload.user.email || '',
        phone: payload.user.phone || '',
      })
    }

    resetForm()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de charger les informations.'
    resetForm()
  } finally {
    loading.value = false
  }
}

async function saveInformation() {
  saving.value = true
  error.value = ''

  try {
    const provider = providerProfile.value || {}
    const payload = {
      bio: form.bio.trim(),
      experience_years: Number(form.experience_years || 0),
      latitude: provider.latitude || null,
      longitude: provider.longitude || null,
      home_address: form.home_address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      profile_photo_url: provider.profile_photo_url || null,
      cni_front_url: provider.cni_front_url || null,
      cni_back_url: provider.cni_back_url || null,
      service_ids: Array.isArray(form.service_ids) ? form.service_ids.map((value) => Number(value)).filter((value) => value > 0) : [],
    }

    const { data } = await api.put('/provider/profile', payload)
    const updated = data?.data?.provider_profile || providerProfile.value
    providerProfile.value = updated

    app.pushToast({
      type: 'success',
      title: 'Informations enregistrées',
      message: data?.message || 'Les informations du prestataire ont été mises à jour.',
    })

    router.replace('/provider/profile/informations')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible d’enregistrer les informations.'
  } finally {
    saving.value = false
  }
}

function closeCountryMenuOnOutsideClick(event) {
  if (!countryMenuOpen.value) return
  if (!countryMenuRef.value) return
  if (countryMenuRef.value.contains(event.target)) return
  countryMenuOpen.value = false
}

onMounted(async () => {
  await loadInformation()
  await Promise.all([loadServices(), loadCountries()])
})

onMounted(() => {
  document.addEventListener('click', closeCountryMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeCountryMenuOnOutsideClick)
})
</script>
