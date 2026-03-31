<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-10">
    <div class="flex items-center justify-between gap-3">
      <RouterLink to="/client/profile"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700">
        <ArrowLeftIcon class="h-4 w-4" />
        Retour
      </RouterLink>

      <RouterLink to="/client/profile/edit"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700">
        <PencilSquareIcon class="h-4 w-4" />
        Éditer
      </RouterLink>
    </div>
    <div v-if="loading" class="rounded-[1rem] bg-white p-6 ">
      <p class="text-sm font-semibold text-slate-500">Chargement du profil...</p>
    </div>

    <div v-else-if="error" class="rounded-[0.5rem] bg-white p-6 ">
      <p class="text-sm font-semibold text-rose-600">{{ error }}</p>
    </div>

    <template v-else>
      <section class="rounded-[0.5rem] border p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-[0.5rem] bg-gradient-to-br from-violet-600 to-violet-400 text-xl font-black text-white">
            {{ initials }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="flex-wrap text-xl font-black tracking-tight text-slate-900">{{ profileLabel }}</h2>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ account.email }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ account.phone }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-[0.5rem] border border-slate-200 bg-white p-4 ">

          <div v-if="profile.latitude && profile.longitude" class="mt-3">
            <a :href="`https://maps.google.com/?q=${profile.latitude},${profile.longitude}`" target="_blank"
              rel="noopener noreferrer">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Adresse</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ profile.address || 'Non renseignée' }} - {{
                profile.city }}</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ profile.country || 'Non renseigné' }}</p>
            </a>
          </div>
        </div>
        <div class="rounded-[0.5rem] border border-slate-200 bg-white p-4 ">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Contact d'urgence</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ profile.emergency_contact_name || 'Non renseigné' }}
          </p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ profile.emergency_contact_phone || 'Non renseigné' }}
          </p>
        </div>
        <div class="rounded-[0.5rem] border border-slate-200 bg-white p-4  md:col-span-2">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Notes</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">{{ profile.notes || 'Aucune note' }}</p>
        </div>
        <div class="rounded-[0.5rem] border border-slate-200 bg-white p-4  md:col-span-2 xl:col-span-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Préférences</p>
          <div v-if="preferenceLabels.length" class="mt-3 flex flex-wrap gap-2">
            <span v-for="pref in preferenceLabels" :key="pref"
              class="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {{ pref }}
            </span>
          </div>
          <p v-else class="mt-2 text-sm font-semibold text-slate-900">Aucune préférence renseignée</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'
import { useMissionStore } from '@/stores/missions'
import { ArrowLeftIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const app = useAppStore()
const missions = useMissionStore()

const loading = ref(false)
const error = ref('')
const hasProfile = ref(false)
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
const services = ref([])

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

const preferenceLabels = computed(() => normalizePreferences(profile.value.preferences))

async function loadServices() {
  try {
    const { data } = await api.get('/client/services', { params: { per_page: 15 } })
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    services.value = items.map((service) => ({
      id: service.id,
      name: service.name || `Service #${service.id}`,
    }))
  } catch {
    services.value = []
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
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadServices(), loadProfile()])
})
</script>
