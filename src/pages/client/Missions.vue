<template>
  <div class="min-w-0 space-y-4 overflow-x-hidden px-3 pb-2 sm:px-0 sm:pb-5 lg:pb-4">
    <section class="rounded-[0.5rem] border border-slate-200 bg-white p-5 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Mes missions</h1>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Suivez votre dernière mission active ou terminée.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            to="/client/missions/create"
            class="inline-flex items-center gap-2 rounded-[0.5rem] border border-slate-200 bg-violet-600 px-4 py-4 text-sm font-semibold text-white transition hover:border-violet-200 hover:text-white-700"
          >
           <i class="fa fa-add"></i>  Créer une mission
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="rounded-[1.5rem] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="section-title">En vedette</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Dernière mission active</h2>
        </div>
        <RouterLink
          to="/client/missions/all"
          class="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
        >
          Voir plus
        </RouterLink>
      </div>

      <Loader v-if="missions.loading.list" class="mt-4" />

      <div v-else-if="featuredMission" class="mt-4">
        <MissionCard :mission="featuredMission" role="client" />
      </div>

      <div
        v-else
        class="mt-4 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500"
      >
        Aucune mission récente à afficher.
        <div class="mt-4">
          <RouterLink
            to="/client/missions/create"
            class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Créer une mission
          </RouterLink>
        </div>
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

const summary = computed(() => missions.clientSummary)

function pickFeaturedMission(items) {
  const ordered = [...items].sort((a, b) => {
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
}

const featuredMission = computed(() => pickFeaturedMission(missions.clientMissions))
const featuredMissionLabel = computed(() => {
  if (!featuredMission.value) return 'Vide'
  if (featuredMission.value.status === 'in_progress') return 'En cours'
  if (featuredMission.value.status === 'assigned') return 'Attribuée'
  if (featuredMission.value.status === 'completed') return 'Terminée'
  if (featuredMission.value.status === 'pending') return 'Créée'
  return 'Récente'
})

onMounted(() => {
  missions.fetchClientDashboard()
  missions.loadClientMissions({ perPage: 10 })
})
</script>
