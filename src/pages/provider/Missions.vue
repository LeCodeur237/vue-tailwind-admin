<template>
  <div class="space-y-6 pb-5 sm:pb-4 lg:pb-4">
    <section class="rounded-[0.9rem] border border-slate-200 bg-white p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="section-title">Prestataire</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Missions assignées</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Suivez votre mission la plus récente.
          </p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-3 gap-3">
        <div class="flex h-full flex-col rounded-[0.9rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <div class="flex flex-1 items-start justify-between gap-3">
            <div>
              <p class="text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400">Total</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-slate-900">{{ missions.providerMissions.length }}</p>
            </div>
          </div>
        </div>

        <div class="flex h-full flex-col rounded-[0.9rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <div class="flex flex-1 items-start justify-between gap-3">
            <div>
              <p class="text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400">En cours</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-slate-900">{{ inProgressCount }}</p>
            </div>
          </div>
        </div>

        <div class="flex h-full flex-col rounded-[0.9rem] border border-slate-200 bg-slate-50 px-4 py-4">
          <div class="flex flex-1 items-start justify-between gap-3">
            <div>
              <p class="text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400">Terminées</p>
              <p class="mt-2 text-2xl font-black tracking-tight text-slate-900">{{ completedCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white p-2 sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="section-title">En vedette</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Dernière mission active</h2>
        </div>
        <RouterLink
          v-if="featuredMission"
          to="/provider/missions/all"
          class="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
        >
          Voir plus
        </RouterLink>
      </div>

      <Loader v-if="missions.loading.provider" class="mt-4" />

      <div v-else-if="featuredMission" class="mt-4">
        <MissionCard :mission="featuredMission" role="provider" />
      </div>

      <div
        v-else
        class="mt-4 rounded-[0.9rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        Aucune mission récente à afficher.
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import MissionCard from '@/components/MissionCard.vue'
import Loader from '@/components/Loader.vue'
import { useMissionStore } from '@/stores/missions'

const missions = useMissionStore()

const featuredMission = computed(() => {
  const ordered = [...missions.providerMissions].sort((a, b) => {
    const left = new Date(a.updated_at || a.created_at || 0).getTime()
    const right = new Date(b.updated_at || b.created_at || 0).getTime()
    return right - left
  })

  const priorities = ['in_progress', 'assigned', 'completed', 'pending', 'cancelled']
  for (const status of priorities) {
    const match = ordered.find((mission) => mission.status === status)
    if (match) return match
  }
  return ordered[0] || null
})

const featuredMissionLabel = computed(() => {
  if (!featuredMission.value) return 'Vide'
  if (featuredMission.value.status === 'in_progress') return 'En cours'
  if (featuredMission.value.status === 'assigned') return 'Attribuée'
  if (featuredMission.value.status === 'completed') return 'Terminée'
  if (featuredMission.value.status === 'pending') return 'Créée'
  return 'Récente'
})

const inProgressCount = computed(() => missions.providerMissions.filter((mission) => mission.status === 'in_progress').length)
const completedCount = computed(() => missions.providerMissions.filter((mission) => mission.status === 'completed').length)

onMounted(() => {
  if (!missions.providerMissions.length) {
    missions.fetchProviderMissions()
  }
})
</script>
