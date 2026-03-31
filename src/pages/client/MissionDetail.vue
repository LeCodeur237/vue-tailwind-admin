<template>
  <div class="space-y-5 pb-12 px-1 sm:pb-20 lg:pb-24">
    <RouterLink
      to="/client/missions"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
    >
      <span aria-hidden="true">←</span>
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
            <p class="mt-2 text-sm text-slate-500">{{ mission.address }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
            <div class="rounded-[1rem] bg-violet-50 px-3 py-2 text-right ring-1 ring-violet-100">
              <p class="mt-1 text-lg font-black tracking-tight text-violet-700">Montant : {{ formatMoney(mission.amount) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Service</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ mission.service_name }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ mission.service_category }}</p>
          </div>
          <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Prestataire</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">{{ providerLabel }}</p>
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

        <p class="mt-6 text-sm leading-7 text-slate-600">
          {{ mission.description }}
        </p>

        <div class="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Suivi</p>
          <div class="mt-2 flex items-center gap-2">
            <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', badge.class]">{{ badge.label }}</span>
            <span class="text-sm text-slate-500">Progression {{ mission.progress || 0 }}%</span>
          </div>
        </div>

        <section class="mt-6 overflow-hidden rounded-[0.8rem] border border-slate-200 bg-slate-50">
          <button
            type="button"
            class="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
            @click="providerAccordionOpen = !providerAccordionOpen"
          >
            <div class="flex min-w-0 items-start gap-4">
              <div
                class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-white ring-1 ring-slate-200"
              >
                <img
                  v-if="mission.provider_photo_url"
                  :src="mission.provider_photo_url"
                  :alt="providerLabel"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-sm font-black text-slate-400">
                  {{ providerInitials }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-lg font-black tracking-tight text-slate-900">
                    {{ providerLabel }}
                  </h3>
                  <span
                    v-if="mission.provider_verification_status"
                    class="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700"
                  >
                    {{ providerVerificationLabel }}
                  </span>
                </div>
                <p class="mt-1 text-sm leading-6 text-slate-500">
                  {{ mission.provider_bio || 'Aucun prestataire disponible.' }}
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
          </div>
        </section>
      </section>

      <aside class="space-y-4">
        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Actions</p>

          <div class="mt-4 grid gap-3">
            <button
              v-if="mission.status === 'assigned' && !mission.client_started_at"
              type="button"
              class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="startMission"
            >
              {{ actionsLoading ? 'Traitement...' : 'Démarrer' }}
            </button>

            <button
              v-if="(mission.status === 'pending' || mission.status === 'assigned') && !mission.client_started_at"
              type="button"
              class="wide-action border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="openCancelModal"
            >
              Annuler
            </button>

            <button
              v-if="mission.status === 'in_progress' && !mission.client_completed_at"
              type="button"
              class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="actionsLoading"
              @click="openCompleteModal"
            >
              {{ actionsLoading ? 'Traitement...' : 'Terminer' }}
            </button>

            <div
              v-if="mission.status === 'completed'"
              class="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              Cette mission est terminée.
            </div>

            <div
              v-if="mission.status === 'cancelled'"
              class="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              Cette mission a été annulée.
            </div>
          </div>
        </section>

        <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
          <p class="section-title">Résumé</p>
          <div class="mt-4 space-y-3 text-sm text-slate-500">
            <p>Statut actuel: <span class="font-semibold text-slate-900">{{ statusLabel }}</span></p>
            <p>Client: <span class="font-semibold text-slate-900">{{ mission.client_name }}</span></p>
            <p>Service: <span class="font-semibold text-slate-900">{{ mission.service_name }}</span></p>
          </div>
        </section>
      </aside>
    </div>

    <Teleport to="body">
      <Transition name="route-fade">
        <div
          v-if="completeModalOpen"
          class="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center sm:px-6 sm:pb-6"
          @click.self="closeCompleteModal"
        >
          <div class="w-full max-w-lg rounded-[1.5rem] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="section-title">Terminer la mission</p>
                <h3 class="mt-2 text-xl font-black tracking-tight text-slate-900">Confirmer le mode de paiement</h3>
                <p class="mt-2 text-sm leading-6 text-slate-500">
                  Le backend demande le moyen de paiement utilisé pour clôturer la mission.
                </p>
              </div>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                @click="closeCompleteModal"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form class="mt-5 space-y-4" @submit.prevent="submitCompleteMission">
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">Mode de paiement</span>
                <select v-model="paymentMethod" class="select-base">
                  <option value="cash">Cash</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_money">MTN MoMo</option>
                </select>
              </label>

              <p v-if="completeError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ completeError }}
              </p>

              <div class="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="actionsLoading"
                >
                  {{ actionsLoading ? 'Finalisation...' : 'Confirmer la fin' }}
                </button>
                <button
                  type="button"
                  class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                  :disabled="actionsLoading"
                  @click="closeCompleteModal"
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="route-fade">
        <div
          v-if="cancelModalOpen"
          class="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center sm:px-6 sm:pb-6"
          @click.self="closeCancelModal"
        >
          <div class="w-full max-w-lg rounded-[1.5rem] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="section-title">Annulation</p>
                <h3 class="mt-2 text-xl font-black tracking-tight text-slate-900">Pourquoi annuler cette mission ?</h3>
                <p class="mt-2 text-sm leading-6 text-slate-500">
                  Le backend demande un motif pour enregistrer l'annulation.
                </p>
              </div>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                @click="closeCancelModal"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <form class="mt-5 space-y-4" @submit.prevent="submitCancelMission">
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">Motif de l'annulation</span>
                <textarea
                  v-model="cancelReason"
                  rows="4"
                  class="input-base resize-none"
                  placeholder="Need to reschedule because of an emergency."
                />
              </label>

              <p v-if="cancelError" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {{ cancelError }}
              </p>

              <div class="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  class="wide-action bg-rose-600 text-white shadow-[0_12px_24px_rgba(225,29,72,0.14)] hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="actionsLoading"
                >
                  {{ actionsLoading ? 'Annulation...' : 'Confirmer l\'annulation' }}
                </button>
                <button
                  type="button"
                  class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                  :disabled="actionsLoading"
                  @click="closeCancelModal"
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div
      v-if="!loading && !error && !mission"
      class="rounded-[1.5rem] bg-white p-8 text-center text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
    >
      Mission introuvable.
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import HeaderMobile from '@/components/HeaderMobile.vue'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'
import { useMissionStore } from '@/stores/missions'
import { formatMoney, formatShortDate, statusMeta } from '@/utils/display'

const route = useRoute()
const app = useAppStore()
const missions = useMissionStore()

const loading = ref(false)
const error = ref('')
const mission = ref(null)
const actionsLoading = ref(false)
const cancelModalOpen = ref(false)
const cancelReason = ref('')
const cancelError = ref('')
const completeModalOpen = ref(false)
const paymentMethod = ref('cash')
const completeError = ref('')
const providerAccordionOpen = ref(false)

const badge = computed(() => statusMeta(mission.value?.status))
const statusLabel = computed(() => badge.value.label)

const dayLabels = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

const providerLabel = computed(() => {
  if (!mission.value) return 'En attente'
  if (mission.value.status === 'pending') return 'En attente'
  if (mission.value.status === 'assigned' && !mission.value.provider_photo_url && !mission.value.provider_bio) {
    return 'Attribuée'
  }
  return mission.value.assigned_provider || 'En attente'
})

const providerInitials = computed(() => {
  const name = providerLabel.value || 'Prestataire'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
})

const providerVerificationLabel = computed(() => {
  const value = mission.value?.provider_verification_status
  if (!value) return ''
  if (value === 'certified') return 'Certifie'
  if (value === 'pending') return 'En attente'
  if (value === 'rejected') return 'Rejete'
  return value
})

const providerSkills = computed(() => {
  const skills = mission.value?.provider_skills
  if (!Array.isArray(skills) || skills.length === 0) return 'Non renseigne'
  return skills.join(' • ')
})

const providerAvailability = computed(() => {
  const days = mission.value?.provider_availability_days
  const start = mission.value?.provider_availability_start_time
  const end = mission.value?.provider_availability_end_time

  const dayList = Array.isArray(days) && days.length
    ? days.map((day) => dayLabels[day] || day).join(', ')
    : 'Non renseigne'

  if (start && end) {
    return `${dayList} • ${start.slice(0, 5)} - ${end.slice(0, 5)}`
  }

  return dayList
})

const mapMission = (item) => {
  const cached = missions.findClientMission(item.id) || {}
  const providerUser = item.provider?.user || {}
  const providerName = providerUser.name || item.provider?.name || cached.assigned_provider || 'En attente'
  const rawStatus = item.status || cached.status || 'pending'

  return {
    id: item.id,
    title: item.title || item.service?.name || cached.service || 'Mission FlexiCare',
    service_name: item.service?.name || cached.service || 'Mission FlexiCare',
    service_category: item.service?.category || '',
    address: item.address || cached.address || '',
    description: item.description || cached.description || '',
    amount: Number(item.price || cached.amount || 0),
    status: rawStatus,
    assigned_provider: providerName,
    client_name: item.client?.name || app.user?.name || cached.client_name || 'Client FlexiCare',
    rating: cached.rating ?? null,
    client_started_at: item.client_started_at || cached.client_started_at || null,
    provider_started_at: item.provider_started_at || cached.provider_started_at || null,
    latitude: item.latitude ?? cached.latitude ?? null,
    longitude: item.longitude ?? cached.longitude ?? null,
    provider_photo_url: item.provider?.profile_photo_url || '',
    provider_bio: item.provider?.bio || '',
    provider_skills: Array.isArray(item.provider?.skills) ? item.provider.skills : [],
    provider_experience_years: item.provider?.experience_years ?? null,
    provider_rating: item.provider?.rating ?? '0.00',
    provider_completed_jobs: item.provider?.completed_jobs ?? 0,
    provider_verification_status: item.provider?.verification_status || '',
    provider_availability_days: Array.isArray(item.provider?.availability_days) ? item.provider.availability_days : [],
    provider_availability_start_time: item.provider?.availability_start_time || '',
    provider_availability_end_time: item.provider?.availability_end_time || '',
    progress:
      rawStatus === 'assigned'
        ? 35
        : rawStatus === 'in_progress'
          ? 65
          : rawStatus === 'completed'
            ? 100
            : rawStatus === 'cancelled'
              ? 0
              : cached.progress ?? 15,
    schedule:
      item.start_date && item.end_date
        ? `${formatShortDate(item.start_date)} - ${formatShortDate(item.end_date)}`
        : 'Horaire a confirmer',
  }
}

async function loadMission() {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get(`/client/missions/${route.params.id}`)
    if (data?.success && data?.data) {
      mission.value = mapMission(data.data)
      return
    }

    mission.value = null
    error.value = 'Mission introuvable.'
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de charger la mission.'
    mission.value = null
  } finally {
    loading.value = false
  }
}

async function startMission() {
  if (!mission.value?.id) return
  actionsLoading.value = true
  try {
    await missions.startClientMission(mission.value.id)
    await loadMission()
  } finally {
    actionsLoading.value = false
  }
}

function openCancelModal() {
  cancelError.value = ''
  cancelReason.value = ''
  cancelModalOpen.value = true
}

function closeCancelModal() {
  if (actionsLoading.value) return
  cancelModalOpen.value = false
  cancelError.value = ''
}

async function cancelMission() {
  if (!mission.value?.id) return
  if (mission.value.status !== 'pending' && mission.value.status !== 'assigned') return
  actionsLoading.value = true
  try {
    await missions.cancelClientMission(mission.value.id, cancelReason.value)
    await loadMission()
    cancelModalOpen.value = false
  } catch (err) {
    cancelError.value = err?.response?.data?.message || 'Impossible d\'annuler la mission pour le moment.'
  } finally {
    actionsLoading.value = false
  }
}

async function submitCancelMission() {
  cancelError.value = ''

  if (!cancelReason.value.trim()) {
    cancelError.value = 'Merci de préciser un motif d\'annulation.'
    return
  }

  await cancelMission()
}

async function completeMission() {
  if (!mission.value?.id) return
  if (mission.value.status !== 'in_progress') return
  actionsLoading.value = true
  try {
    await missions.completeClientMission(mission.value.id, paymentMethod.value)
    await loadMission()
    completeModalOpen.value = false
  } finally {
    actionsLoading.value = false
  }
}

function openCompleteModal() {
  completeError.value = ''
  paymentMethod.value = 'cash'
  completeModalOpen.value = true
}

function closeCompleteModal() {
  if (actionsLoading.value) return
  completeModalOpen.value = false
  completeError.value = ''
}

async function submitCompleteMission() {
  completeError.value = ''
  try {
    await completeMission()
  } catch (err) {
    completeError.value = err?.response?.data?.message || 'Impossible de terminer la mission pour le moment.'
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
