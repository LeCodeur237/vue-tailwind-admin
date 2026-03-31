<template>
  <div class="space-y-5 pb-16 sm:pb-20 lg:pb-24">
    <RouterLink
      to="/client/missions"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
    >
      <span aria-hidden="true">←</span>
      Retour
    </RouterLink>

    <Loader v-if="loading" class="py-8" />

    <div v-else-if="error" class="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <p class="text-sm font-semibold text-rose-600">{{ error }}</p>
    </div>

    <section v-else class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div class="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <div class="relative aspect-[4/5] min-h-[420px] overflow-hidden bg-slate-100">
          <iframe
            v-if="mapUrl"
            :src="mapUrl"
            class="pointer-events-none h-full w-full"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Carte de la mission"
          />

          <div class="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.10),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.30)_100%)]">
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div class="flex flex-col items-center gap-4">
                <div class="relative flex h-24 w-24 items-center justify-center">
                  <span class="client-pin-wave" />
                  <span class="absolute inset-4 rounded-full border border-violet-400/35" />
                  <div class="client-pin-core">
                    <span class="client-pin-dot" />
                  </div>
                </div>

                <div class="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                  <span class="inline-flex items-center gap-2">
                    <span>Client point of reference</span>
                    <span class="flex items-center gap-1">
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.2s]" />
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.1s]" />
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="space-y-4">
        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Matching</p>
          <div class="mt-3 space-y-3">
            <div class="flex items-center gap-3 rounded-[1.25rem] border border-violet-100 bg-gradient-to-r from-violet-50/80 via-white to-violet-50/60 p-4 shadow-[0_10px_24px_rgba(124,58,237,0.05)]">
              <div class="relative flex h-10 w-10 items-center justify-center">
                <span class="mini-pin-wave" />
                <span class="mini-pin-core" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">Finding the best provider</p>
                <p class="mt-1 text-xs text-slate-500">The mission is live and the engine is ranking providers.</p>
              </div>
            </div>

            <div class="rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Mission</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">{{ mission?.title || 'Waiting...' }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ mission?.address || 'No address yet' }}</p>
              <p class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">{{ statusLabel }}</p>
            </div>

            <div v-if="tracking.provider" class="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-500">Assigned provider</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ tracking.provider.user?.name || tracking.provider.name || 'Provider' }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                Distance: {{ formatDistance(tracking.distance_km) }} - ETA: {{ tracking.eta_minutes || 0 }} min
              </p>
              <p v-if="tracking.provider_last_seen_at" class="mt-1 text-xs text-slate-500">
                Last seen: {{ formatDateTime(tracking.provider_last_seen_at) }}
              </p>
            </div>

            <p class="text-sm leading-6 text-slate-500">
              Once a provider is assigned, you will be redirected to the mission detail automatically.
            </p>
          </div>
        </section>

        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Matches</p>
          <div class="mt-3 space-y-3">
            <div v-if="matchesLoading" class="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Loading nearby providers...
            </div>

            <div
              v-for="match in matches"
              :key="match.provider.id"
              class="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">
                    {{ match.provider.user?.name || match.provider.name || 'Provider' }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ formatDistance(match.distance_km) }} - Score {{ match.score }}
                  </p>
                </div>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  :class="match.provider.verification_status === 'certified'
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-slate-100 text-slate-600'"
                >
                  {{ match.provider.verification_status || 'unknown' }}
                </span>
              </div>

              <p class="mt-3 text-xs text-slate-500">
                {{ providerSkills(match.provider) }}
              </p>
              <p v-if="match.provider.level?.name" class="mt-1 text-xs text-slate-500">
                Level: {{ match.provider.level.name }}
              </p>
            </div>

            <div v-if="!matchesLoading && matches.length === 0" class="rounded-[1.1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No provider found yet.
            </div>
          </div>
        </section>
      </aside>
    </section>

  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'
import { useMissionStore } from '@/stores/missions'

const route = useRoute()
const router = useRouter()
const missions = useMissionStore()

const loading = ref(false)
const error = ref('')
const mission = ref(null)
const matches = ref([])
const matchesLoading = ref(false)
const tracking = ref({
  mission: null,
  provider: null,
  distance_km: null,
  eta_minutes: null,
  provider_last_seen_at: null,
})
const refreshHandle = ref(null)
const matchingStarted = ref(false)

function formatMapUrl(latitude, longitude) {
  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return ''
  }

  const lat = Number(latitude)
  const lon = Number(longitude)
  const delta = 0.01
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta]
    .map((value) => value.toFixed(6))
    .join('%2C')

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lon.toFixed(6)}`
}

function formatDistance(value) {
  const km = Number(value || 0)
  return `${km.toFixed(km < 1 ? 2 : 1)} km`
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function providerSkills(provider) {
  const skills = Array.isArray(provider?.skills) ? provider.skills : []
  return skills.length ? skills.join(', ') : 'No skills listed'
}

const hasCoordinates = computed(() => Boolean(mission.value?.latitude && mission.value?.longitude))
const mapUrl = computed(() => formatMapUrl(mission.value?.latitude, mission.value?.longitude))
const statusLabel = computed(() => {
  if (!mission.value) return 'Waiting'
  if (mission.value.status === 'pending') return 'Searching for provider'
  if (mission.value.status === 'assigned') return 'Provider found'
  if (mission.value.status === 'in_progress') return 'Mission in progress'
  if (mission.value.status === 'completed') return 'Completed'
  if (mission.value.status === 'cancelled') return 'Cancelled'
  return mission.value.status
})

async function loadMission() {
  const { data } = await api.get(`/client/missions/${route.params.id}`)
  const raw = data?.data || null

  if (!data?.success || !raw) {
    throw new Error('Mission not found.')
  }

  const mapped = missions.findClientMission(raw.id) || raw
  mission.value = {
    id: raw.id,
    title: raw.title || mapped.title || 'Mission FlexiCare',
    service_name: raw.service?.name || mapped.service || 'Mission FlexiCare',
    address: raw.address || mapped.address || '',
    status: raw.status || mapped.status || 'pending',
    latitude: raw.latitude ?? mapped.latitude ?? null,
    longitude: raw.longitude ?? mapped.longitude ?? null,
  }
}

async function loadMatches() {
  matchesLoading.value = true
  try {
    const { data } = await api.get(`/client/missions/${route.params.id}/matches`, {
      params: { limit: 10 },
    })
    const payload = data?.data || {}
    const items = Array.isArray(payload.matches) ? payload.matches : []
    matches.value = items.map((item) => ({
      score: Number(item.score || 0),
      distance_km: Number(item.distance_km || 0),
      provider: item.provider || {},
    }))

    if (payload.mission) {
      const raw = payload.mission
      mission.value = {
        id: raw.id,
        title: raw.title || mission.value?.title || 'Mission FlexiCare',
        service_name: raw.service?.name || mission.value?.service_name || 'Mission FlexiCare',
        address: raw.address || mission.value?.address || '',
        status: raw.status || mission.value?.status || 'pending',
        latitude: raw.latitude ?? mission.value?.latitude ?? null,
        longitude: raw.longitude ?? mission.value?.longitude ?? null,
      }
    }
  } finally {
    matchesLoading.value = false
  }
}

async function loadTracking() {
  try {
    const { data } = await api.get(`/client/missions/${route.params.id}/tracking`)
    const payload = data?.data || {}
    tracking.value = {
      mission: payload.mission || null,
      provider: payload.provider || null,
      distance_km: payload.distance_km ?? null,
      eta_minutes: payload.eta_minutes ?? null,
      provider_last_seen_at: payload.provider_last_seen_at || null,
    }
  } catch {
    tracking.value = {
      mission: null,
      provider: null,
      distance_km: null,
      eta_minutes: null,
      provider_last_seen_at: null,
    }
  }
}

async function assignBestProvider() {
  if (matchingStarted.value) return
  matchingStarted.value = true
  try {
    await api.post(`/client/missions/${route.params.id}/matches/assign-best`)
    await loadMission()
    await loadMatches()
    await loadTracking()

    if (mission.value?.status && mission.value.status !== 'pending') {
      window.setTimeout(() => {
        router.replace(`/client/missions/${mission.value.id}`)
      }, 1200)
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to start matching.'
  }
}

async function refreshState() {
  await loadMission()
  await loadMatches()

  if (mission.value?.status === 'pending') {
    await assignBestProvider()
    return
  }

  if (mission.value?.status === 'assigned') {
    await loadTracking()
    window.setTimeout(() => {
      router.replace(`/client/missions/${mission.value.id}`)
    }, 1200)
  }
}

function startPolling() {
  stopPolling()
  refreshHandle.value = window.setInterval(async () => {
    if (!mission.value?.id) return
    try {
      await loadMission()
      await loadMatches()
      if (mission.value?.status === 'assigned' || mission.value?.status === 'in_progress' || mission.value?.status === 'completed' || mission.value?.status === 'cancelled') {
        await loadTracking()
        stopPolling()
        router.replace(`/client/missions/${mission.value.id}`)
      }
    } catch {
      // silent retry
    }
  }, 8000)
}

function stopPolling() {
  if (refreshHandle.value) {
    clearInterval(refreshHandle.value)
    refreshHandle.value = null
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    await refreshState()
    if (mission.value?.status === 'pending' || mission.value?.status === 'assigned') {
      startPolling()
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load mission search.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.client-pin-wave {
  position: absolute;
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: rgba(124, 58, 237, 0.18);
  box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.28);
  animation: client-wave 1.4s ease-out infinite;
}

.client-pin-core {
  position: relative;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  background: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 30px rgba(124, 58, 237, 0.38);
  z-index: 1;
}

.client-pin-dot {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 9999px;
  background: white;
}

.mini-pin-wave {
  position: absolute;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: rgba(124, 58, 237, 0.18);
  animation: mini-wave 1.4s ease-out infinite;
}

.mini-pin-core {
  position: relative;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  background: #7c3aed;
  box-shadow: 0 0 0 6px rgba(124, 58, 237, 0.12);
  z-index: 1;
}

@keyframes client-wave {
  0% {
    transform: scale(0.55);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.6);
    opacity: 0.16;
  }
  100% {
    transform: scale(2.1);
    opacity: 0;
  }
}

@keyframes mini-wave {
  0% {
    transform: scale(0.7);
    opacity: 0.75;
  }
  70% {
    transform: scale(1.7);
    opacity: 0.14;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
</style>
