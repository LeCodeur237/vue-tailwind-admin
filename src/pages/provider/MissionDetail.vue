<template>
  <div class="space-y-5 pb-12 px-1 sm:pb-20 lg:pb-24">
    <RouterLink
      to="/provider/missions"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      Retour
    </RouterLink>

    <Loader v-if="loading" class="py-8" />

    <div v-else-if="error" class="rounded-[1.5rem] bg-white p-6">
      <p class="text-sm font-semibold text-rose-600">{{ error }}</p>
    </div>

    <div v-else-if="mission" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <section class="rounded-[0.75rem] bg-white p-5 sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="section-title">Mission</p>
            <h2 class="mt-2 text-[1.7rem] font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {{ mission.title }}
            </h2>
            <p class="mt-2 text-sm text-slate-500">
              {{ mission.address || 'Adresse non renseignee' }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
            <div class="rounded-[1rem] bg-violet-50 px-3 py-2 text-right ring-1 ring-violet-100">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">Montant net</p>
              <p class="mt-1 text-lg font-black tracking-tight text-violet-700">
                {{ formatMoney(netAmount) }}
              </p>
            </div>
            <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusPillClass]">
              {{ badge.label }}
            </span>
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Client</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ mission.client_name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ mission.client_phone || mission.client_email || '—' }}</p>
          </div>

          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Service</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ mission.service_name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ mission.service_category || 'Categorie non precisee' }}</p>
          </div>

          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Horaire</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ mission.schedule }}</p>
          </div>
        </div>

        <div class="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all"
            :style="{ width: `${mission.progress || 0}%` }"
          />
        </div>

        <div class="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Suivi</p>
          <div class="mt-2 flex items-center gap-2">
            <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', statusPillClass]">
              {{ badge.label }}
            </span>
            <span class="text-sm text-slate-500">Progression {{ mission.progress || 0 }}%</span>
          </div>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ missionHint }}
          </p>
        </div>

        <p class="mt-6 text-sm leading-7 text-slate-600">
          {{ mission.description || 'Aucune description fournie.' }}
        </p>

        <div
          v-if="mission.cancellation_reason"
          class="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700"
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-500">Motif d'annulation</p>
          <p class="mt-2">{{ mission.cancellation_reason }}</p>
        </div>

        <section class="mt-6 overflow-hidden rounded-[0.8rem] border border-slate-200 bg-slate-50">
          <button
            type="button"
            class="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
            @click="providerAccordionOpen = !providerAccordionOpen"
          >
            <div class="flex min-w-0 items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-white ring-1 ring-slate-200">
                <img
                  v-if="mission.provider_photo_url"
                  :src="mission.provider_photo_url"
                  :alt="mission.provider_name"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-sm font-black text-slate-400">
                  {{ providerInitials }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-lg font-black tracking-tight text-slate-900">
                    {{ mission.provider_name }}
                  </h3>
                  <span
                    v-if="providerVerificationLabel"
                    class="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700"
                  >
                    {{ providerVerificationLabel }}
                  </span>
                </div>
                <p class="mt-1 text-sm leading-6 text-slate-500">
                  {{ mission.provider_bio || 'Aucune biographie renseignee.' }}
                </p>
              </div>
            </div>

            <ChevronDownIcon
              class="mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform"
              :class="providerAccordionOpen ? 'rotate-180' : ''"
            />
          </button>

          <div v-if="providerAccordionOpen" class="border-t border-slate-200 px-4 pb-4 sm:px-5 sm:pb-5">
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Competences</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ providerSkills }}
                </p>
              </div>

              <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Disponibilite</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ providerAvailability }}
                </p>
              </div>
            </div>

            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Experience</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ mission.provider_experience_years ?? 0 }} ans
                </p>
              </div>

              <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Note</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ mission.provider_rating }}
                </p>
              </div>

              <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Jobs termines</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">
                  {{ mission.provider_completed_jobs }}
                </p>
              </div>
            </div>

            <div class="mt-3 rounded-[1.1rem] border border-slate-200 bg-white p-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Niveau</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ mission.provider_level || 'Standard' }}
              </p>
            </div>
          </div>
        </section>

        <section
          v-if="mission.status === 'completed' || mission.payment"
          class="mt-6 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4"
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Paiement</p>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-black tracking-tight text-slate-900">Paiement declenche</h3>
              <p class="mt-1 text-sm leading-6 text-slate-600">
                La mission est cloturee.
              </p>
            </div>
            <div class="rounded-[1rem] bg-white px-4 py-3 ring-1 ring-emerald-100">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600">Montant net</p>
              <p class="mt-1 text-lg font-black tracking-tight text-emerald-700">
                {{ formatMoney(netAmount) }}
              </p>
            </div>
          </div>
        </section>

        <section class="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Suivi</p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-slate-900">
                {{ mission.status === 'completed' ? 'Mission cloturee' : 'Mission en cours de suivi' }}
              </h3>
            </div>
            <span class="text-sm font-semibold text-slate-400">
              {{ mission.status === 'completed' ? 'Cloture' : 'En suivi' }}
            </span>
          </div>

          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Demarrage</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ mission.provider_started_at || mission.client_started_at ? 'Confirmé' : 'En attente' }}
              </p>
            </div>

            <div class="rounded-[1.1rem] border border-slate-200 bg-white p-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Fin</p>
              <p class="mt-2 text-sm font-semibold text-slate-900">
                {{ mission.provider_completed_at || mission.client_completed_at ? 'Confirmé' : 'En attente' }}
              </p>
            </div>
          </div>

          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{ missionHint }}
          </p>
        </section>
      </section>

      <aside class="space-y-4">
        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Actions</p>

          <div class="mt-4 grid gap-3">
            <button
              v-if="canAccept"
              type="button"
              class="wide-action border border-slate-200 bg-white text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.03)] hover:border-violet-200 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="runAction('accept')"
            >
              {{ actionsLoading ? 'Traitement...' : 'Accepter la mission' }}
            </button>

            <button
              v-if="canStart"
              type="button"
              class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="runAction('start')"
            >
              {{ actionsLoading ? 'Traitement...' : 'Demarrer' }}
            </button>

            <button
              v-if="canComplete"
              type="button"
              class="wide-action bg-emerald-600 text-white shadow-[0_12px_24px_rgba(16,185,129,0.12)] hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="runAction('complete')"
            >
              {{ actionsLoading ? 'Traitement...' : 'Terminer' }}
            </button>

            <button
              v-if="canCancel"
              type="button"
              class="wide-action border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="runAction('cancel')"
            >
              Annuler avant depart
            </button>
          </div>

          <div
            v-if="mission.status === 'completed'"
            class="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            Mission cloturee. Le paiement a ete declenche.
          </div>

          <div
            v-else-if="mission.status === 'cancelled'"
            class="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            Mission interrompue. Plus aucune action metier normale n'est disponible.
          </div>
        </section>

        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Resume</p>
          <div class="mt-4 space-y-3 text-sm text-slate-500">
            <p>Client: <span class="font-semibold text-slate-900">{{ mission.client_name }}</span></p>
            <p>Service: <span class="font-semibold text-slate-900">{{ mission.service_name }}</span></p>
            <p>Prix brut: <span class="font-semibold text-slate-900">{{ formatMoney(mission.amount) }}</span></p>
          </div>
        </section>
      </aside>
    </div>

    <div
      v-else
      class="rounded-[1.5rem] bg-white p-8 text-center text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      Mission introuvable.
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'
import { useMissionStore } from '@/stores/missions'
import { formatMoney, formatShortDate, statusMeta } from '@/utils/display'

const route = useRoute()
const missions = useMissionStore()

const loading = ref(false)
const error = ref('')
const actionsLoading = ref(false)
const mission = ref(null)
const providerAccordionOpen = ref(false)

function mapMission(raw) {
  const provider = raw?.provider || {}
  const providerUser = provider.user || {}

  const startDate = raw?.start_date || null
  const endDate = raw?.end_date || null
  const schedule =
    startDate && endDate
      ? `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`
      : 'Horaire a confirmer'

  const progress =
    raw?.status === 'assigned'
      ? 35
      : raw?.status === 'in_progress'
        ? 65
        : raw?.status === 'completed'
          ? 100
          : raw?.status === 'cancelled'
            ? 0
            : 15

  return {
    id: raw?.id,
    title: raw?.title || raw?.service?.name || 'Mission FlexiCare',
    address: raw?.address || '',
    description: raw?.description || '',
    amount: Number(raw?.price || 0),
    status: raw?.status || 'pending',
    schedule,
    progress,
    client_name: raw?.client?.name || 'Client FlexiCare',
    client_email: raw?.client?.email || '',
    client_phone: raw?.client?.phone || '',
    service_name: raw?.service?.name || 'Service FlexiCare',
    service_category: raw?.service?.category || '',
    service_description: raw?.service?.description || '',
    start_date: startDate,
    end_date: endDate,
    client_started_at: raw?.client_started_at || null,
    provider_started_at: raw?.provider_started_at || null,
    client_completed_at: raw?.client_completed_at || null,
    provider_completed_at: raw?.provider_completed_at || null,
    cancellation_reason: raw?.cancellation_reason || '',
    provider_name: providerUser.name || 'Prestataire',
    provider_email: providerUser.email || '',
    provider_phone: providerUser.phone || '',
    provider_photo_url: provider.profile_photo_url || '',
    provider_bio: provider.bio || '',
    provider_skills: Array.isArray(provider.skills) ? provider.skills : [],
    provider_experience_years: provider.experience_years ?? null,
    provider_rating: provider.rating ?? '0.00',
    provider_completed_jobs: provider.completed_jobs ?? 0,
    provider_verification_status: provider.verification_status || '',
    provider_availability_days: Array.isArray(provider.availability_days) ? provider.availability_days : [],
    provider_availability_start_time: provider.availability_start_time || '',
    provider_availability_end_time: provider.availability_end_time || '',
    provider_level: provider.level || '',
    payment: raw?.payment || null,
  }
}

async function loadMission() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get(`/provider/missions/${route.params.id}`)
    const raw = data?.data || null
    if (!data?.success || !raw) {
      mission.value = null
      error.value = 'Mission introuvable.'
      return
    }

    mission.value = mapMission(raw)
    providerAccordionOpen.value = false
  } catch (err) {
    mission.value = null
    error.value = err?.response?.data?.message || 'Impossible de charger la mission.'
  } finally {
    loading.value = false
  }
}

const badge = computed(() => statusMeta(mission.value?.status))
const statusPillClass = computed(() => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    assigned: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
    in_progress: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  }

  return map[mission.value?.status] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
})
const commissionRate = 0.25
const commissionAmount = computed(() => Number(mission.value?.amount || 0) * commissionRate)
const netAmount = computed(() => Number(mission.value?.amount || 0) * (1 - commissionRate))
const providerInitials = computed(() => {
  const name = mission.value?.provider_name || 'Prestataire'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const providerSkills = computed(() => {
  const skills = mission.value?.provider_skills || []
  if (!Array.isArray(skills) || !skills.length) return 'Non renseignees'
  return skills.join(' / ')
})

const providerAvailability = computed(() => {
  const days = mission.value?.provider_availability_days || []
  const start = mission.value?.provider_availability_start_time
  const end = mission.value?.provider_availability_end_time
  const labels = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  }

  const dayList = Array.isArray(days) && days.length
    ? days.map((day) => labels[day] || day).join(', ')
    : 'Non renseignee'

  if (start && end) {
    return `${dayList} / ${start.slice(0, 5)} - ${end.slice(0, 5)}`
  }

  return dayList
})

const providerVerificationLabel = computed(() => {
  const value = mission.value?.provider_verification_status
  if (!value) return ''
  if (value === 'certified') return 'Certifie'
  if (value === 'pending') return 'En attente'
  if (value === 'rejected') return 'Rejete'
  return value
})

const missionHint = computed(() => {
  if (!mission.value) return ''
  if (mission.value.status === 'pending') {
    return 'Mission ouverte. Elle n’est pas encore attribuee a un prestataire.'
  }
  if (mission.value.status === 'assigned') {
    return 'Mission recu. Vous pouvez tracer l’acceptation, confirmer le demarrage ou annuler avant le depart.'
  }
  if (mission.value.status === 'in_progress') {
    return 'Mission en cours. La cloture necessite la confirmation des deux parties.'
  }
  if (mission.value.status === 'completed') {
    return 'Mission terminee. Le paiement a ete declenche.'
  }
  if (mission.value.status === 'cancelled') {
    return 'Mission interrompue. Les actions normales ne sont plus disponibles.'
  }
  return ''
})

const canAccept = computed(() => mission.value?.status === 'assigned')
const canStart = computed(() => mission.value?.status === 'assigned' && !mission.value?.provider_started_at)
const canComplete = computed(() => mission.value?.status === 'in_progress' && !mission.value?.provider_completed_at)
const canCancel = computed(() =>
  mission.value?.status === 'assigned' &&
  !mission.value?.provider_started_at &&
  !mission.value?.client_started_at
)

async function runAction(action) {
  if (!mission.value?.id) return
  actionsLoading.value = true

  try {
    if (action === 'accept') {
      await missions.acceptProviderMission(mission.value.id)
    } else if (action === 'start') {
      await missions.startProviderMission(mission.value.id)
    } else if (action === 'complete') {
      await missions.completeProviderMission(mission.value.id)
    } else if (action === 'cancel') {
      await missions.cancelProviderMission(mission.value.id)
    }

    await loadMission()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible d’executer cette action.'
  } finally {
    actionsLoading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    loadMission()
  },
  { immediate: true }
)
</script>
