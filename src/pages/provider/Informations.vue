<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <div class="flex items-center justify-between gap-3">
      <RouterLink
        to="/provider/profile"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
      >
        <ArrowLeftIcon class="h-4 w-4" />
        Retour
      </RouterLink>

      <RouterLink
        to="/provider/profile/informations/edit"
        class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
      >
        <PencilSquareIcon class="h-4 w-4" />
        Editer
      </RouterLink>
    </div>

    <Loader v-if="loading" class="py-8" />

    <template v-else>
      <section class="card-surface overflow-hidden p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1.15rem] bg-slate-100 ring-1 ring-slate-200">
            <img
              v-if="profilePhoto"
              :src="profilePhoto"
              :alt="profileLabel"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-violet-400 text-xl font-black text-white"
            >
              {{ initials }}
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="truncate text-2xl font-black tracking-tight text-slate-900">{{ profileLabel }}</h2>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="availabilityClass">
                {{ availabilityLabel }}
              </span>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="verificationClass">
                {{ verificationLabel }}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ account.email || 'Email non renseigné' }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ account.phone || 'Téléphone non renseigné' }}</p>
          </div>
        </div>
      </section>

      <section class="grid gap-4 md:grid-cols-2">
        <div class="rounded-[1rem] border border-slate-200 bg-white p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Bio</p>
          <p class="mt-2 text-sm leading-6 text-slate-900">
            {{ providerProfile?.bio || 'Aucune biographie disponible.' }}
          </p>
        </div>

        <div class="rounded-[1rem] border border-slate-200 bg-white p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Compétences</p>
          <div v-if="skills.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="skill in skills"
              :key="skill"
              class="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
            >
              {{ skill }}
            </span>
          </div>
          <p v-else class="mt-2 text-sm font-semibold text-slate-900">Aucune compétence renseignée</p>
        </div>

        <div class="rounded-[1rem] border border-slate-200 bg-white p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Expérience</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ Number(providerProfile?.experience_years || 0) }} ans
          </p>
        </div>

        <div class="rounded-[1rem] border border-slate-200 bg-white p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Disponibilité</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ availabilityLabel }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ availabilityTimeLabel }}
          </p>
          <div v-if="availabilityDayLabels.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="day in availabilityDayLabels"
              :key="day"
              class="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700"
            >
              {{ day }}
            </span>
          </div>
        </div>

        <div class="rounded-[1rem] border border-slate-200 bg-white p-4 md:col-span-2">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Adresse</p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ providerProfile?.home_address || 'Adresse non renseignée' }} - {{ providerProfile?.city || 'Ville non renseignée' }}
          </p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ providerProfile?.country || 'Pays non renseigné' }}
          </p>
          <div v-if="providerProfile?.latitude && providerProfile?.longitude" class="mt-3">
            <a
              :href="`https://maps.google.com/?q=${providerProfile.latitude},${providerProfile.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <MapPinIcon class="h-3 w-3" />
              Ouvrir la carte
            </a>
          </div>
        </div>

        <div class="rounded-[1rem] border border-slate-200 bg-white p-4 md:col-span-2">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Services associés</p>
          <div v-if="serviceLabels.length" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="service in serviceLabels"
              :key="service"
              class="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {{ service }}
            </span>
          </div>
          <p v-else class="mt-2 text-sm font-semibold text-slate-900">Aucun service associé</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import Loader from '@/components/Loader.vue'
import { useAppStore } from '@/stores/app'
import { ArrowLeftIcon, MapPinIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const app = useAppStore()
const loading = ref(false)
const providerProfile = ref(null)

const account = computed(() => providerProfile.value?.user || app.user || app.profile || {
  name: 'FlexiCare User',
  email: 'user@flexicare.app',
  phone: '+234 800 000 0000',
})

const profileLabel = computed(() => account.value?.name || 'Prestataire FlexiCare')
const initials = computed(() =>
  (profileLabel.value || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const profilePhoto = computed(() => providerProfile.value?.profile_photo_url || '')
const skills = computed(() => Array.isArray(providerProfile.value?.skills) ? providerProfile.value.skills : [])
const serviceLabels = computed(() => {
  const items = Array.isArray(providerProfile.value?.services) ? providerProfile.value.services : []
  return items
    .map((service) => service?.name || service?.label || `Service #${service?.id}`)
    .filter(Boolean)
})

const availabilityLabel = computed(() =>
  providerProfile.value?.availability_status === 'available'
    ? 'Disponible'
    : providerProfile.value?.availability_status === 'busy'
      ? 'Occupé'
      : providerProfile.value?.availability_status === 'offline'
        ? 'Hors ligne'
        : providerProfile.value?.availability_status || 'Non renseignée'
)

const availabilityClass = computed(() =>
  providerProfile.value?.availability_status === 'available'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-slate-100 text-slate-600'
)

const verificationLabel = computed(() =>
  providerProfile.value?.verification_status === 'certified'
    ? 'Certifié'
    : providerProfile.value?.verification_status || 'Non renseigné'
)

const verificationClass = computed(() =>
  providerProfile.value?.verification_status === 'certified'
    ? 'bg-violet-50 text-violet-700'
    : 'bg-slate-100 text-slate-600'
)

const availabilityTimeLabel = computed(() => {
  const start = providerProfile.value?.availability_start_time ? String(providerProfile.value.availability_start_time).slice(0, 5) : ''
  const end = providerProfile.value?.availability_end_time ? String(providerProfile.value.availability_end_time).slice(0, 5) : ''
  if (!start && !end) return 'Aucune plage horaire renseignée'
  if (start && end) return `${start} - ${end}`
  return start || end
})

const availabilityDayLabels = computed(() => {
  const days = Array.isArray(providerProfile.value?.availability_days) ? providerProfile.value.availability_days : []
  const abbreviations = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim',
  }

  return days
    .map((day) => abbreviations[String(day).toLowerCase()] || String(day).slice(0, 3))
    .filter(Boolean)
})

const addressLabel = computed(() => {
  const address = providerProfile.value?.home_address || 'Adresse non renseignée'
  return [address, providerProfile.value?.city].filter(Boolean).join(' - ')
})

const locationLabel = computed(() => {
  const latitude = providerProfile.value?.latitude
  const longitude = providerProfile.value?.longitude
  if (latitude && longitude) {
    return `Latitude ${latitude}, Longitude ${longitude}`
  }
  return 'Aucune position renseignée'
})

async function loadProfile() {
  loading.value = true
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
  } catch (err) {
    console.warn('Provider profile load fallback', err?.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>
