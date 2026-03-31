<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Wallet</p>
          <div class="mt-2 flex items-end gap-3">
            <p class="text-3xl font-black tracking-tight text-slate-900">{{ formatMoney(missions.providerRevenue) }}</p>
            <span class="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600 ring-1 ring-violet-100">
              {{ missions.providerWallet.currency }}
            </span>
          </div>
          <p class="mt-2 text-sm text-slate-500">Solde actuel du compte prestataire.</p>
        </div>
        <div class="rounded-2xl bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
          <BanknotesIcon class="h-6 w-6" />
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Statut</p>
          <h2 class="mt-1 text-xl font-black tracking-tight text-slate-900">Disponibilité</h2>
          <p class="mt-2 text-sm text-slate-500">
            {{ availabilitySummary }}
          </p>
        </div>
        <StatusToggle
          :model-value="online"
          :disabled="availabilityLoading"
          @update:modelValue="handleAvailabilityToggle"
        />
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
          {{ availabilityModeLabel }}
        </span>
        <RouterLink
          to="/provider/preferences"
          class="text-sm font-semibold text-violet-600 transition hover:text-violet-500"
        >
          Modifier les créneaux
        </RouterLink>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Aujourd'hui</p>
          <h2 class="mt-1 text-xl font-black tracking-tight text-slate-900">Missions du jour</h2>
        </div>
        <RouterLink to="/provider/missions/all" class="text-sm font-semibold text-violet-600">Voir tout</RouterLink>
      </div>

      <Loader v-if="missions.loading.provider" />
      <div v-else class="mt-4 grid gap-3">
        <MissionCard
          v-for="mission in missions.providerTodayMissions"
          :key="mission.id"
          :mission="mission"
          role="provider"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BanknotesIcon } from '@heroicons/vue/24/solid'
import MissionCard from '@/components/MissionCard.vue'
import Loader from '@/components/Loader.vue'
import StatusToggle from '@/components/StatusToggle.vue'
import { useAppStore } from '@/stores/app'
import { useMissionStore } from '@/stores/missions'
import { formatMoney } from '@/utils/display'

const missions = useMissionStore()
const app = useAppStore()
const availabilityLoading = ref(false)
const online = computed(() => missions.providerStatus === 'online')

const availabilitySummary = computed(() => {
  const availability = missions.providerAvailability || {}
  const days = Array.isArray(availability.availability_days) ? availability.availability_days : []
  const labels = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mer',
    thursday: 'Jeu',
    friday: 'Ven',
    saturday: 'Sam',
    sunday: 'Dim',
  }

  const dayText = days.length ? days.map((day) => labels[day] || day).join(', ') : 'Aucun créneau défini'
  const start = availability.availability_start_time ? availability.availability_start_time.slice(0, 5) : ''
  const end = availability.availability_end_time ? availability.availability_end_time.slice(0, 5) : ''
  const timeText = start && end ? `• ${start} - ${end}` : ''

  return `${dayText} ${timeText}`.trim()
})

const availabilityModeLabel = computed(() => {
  return online.value ? 'Ouvert aux missions' : 'Indisponible'
})

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n’est pas prise en charge.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

async function handleAvailabilityToggle(nextValue) {
  availabilityLoading.value = true
  try {
    if (nextValue) {
      const coords = await getCurrentPosition()
      await missions.setProviderStatus('online', coords)
      app.pushToast({
        type: 'success',
        title: 'Disponibilité activée',
        message: 'Votre position a été envoyée au backend.',
      })
      return
    }

    await missions.setProviderStatus('offline')
    app.pushToast({
      type: 'info',
      title: 'Hors ligne',
      message: 'Vous n’êtes plus visible dans le matching.',
    })
  } catch (error) {
    app.pushToast({
      type: 'error',
      title: 'Disponibilité',
      message: error?.message || 'Impossible de mettre à jour votre disponibilité.',
    })
  } finally {
    availabilityLoading.value = false
  }
}

onMounted(() => {
  missions.fetchProviderDashboard()
})
</script>
