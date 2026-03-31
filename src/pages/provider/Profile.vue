<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">

    <Loader v-if="loading" class="py-8" />

    <template v-else>
      <section class="card-surface overflow-hidden p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1.15rem] bg-slate-100 ring-1 ring-slate-200">
            <img
              v-if="providerProfile?.profile_photo_url"
              :src="providerProfile.profile_photo_url"
              :alt="profileName"
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
              <h2 class="truncate text-xl font-black tracking-tight text-slate-900">{{ profileName }}</h2>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="availabilityClass">
                {{ availabilityLabel }}
              </span>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="verificationClass">
                {{ verificationLabel }}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ account.email }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ account.phone }}</p>
          </div>

          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:text-violet-700"
            @click="logout"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RouterLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-4 rounded-[1.1rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(124,58,237,0.08)]"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
            <component :is="item.icon" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
            <p class="mt-1 text-sm leading-6 text-slate-500">{{ item.description }}</p>
          </div>
          <div class="shrink-0 self-start pt-1">
            <ChevronRightIcon class="h-5 w-5 text-slate-300 transition group-hover:text-violet-500" />
          </div>
        </RouterLink>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import Loader from '@/components/Loader.vue'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'

const app = useAppStore()
const router = useRouter()

const loading = ref(false)
const providerProfile = ref(null)

const account = computed(() => providerProfile.value?.user || app.user || app.profile || {
  name: 'FlexiCare User',
  email: 'user@flexicare.app',
  phone: '+234 800 000 0000',
})

const profileName = computed(() => account.value?.name || 'Prestataire FlexiCare')
const initials = computed(() =>
  (profileName.value || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const availabilityLabel = computed(() =>
  providerProfile.value?.availability_status === 'available'
    ? 'Disponible'
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

const menuItems = [
  {
    title: 'Informations',
    description: 'Voir les détails de mes informations',
    to: '/provider/profile/informations',
    icon: UserCircleIcon,
  },
  {
    title: 'Parametres',
    description: 'Langue, confidentialite, notifications et securite.',
    to: '/provider/settings',
    icon: Cog6ToothIcon,
  },
  {
    title: 'Preferences',
    description: 'Disponibilite, zones et type de missions preferees.',
    to: '/provider/preferences',
    icon: SparklesIcon,
  },
  {
    title: "Partager l'application",
    description: 'Envoyez FlexiCare a un collegue ou un proche.',
    to: '/provider/share',
    icon: ShareIcon,
  },
  {
    title: 'Laisser un commentaire',
    description: 'Donnez votre avis pour ameliorer l experience.',
    to: '/provider/feedback',
    icon: HeartIcon,
  },
]

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

function logout() {
  app.logout()
  app.pushToast({
    type: 'info',
    title: 'Déconnexion',
    message: 'Vous avez été déconnecté.',
  })
  router.push('/login')
}

onMounted(loadProfile)
</script>
