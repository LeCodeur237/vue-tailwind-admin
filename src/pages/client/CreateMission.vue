<template>
  <div class="space-y-5 pb-2 sm:pb-32 lg:pb-36">
    <RouterLink
      to="/client/missions"
      class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      Retour
    </RouterLink>

    <section class="space-y-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Créer une mission</h1>
        </div>
        <div class="rounded-[1rem] bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
          <ClipboardDocumentListIcon class="h-6 w-6" />
        </div>
      </div>

      <div class="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">Solde disponible</p>
            <p class="mt-1 text-sm text-slate-500">
              {{ balanceLoading ? 'Chargement...' : formatMoney(walletBalance, walletCurrency) }}
            </p>
          </div>
          <RouterLink
            to="/client/wallet/topup"
            class="text-sm font-semibold text-violet-600 transition hover:text-violet-500"
          >
            Recharger
          </RouterLink>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-500">
              Étape {{ currentStep + 1 }}/3
            </p>
            <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">{{ stepTitle }}</h2>
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
              <span class="text-sm font-semibold text-slate-700">Type de mission</span>
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  class="rounded-[1rem] border px-4 py-4 text-left transition"
                  :class="form.mission_type === 'urgent'
                    ? 'border-orange-200 bg-orange-50 ring-1 ring-orange-100'
                    : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'"
                  @click="form.mission_type = 'urgent'"
                >
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-orange-500">Urgente</p>
                  <p class="mt-2 text-sm font-semibold text-slate-900">À signaler au moins 1 heure avant</p>
                </button>

                <button
                  type="button"
                  class="rounded-[1rem] border px-4 py-4 text-left transition"
                  :class="form.mission_type === 'scheduled'
                    ? 'border-violet-200 bg-violet-50 ring-1 ring-violet-100'
                    : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40'"
                  @click="form.mission_type = 'scheduled'"
                >
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">Planifiée</p>
                  <p class="mt-2 text-sm font-semibold text-slate-900">Date et heure précises</p>
                </button>
              </div>
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Service</span>
              <div ref="serviceMenuRef" class="relative">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-violet-200 hover:bg-violet-50/30"
                  :class="loadingServices ? 'opacity-70' : ''"
                  :disabled="loadingServices"
                  @click="serviceMenuOpen = !serviceMenuOpen"
                >
                  <div class="min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Service sélectionné</p>
                    <p class="mt-1 truncate text-sm font-semibold text-slate-900">
                      {{ selectedService ? `${selectedService.name} - ${formatMoney(selectedService.base_price)}` : 'Choisir un service' }}
                    </p>
                  </div>
                  <ChevronDownIcon class="h-5 w-5 shrink-0 text-slate-400" />
                </button>

                <div
                  v-if="serviceMenuOpen"
                  class="absolute left-0 right-0 bottom-full z-20 mb-2 max-h-72 overflow-auto rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:bottom-auto sm:mb-0 sm:top-14"
                >
                  <button
                    v-for="service in services"
                    :key="service.id"
                    type="button"
                    class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition"
                    :class="String(form.service_id) === String(service.id)
                      ? 'bg-violet-50 text-violet-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'"
                    @click="form.service_id = service.id; serviceMenuOpen = false"
                  >
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold">{{ service.name }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ service.description || 'Service disponible' }}</p>
                    </div>
                    <span class="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      {{ formatMoney(service.base_price) }}
                    </span>
                  </button>
                </div>
              </div>
            </label>
          </div>
        </template>

        <template v-else-if="currentStep === 1">
          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              v-model="form.description"
              rows="4"
              class="input-base resize-none"
              placeholder="Intervention souhaitée"
            />
            <p class="text-xs text-slate-400">
              Pour Nounous, ajoute les options directement ici si besoin. Le texte sera enrichi automatiquement avec les détails saisis.
            </p>
          </label>

          <div v-if="isMenage" class="md:col-span-2 rounded-[1.25rem] border border-violet-100 bg-violet-50/60 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">Ménage simple</p>
                <p class="mt-1 text-sm text-slate-500">
                  Le ménage de base comprend salon, chambre, toilette, cuisine et assiettes.
                </p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                Base incluse
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Pièces supplémentaires</span>
                <input
                  v-model="form.extra_rooms"
                  type="number"
                  min="0"
                  class="input-base"
                  placeholder="0"
                />
                <p class="text-xs text-slate-400">Chaque pièce supplémentaire ajoute +500.</p>
              </label>

              <div class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Options additionnelles</span>
                <div class="grid gap-2">
                  <label class="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                    <input
                      v-model="form.sweep_courtyard"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Cour à balayer</p>
                      <p class="text-xs text-slate-500">Supplément +500</p>
                    </div>
                  </label>

                  <label class="flex items-center gap-3 rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
                    <input
                      v-model="form.weed_grass"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <div>
                      <p class="text-sm font-semibold text-slate-900">Herbe à déserber</p>
                      <p class="text-xs text-slate-500">Supplément +2000</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isLessives" class="md:col-span-2 rounded-[1.25rem] border border-violet-100 bg-violet-50/60 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">Lessives</p>
                <p class="mt-1 text-sm text-slate-500">
                  Le prix de base correspond à une bassine de 20L. Il augmente avec la taille de la bassine.
                </p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                Base 20L
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Nombre de bassines</span>
                <input
                  v-model="form.basin_count"
                  type="number"
                  min="1"
                  class="input-base"
                  placeholder="1"
                />
                <p class="text-xs text-slate-400">Chaque bassine est comptée séparément.</p>
              </label>

              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Taille de la bassine</span>
                <select v-model="form.basin_size" class="select-base">
                  <option value="20">20L</option>
                  <option value="30">30L</option>
                  <option value="40">40L</option>
                  <option value="50">50L</option>
                  <option value="60">60L</option>
                </select>
                <p class="text-xs text-slate-400">La tarification augmente par palier de 10L.</p>
              </label>
            </div>
          </div>

          <div v-if="isCuisine" class="md:col-span-2 rounded-[1.25rem] border border-violet-100 bg-violet-50/60 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900">Cuisine</p>
                <p class="mt-1 text-sm text-slate-500">
                  Le prix de base correspond à un repas. Il augmente selon le nombre de repas demandé.
                </p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
                Base par repas
              </span>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="space-y-2">
                <span class="text-sm font-semibold text-slate-700">Nombre de repas</span>
                <input
                  v-model="form.meals_count"
                  type="number"
                  min="1"
                  class="input-base"
                  placeholder="1"
                />
                <p class="text-xs text-slate-400">Un repas correspond au prix de base du service.</p>
              </label>
            </div>
          </div>

          <template v-if="isNounous">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Nombre d'enfants</span>
              <input v-model="form.children_count" type="number" min="1" class="input-base" placeholder="2" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Âges des enfants</span>
              <input
                v-model="form.children_ages"
                type="text"
                class="input-base"
                placeholder="3, 7"
              />
              <p class="text-xs text-slate-400">Sépare les âges par des virgules. Si un enfant a plus de 11 ans, la mission sera refusée.</p>
            </label>
          </template>
        </template>

        <template v-else>
          <template v-if="isMenage">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>
          </template>

          <template v-else-if="isLessives">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>
          </template>

          <template v-else-if="isCuisine">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>
          </template>

          <template v-else-if="form.mission_type === 'scheduled'">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de fin (optionnelle)</span>
              <input v-model="form.end_date" type="datetime-local" class="input-base" />
            </label>
          </template>

          <template v-else-if="form.mission_type === 'urgent'">
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>

            <div class="rounded-[1rem] border border-orange-100 bg-orange-50 px-4 py-3">
              <p class="text-sm font-semibold text-orange-700">Urgente</p>
              <p class="mt-1 text-sm text-orange-700/80">
                La demande doit être envoyée au moins 1 heure avant l'heure de début.
              </p>
            </div>
          </template>

          <template v-else>
            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de début</span>
              <input v-model="form.start_date" type="datetime-local" class="input-base" />
            </label>

            <label class="space-y-2">
              <span class="text-sm font-semibold text-slate-700">Date de fin</span>
              <input v-model="form.end_date" type="datetime-local" class="input-base" />
            </label>
          </template>

          <label class="space-y-2 md:col-span-2">
            <span class="text-sm font-semibold text-slate-700">Adresse</span>
            <input v-model="form.address" type="text" class="input-base" placeholder="Bastos, Yaoundé" />
          </label>

          <div class="md:col-span-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">Localisation</p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ locationReady ? `${locationStatus }` : 'Nous avons besoin de votre position pour envoyer la mission.' }}
                </p>
              </div>
              <button
                type="button"
                class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                :disabled="locationLoading"
                @click="detectClientLocation"
              >
                {{ locationLoading ? 'Recherche...' : 'Rafraîchir ma position' }}
              </button>
            </div>
          </div>
        </template>

        <div class="flex flex-col gap-3 sm:flex-row">
          <button
            v-if="currentStep > 0"
            type="button"
            class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
            @click="previousStep"
          >
            Retour
          </button>
          <button
            v-if="currentStep < 2"
            type="button"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !canSubmitStep"
            @click="nextStep"
          >
            Continuer
          </button>
          <button
            v-else
            type="submit"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !canSubmit"
          >
            {{ loading ? 'Création...' : 'Calculer le montant' }}
          </button>
        </div>

        <p v-if="error" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {{ error }}
        </p>
      </form>
    </section>

    <div
      v-if="quoteModalOpen"
      class="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-4 backdrop-blur-[2px] sm:items-center"
      @click.self="quoteModalOpen = false"
    >
      <div class="w-full max-w-md rounded-[1.5rem] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.2)] sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="section-title">Confirmation</p>
            <h3 class="mt-1 text-lg font-black tracking-tight text-slate-900">Montant total de la mission</h3>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:text-violet-700"
            @click="quoteModalOpen = false"
          >
            <span class="sr-only">Fermer</span>
            ×
          </button>
        </div>

        <div class="mt-4 rounded-[1.25rem] border border-violet-100 bg-violet-50 p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">Montant estimé</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-violet-700">
            {{ formatMoney(quoteAmount) }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">{{ quoteSummary }}</p>
        </div>

        <div class="mt-4 rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">
            Solde client:
            <span class="font-semibold text-slate-900">{{ formatMoney(walletBalance, walletCurrency) }}</span>
          </p>
          <p v-if="insufficientBalance" class="mt-2 text-sm font-semibold text-rose-700">
            Solde insuffisant. Veuillez recharger votre wallet avant de continuer.
          </p>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="insufficientBalance || quoteLoading"
            @click="confirmAndSubmit"
          >
            {{ quoteLoading ? 'Vérification...' : 'Envoyer la mission' }}
          </button>
          <button
            type="button"
            class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
            @click="quoteModalOpen = false"
          >
            Annuler
          </button>
        </div>

        <RouterLink
          v-if="insufficientBalance"
          to="/client/wallet/topup"
          class="mt-4 block text-center text-sm font-semibold text-violet-600 transition hover:text-violet-500"
        >
          Recharger maintenant
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeftIcon, ChevronDownIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/solid'
import api from '@/services/api'
import { useMissionStore } from '@/stores/missions'
import { formatMoney } from '@/utils/display'

const router = useRouter()
const missions = useMissionStore()

const error = ref('')
const loadingServices = ref(false)
const services = ref([])
const quoteLoading = ref(false)
const quoteModalOpen = ref(false)
const locationModalOpen = ref(false)
const locationLoading = ref(false)
const balanceLoading = ref(false)
const serviceMenuOpen = ref(false)
const serviceMenuRef = ref(null)
const currentStep = ref(0)
const walletBalance = ref(0)
const walletCurrency = ref('XOF')
const quoteAmount = ref(0)
const quoteSummary = ref('')
const loading = computed(() => loadingServices.value || balanceLoading.value || quoteLoading.value)

const form = reactive({
  mission_type: 'scheduled',
  service_id: '',
  title: '',
  description: '',
  price: '',
  start_date: '',
  end_date: '',
  latitude: '',
  longitude: '',
  address: '',
  extra_rooms: '',
  sweep_courtyard: false,
  weed_grass: false,
  basin_count: '',
  basin_size: '20',
  meals_count: '',
  children_count: '',
  children_ages: '',
})

const selectedService = computed(() =>
  services.value.find((service) => String(service.id) === String(form.service_id))
)

const isNounous = computed(() => {
  const name = selectedService.value?.name || ''
  const category = selectedService.value?.category || ''
  return name.toLowerCase().includes('noun') || category === 'child_care'
})

const isMenage = computed(() => {
  const name = selectedService.value?.name || ''
  const category = selectedService.value?.category || ''
  return name.toLowerCase().includes('menag') || category === 'home_care'
})

const isLessives = computed(() => {
  const name = selectedService.value?.name || ''
  const category = selectedService.value?.category || ''
  return name.toLowerCase().includes('lessiv') || category === 'laundry'
})

const isCuisine = computed(() => {
  const name = selectedService.value?.name || ''
  const category = selectedService.value?.category || ''
  return name.toLowerCase().includes('cuisin') || category === 'meal_prep'
})

const autoTitle = computed(() => {
  const serviceName = selectedService.value?.name || ''
  if (!serviceName) return ''
  return `Demande de ${serviceName.toLowerCase()}`
})

function closeServiceMenuOnOutsideClick(event) {
  if (!serviceMenuOpen.value) return
  if (!serviceMenuRef.value) return
  if (serviceMenuRef.value.contains(event.target)) return
  serviceMenuOpen.value = false
}

const locationReady = computed(() => form.latitude !== '' && form.longitude !== '')

const canSubmitStep = computed(() =>
  currentStep.value === 0
    ? Boolean(form.mission_type && form.service_id)
    : currentStep.value === 1
      ? Boolean(
          form.description.trim() &&
          (
            !isLessives.value ||
            (Number(form.basin_count) > 0 && form.basin_size)
          ) &&
          (
            !isCuisine.value ||
            Number(form.meals_count) > 0
          )
        )
      : Boolean(form.address.trim() && form.latitude !== '' && form.longitude !== '')
)

const canSubmit = computed(() =>
  form.mission_type &&
  form.service_id &&
  autoTitle.value &&
  form.description.trim() &&
  form.latitude !== '' &&
  form.longitude !== '' &&
  form.address.trim() &&
  (
    isMenage.value
      ? form.start_date
      : isLessives.value
        ? form.start_date
        : isCuisine.value
          ? form.start_date
          : form.start_date
  )
)

const insufficientBalance = computed(() => Number(walletBalance.value || 0) < Number(quoteAmount.value || 0))
const locationStatus = computed(() => {
  if (locationLoading.value) return 'Localisation en cours...'
  if (locationReady.value) return 'Position détectée'
  return 'Position requise'
})

const stepTitle = computed(() => {
  if (currentStep.value === 0) return 'Type et service'
  if (currentStep.value === 1) return 'Description et options'
  return 'Dates, adresse et position'
})

watch(
  () => form.mission_type,
  (type) => {
    if (type === 'urgent') {
      form.end_date = ''
    }
  },
  { immediate: true }
)

watch(selectedService, () => {
  if (autoTitle.value) {
    form.title = autoTitle.value
  }
})

watch(
  selectedService,
  () => {
    if (!selectedService.value) return
    if (!form.price) {
      form.price = selectedService.value.base_price || ''
    }
  },
  { immediate: true }
)

watch(
  selectedService,
  () => {
    if (!isMenage.value) {
      form.extra_rooms = ''
      form.sweep_courtyard = false
      form.weed_grass = false
    }

    if (!isLessives.value) {
      form.basin_count = ''
      form.basin_size = '20'
    }

    if (!isCuisine.value) {
      form.meals_count = ''
    }

    if (!isNounous.value) {
      form.children_count = ''
      form.children_ages = ''
    }
  },
  { immediate: true }
)

watch(quoteModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(locationModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function toIso(value) {
  return new Date(value).toISOString()
}

function isAtLeastOneHourAhead(value) {
  if (!value) return false
  const target = new Date(value)
  if (Number.isNaN(target.getTime())) return false
  return target.getTime() >= Date.now() + 60 * 60 * 1000
}

function parseAges(value) {
  return String(value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item) && item > 0)
}

function buildDescription() {
  const parts = [form.description.trim()]
  if (isMenage.value) {
    const extraRooms = Math.max(0, Number(form.extra_rooms || 0))
    const extras = []
    if (extraRooms > 0) extras.push(`${extraRooms} pièce(s) supplémentaire(s)`)
    if (form.sweep_courtyard) extras.push('cour à balayer')
    if (form.weed_grass) extras.push('herbe à déserber')
    parts.push('Ménage simple: salon, chambre, toilette, cuisine et assiettes inclus')
    if (extras.length) {
      parts.push(`Suppléments: ${extras.join(', ')}`)
    }
  }
  if (isLessives.value) {
    const basinCount = Math.max(1, Number(form.basin_count || 0))
    const basinSize = Number(form.basin_size || 20)
    parts.push(`Lessives: ${basinCount || 0} bassine(s) de ${basinSize}L`)
  }
  if (isCuisine.value) {
    const mealsCount = Math.max(1, Number(form.meals_count || 0))
    parts.push(`Cuisine: ${mealsCount || 0} repas`)
  }
  if (isNounous.value) {
    const childrenCount = Number(form.children_count || 0)
    const ages = parseAges(form.children_ages)
    parts.push(`Nounous: ${childrenCount || 0} enfant(s)`)
    parts.push(`Âges: ${ages.length ? ages.join(', ') : 'non renseignés'}`)
  }
  return parts.filter(Boolean).join(' | ')
}

function nextStep() {
  if (!canSubmitStep.value) {
    error.value = 'Tous les champs de cette étape sont obligatoires.'
    return
  }

  if (currentStep.value < 2) {
    currentStep.value += 1
  } else {
    openQuoteModal()
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

function handleSubmit() {
  if (currentStep.value < 2) {
    nextStep()
    return
  }

  openQuoteModal()
}

function calculateQuote() {
  const base = Number(selectedService.value?.base_price || 0)
  const start = form.start_date ? new Date(form.start_date) : null
  const end = form.end_date ? new Date(form.end_date) : null

  if (isNounous.value) {
    if (!Number(form.children_count) || Number(form.children_count) <= 0) {
      throw new Error('Veuillez saisir le nombre d’enfants.')
    }

    const ages = parseAges(form.children_ages)
    if (!ages.length) {
      throw new Error('Veuillez saisir les âges des enfants.')
    }

    if (ages.some((age) => age > 11)) {
      throw new Error('La mission est refusée si un enfant a plus de 11 ans.')
    }
  }

  if (isMenage.value) {
    const extraRooms = Math.max(0, Number(form.extra_rooms || 0))
    const roomCost = extraRooms * 500
    const courtyardCost = form.sweep_courtyard ? 500 : 0
    const grassCost = form.weed_grass ? 2000 : 0
    const addOns = roomCost + courtyardCost + grassCost

    return {
      amount: base + addOns,
      summary: addOns > 0
        ? `Base ${formatMoney(base)} + suppléments ${formatMoney(addOns)}`
        : `Forfait ménage simple: ${formatMoney(base)}`,
      start,
      end,
    }
  }

  if (isLessives.value) {
    const basinCount = Math.max(1, Number(form.basin_count || 0))
    const basinSize = Number(form.basin_size || 20)
    if (!basinCount || basinCount <= 0) {
      throw new Error('Veuillez saisir le nombre de bassines.')
    }
    if (![20, 30, 40, 50, 60].includes(basinSize)) {
      throw new Error('Veuillez choisir une taille de bassine valide.')
    }

    const sizeFactor = basinSize / 20
    const amount = base * basinCount * sizeFactor

    return {
      amount,
      summary: `${basinCount} bassine(s) de ${basinSize}L`,
      start,
      end: null,
    }
  }

  if (isCuisine.value) {
    const mealsCount = Math.max(1, Number(form.meals_count || 0))
    if (!mealsCount || mealsCount <= 0) {
      throw new Error('Veuillez saisir le nombre de repas.')
    }

    return {
      amount: base * mealsCount,
      summary: `${mealsCount} repas × ${formatMoney(base)}`,
      start,
      end: null,
    }
  }

  if (form.mission_type === 'urgent') {
    if (!start || Number.isNaN(start.getTime())) {
      throw new Error('Une mission urgente nécessite une date de début.')
    }
    if (!isAtLeastOneHourAhead(form.start_date)) {
      throw new Error('Une mission urgente doit être signalée au moins 1 heure avant le début.')
    }
    return {
      amount: base,
      summary: `Mission urgente: ${formatMoney(base)}`,
      start,
      end: null,
    }
  }

  if (!start || Number.isNaN(start.getTime())) {
    throw new Error('Veuillez renseigner la date de début pour une mission programmée.')
  }

  if (end && !Number.isNaN(end.getTime()) && end < start) {
    throw new Error('La date de fin doit être supérieure ou égale à la date de début.')
  }

  if (end && !Number.isNaN(end.getTime())) {
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)))
    return {
      amount: base * hours,
      summary: `${hours} heure(s) × ${formatMoney(base)}`,
      start,
      end,
    }
  }

  return {
    amount: base,
    summary: `Forfait de base: ${formatMoney(base)}`,
    start,
    end: null,
  }
}

async function loadServices() {
  loadingServices.value = true
  try {
    const { data } = await api.get('/client/services', { params: { per_page: 15 } })
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    services.value = items.map((service) => ({
      id: service.id,
      name: service.name || `Service #${service.id}`,
      base_price: Number(service.base_price || 0),
      category: service.category || '',
      description: service.description || '',
    }))

    if (!form.service_id && services.value.length) {
      form.service_id = services.value[0].id
    }
  } catch (err) {
    error.value = err?.response?.data?.message || 'Impossible de charger les services.'
  } finally {
    loadingServices.value = false
  }
}

async function loadWalletBalance() {
  balanceLoading.value = true
  try {
    const { data } = await api.get('/wallet/balance')
    if (data?.success && data?.data) {
      walletBalance.value = Number(data.data.balance || 0)
      walletCurrency.value = data.data.currency || 'XOF'
    }
  } catch (err) {
    console.warn('Wallet balance fallback', err?.message)
  } finally {
    balanceLoading.value = false
  }
}

function openQuoteModal() {
  error.value = ''

  try {
    const quote = calculateQuote()
    quoteAmount.value = quote.amount
    quoteSummary.value = quote.summary
    quoteModalOpen.value = true
  } catch (err) {
    error.value = err?.message || 'Impossible de calculer le montant.'
  }
}

async function confirmAndSubmit() {
  quoteLoading.value = true
  error.value = ''

  try {
    if (insufficientBalance.value) {
      error.value = 'Solde insuffisant. Veuillez recharger votre wallet avant de continuer.'
      return
    }

    const quote = calculateQuote()
    const payload = {
      mission_type: form.mission_type,
      service_id: Number(form.service_id),
      title: autoTitle.value || form.title.trim() || 'Demande de mission',
      description: buildDescription(),
      price: Number(quote.amount),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      address: form.address.trim(),
      start_date: quote.start ? toIso(quote.start) : null,
      end_date: isMenage.value ? null : quote.end ? toIso(quote.end) : null,
    }

    const created = await missions.createMission(payload)
    quoteModalOpen.value = false

    if (created?.id) {
      router.push(`/client/missions/${created.id}/searching`)
    }
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Impossible de créer la mission.'
    error.value = message
    if (message.toLowerCase().includes('solde')) {
      walletBalance.value = Number(walletBalance.value || 0)
    }
  } finally {
    quoteLoading.value = false
  }
}

function detectClientLocation() {
  if (!navigator.geolocation) {
    error.value = 'La géolocalisation n’est pas supportée par ce navigateur.'
    return
  }

  locationLoading.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = position.coords.latitude
      form.longitude = position.coords.longitude
      locationLoading.value = false
      locationModalOpen.value = false
    },
    () => {
      error.value = 'Position indisponible. Autorise la localisation puis réessaie.'
      locationLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  )
}

onMounted(() => {
  loadServices()
  loadWalletBalance()
  if (!locationReady.value) {
    detectClientLocation()
  }
  document.addEventListener('click', closeServiceMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeServiceMenuOnOutsideClick)
})
</script>
