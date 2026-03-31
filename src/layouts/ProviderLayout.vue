<template>
  <div class="page-shell">
    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="hidden lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:flex-col lg:gap-6 lg:self-start">
        <div class="rounded-lg border border-violet-300/30 bg-violet-600 p-5 text-white shadow-[0_14px_34px_rgba(124,58,237,0.2)]">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/15">
              <SparklesIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.24em] text-violet-100">FlexiCare</p>
              <h2 class="text-lg font-black tracking-tight text-white">Provider Hub</h2>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <div>
              <p class="text-[10px] uppercase tracking-[0.24em] text-violet-100">Compte</p>
              <p class="text-sm font-semibold text-white">Prestataire</p>
            </div>
            <ProfileMenu role="provider" />
          </div>

          <div class="mt-6 space-y-2 overflow-y-auto pr-1">
            <RouterLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
              :class="route.path.startsWith(item.to) ? 'bg-white/15 text-white' : 'text-violet-100 hover:bg-white/10 hover:text-white'"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </aside>

      <section class="flex flex-col gap-5">
        <div class="rounded-[50px] border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_55%,#a855f7_100%)] py-4 px-5 text-white lg:hidden">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h1 class="text-2xl font-black tracking-tight text-white">FlexiCare</h1>
            </div>

            <button
              class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm shadow-black/10 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="availabilityLoading"
              @click="toggle"
            >
              <span class="flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :class="isOnline ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
              </span>
            </button>
          </div>
        </div>

        <RouterView />
      </section>
    </div>
    <BottomNav role="provider" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { SparklesIcon, HomeIcon, BriefcaseIcon, BanknotesIcon, UserCircleIcon } from '@heroicons/vue/24/solid'
import BottomNav from '@/components/BottomNav.vue'
import { useAppStore } from '@/stores/app'
import { useMissionStore } from '@/stores/missions'

const missions = useMissionStore()
const app = useAppStore()
const route = useRoute()
const isOnline = computed(() => missions.providerStatus === 'online')
const availabilityLoading = ref(false)

const nav = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/provider/missions', label: 'Missions', icon: BriefcaseIcon },
  { to: '/provider/earnings', label: 'Revenus', icon: BanknotesIcon },
  { to: '/provider/profile', label: 'Profil', icon: UserCircleIcon },
]

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

const toggle = async () => {
  if (availabilityLoading.value) return

  availabilityLoading.value = true
  try {
    if (!isOnline.value) {
      const coords = await getCurrentPosition()
      await missions.setProviderStatus('online', coords)
      app.pushToast({
        type: 'success',
        title: 'Disponibilité activée',
        message: 'Votre position a été envoyée au backend.',
      })
    } else {
      await missions.setProviderStatus('offline')
      app.pushToast({
        type: 'info',
        title: 'Hors ligne',
        message: 'Vous n’êtes plus visible dans le matching.',
      })
    }
  } catch (error) {
    app.pushToast({
      type: 'error',
      title: 'Disponibilité',
      message: error?.message || 'Impossible de mettre à jour la disponibilité.',
    })
  } finally {
    availabilityLoading.value = false
  }
}

onMounted(() => {
  missions.fetchProviderDashboard()
  missions.fetchProviderMissions()
})
</script>
