<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <section class="p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="text-lg font-black tracking-tight text-slate-900">
            {{ hasProfile ? 'Mise à jour du profil' : 'Création du profil' }}
          </h3>
          <p v-if="setupHint" class="mt-2 text-sm text-violet-700 leading-6 text-slate-500">
            {{ setupHint }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="mt-5 rounded-[1rem] border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Chargement du profil...
      </div>

      <div v-else class="mt-5 space-y-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-500">
              Étape {{ currentStep + 1 }}/3
            </p>
            <h4 class="mt-1 text-lg font-black tracking-tight text-slate-900">
              {{ stepTitle }}
            </h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-2.5 rounded-full transition-all" :class="currentStep === 0 ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'" />
            <span class="h-2.5 rounded-full transition-all" :class="currentStep === 1 ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'" />
            <span class="h-2.5 rounded-full transition-all" :class="currentStep === 2 ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'" />
          </div>
        </div>

        <template v-if="currentStep === 0">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 md:col-span-2">
              <span class="text-sm font-semibold text-slate-700">Adresse</span>
              <input v-model="form.address" type="text" class="input-base" placeholder="Immeuble Empereur" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Ville</span>
              <input v-model="form.city" type="text" class="input-base" placeholder="Douala" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Pays</span>
              <input v-model="form.country" type="text" class="input-base" placeholder="Cameroun" />
            </label>
          </div>
        </template>

        <template v-else-if="currentStep === 1">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Contact urgence</span>
              <input v-model="form.emergency_contact_name" type="text" class="input-base" placeholder="Jane Doe" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Téléphone urgence</span>
              <input v-model="form.emergency_contact_phone" type="tel" class="input-base" placeholder="+2348000000000" />
            </label>

            <label class="space-y-2 md:col-span-2">
              <span class="text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                v-model="form.notes"
                rows="4"
                class="input-base resize-none"
                placeholder="Prefers morning slots"
              />
            </label>
          </div>
        </template>

        <template v-else>
          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">Position</p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ hasCoordinates ? `Latitude ${form.latitude}, Longitude ${form.longitude}` : 'Aucune position détectée' }}
                </p>
              </div>
              <button
                type="button"
                class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                :disabled="locationLoading"
                @click="detectLocation"
              >
                {{ locationLoading ? 'Recherche...' : 'Utiliser ma position' }}
              </button>
            </div>
          </div>

          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">Préférences</p>
                <p class="mt-1 text-sm text-slate-500">Choisis les services que tu veux voir en priorité.</p>
              </div>
              <span class="text-xs font-semibold text-slate-400">{{ form.preferences.length }} sélectionnée(s)</span>
            </div>

            <div v-if="servicesLoading" class="mt-4 text-sm text-slate-500">Chargement des services...</div>

            <div v-else class="mt-4 grid gap-3 sm:grid-cols-2">
              <label
                v-for="service in services"
                :key="service.id"
                class="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-slate-200 bg-white p-3 transition hover:border-violet-200"
              >
                <input
                  v-model="form.preferences"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  :value="service.name"
                />
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-900">{{ service.name }}</p>
                  <p class="mt-1 text-sm text-slate-500">{{ service.description || 'Service disponible' }}</p>
                </div>
              </label>
            </div>
          </div>
        </template>

        <p v-if="error" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </p>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            v-if="currentStep > 0"
            type="button"
            class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
            :disabled="saving"
            @click="previousStep"
          >
            Retour
          </button>
          <button
            v-if="currentStep < 2"
            type="button"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.16)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="saving"
            @click="nextStep"
          >
            Continuer
          </button>
          <button
            v-else
            type="button"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.16)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? 'Enregistrement...' : hasProfile ? 'Mettre à jour' : 'Créer mon profil' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'
import { useMissionStore } from '@/stores/missions'
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const app = useAppStore()
const missions = useMissionStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const servicesLoading = ref(false)
const saving = ref(false)
const locationLoading = ref(false)
const error = ref('')
const currentStep = ref(0)
const hasProfile = ref(false)
const services = ref([])

const profile = ref({
  address: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: '',
  preferences: [],
})

const form = reactive({
  address: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: '',
  preferences: [],
})

const account = computed(() => app.user || app.profile || {
  name: 'FlexiCare User',
  email: 'user@flexicare.app',
  phone: '+234 800 000 0000',
})

const profileLabel = computed(() => account.value?.name || 'Client FlexiCare')
const initials = computed(() =>
  (profileLabel.value || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const setupHint = computed(() => {
  if (!hasProfile.value) {
    return "Votre profil n'existe pas encore. Remplissez le formulaire pour commencer."
  }
  if (route.query.setup === '1') {
    return "Nous avons détecté que votre profil n'est pas encore complet. Vous pouvez le mettre à jour maintenant."
  }
  return ''
})

const hasCoordinates = computed(() => Boolean(form.latitude && form.longitude))

const stepTitle = computed(() => {
  if (currentStep.value === 0) return 'Coordonnées'
  if (currentStep.value === 1) return 'Urgence et notes'
  return 'Position et préférences'
})

function normalizePreferences(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item && typeof item === 'object') {
        return String(item.name || item.label || item.value || item.id || '').trim()
      }
      return String(item || '').trim()
    })
    .filter(Boolean)
    .map(resolvePreferenceLabel)
}

function resolvePreferenceLabel(item) {
  const token = String(item || '').trim()
  if (!token) return ''
  const match = services.value.find((service) => String(service.id) === token || service.name === token)
  return match ? match.name : token
}

function syncDraft(source) {
  form.address = source?.address || ''
  form.city = source?.city || ''
  form.country = source?.country || ''
  form.latitude = source?.latitude ? String(source.latitude) : ''
  form.longitude = source?.longitude ? String(source.longitude) : ''
  form.emergency_contact_name = source?.emergency_contact_name || ''
  form.emergency_contact_phone = source?.emergency_contact_phone || ''
  form.notes = source?.notes || ''
  form.preferences = normalizePreferences(source?.preferences)
}

function resetForm() {
  syncDraft(profile.value)
  error.value = ''
  currentStep.value = 0
}

function nextStep() {
  if (currentStep.value < 2) {
    currentStep.value += 1
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

async function loadServices() {
  servicesLoading.value = true
  try {
    const { data } = await api.get('/client/services', { params: { per_page: 15 } })
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    services.value = items.map((service) => ({
      id: service.id,
      name: service.name || `Service #${service.id}`,
      description: service.description || '',
    }))
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de charger les services.'
  } finally {
    servicesLoading.value = false
  }
}

async function loadProfile() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get('/client/profile')
    const loaded = data?.data || null
    hasProfile.value = Boolean(loaded)
    profile.value = loaded || profile.value
    syncDraft(profile.value)
  } catch (err) {
    hasProfile.value = false
    error.value = err?.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

function detectLocation() {
  if (!navigator.geolocation) {
    error.value = 'La géolocalisation n est pas prise en charge par ce navigateur.'
    return
  }

  locationLoading.value = true
  error.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = String(position.coords.latitude)
      form.longitude = String(position.coords.longitude)
      locationLoading.value = false
    },
    (err) => {
      locationLoading.value = false
      error.value = err?.message || 'Impossible de récupérer la position.'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

async function saveProfile() {
  error.value = ''
  saving.value = true

  try {
    const payload = {
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      preferences: form.preferences,
      emergency_contact_name: form.emergency_contact_name.trim(),
      emergency_contact_phone: form.emergency_contact_phone.trim(),
      notes: form.notes.trim(),
    }

    const { data } = await api.put('/client/profile', payload)
    const loaded = data?.data || null
    if (loaded) {
      hasProfile.value = true
      profile.value = loaded
      syncDraft(profile.value)
      app.updateProfile({
        address: loaded.address || '',
        city: loaded.city || '',
        country: loaded.country || '',
        emergency_contact_name: loaded.emergency_contact_name || '',
        emergency_contact_phone: loaded.emergency_contact_phone || '',
        notes: loaded.notes || '',
        preferences: loaded.preferences || [],
      })
    }

    app.pushToast({
      type: 'success',
      title: 'Profil enregistré',
      message: data?.message || 'Votre profil client a été sauvegardé.',
    })

    router.replace('/client/profile/details')
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible d enregistrer le profil.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadServices(), loadProfile()])
})
</script>
