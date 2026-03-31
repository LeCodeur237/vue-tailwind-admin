<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <Loader v-if="profileLoading" class="py-8" />
    <template v-else>
      <section class="card-surface overflow-hidden p-5 sm:p-6">
        <div class="flex items-start gap-4">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-violet-600 to-violet-400 text-xl font-black text-white"
          >
            {{ initials }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="flex-wrap text-xl font-black tracking-tight text-slate-900">{{ profileLabel }}</h2>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ account.email }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ account.phone }}</p>
          </div>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:text-violet-700"
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
import { useMissionStore } from '@/stores/missions'
import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  HeartIcon,
  SparklesIcon,
  ShareIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const app = useAppStore()
const missions = useMissionStore()
const router = useRouter()

const profileLoading = ref(false)
const hasProfile = ref(false)
const profile = ref({
  address: '',
  city: '',
  country: '',
  latitude: '',
  longitude: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  notes: '',
})

const account = computed(() => app.user || app.profile || {
  name: 'FlexiCare User',
  email: 'user@flexicare.app',
  phone: '+234 800 000 0000',
})

const profileLabel = computed(() => account.value?.name || 'Client FlexiCare')
const initials = computed(() =>
  (profileLabel.value || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const menuItems = [
  {
    title: 'Voir détails',
    description: 'Consultez toutes vos informations client.',
    to: '/client/profile/details',
    icon: Cog6ToothIcon,
  },
  {
    title: 'Partager',
    description: 'Invitez des proches à rejoindre FlexiCare.',
    to: '/client/dashboard',
    icon: ShareIcon,
  },
  {
    title: 'Aide',
    description: 'Obtenez du support et des conseils rapides.',
    to: '/client/missions',
    icon: SparklesIcon,
  },
  {
    title: 'Avis',
    description: 'Laisser un avis pour améliorer le service.',
    to: '/client/profile/details',
    icon: HeartIcon,
  },
]

async function loadClientProfile() {
  profileLoading.value = true
  try {
    const { data } = await api.get('/client/profile')
    const loaded = data?.data || null
    hasProfile.value = Boolean(loaded)
    profile.value = loaded || profile.value
  } catch {
    hasProfile.value = false
  } finally {
    profileLoading.value = false
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

onMounted(loadClientProfile)
</script>
