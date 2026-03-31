<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden">
    <div class="rounded-[1.5rem] border border-slate-200 bg-white/95 px-2 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div class="grid grid-cols-4 gap-2">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-[11px] font-medium transition"
        :class="isActive(item.to) ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span class="mt-1">{{ item.label }}</span>
      </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  BanknotesIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  WalletIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/solid'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const route = useRoute()

const isActive = (to) => {
  if (to.endsWith('/missions')) {
    return route.path === to || (route.path.startsWith(`${to}/`) && !route.path.includes('/create'))
  }

  return route.path === to
}

const items = computed(() => {
  const provider = [
    { to: '/provider/dashboard', label: 'Accueil', icon: HomeIcon },
    { to: '/provider/missions', label: 'Missions', icon: BriefcaseIcon },
    { to: '/provider/earnings', label: 'Revenus', icon: BanknotesIcon },
    { to: '/provider/profile', label: 'Profil', icon: UserCircleIcon },
  ]

  const client = [
    { to: '/client/dashboard', label: 'Accueil', icon: HomeIcon },
    { to: '/client/wallet', label: 'Portefeuille', icon: WalletIcon },
    { to: '/client/missions', label: 'Missions', icon: ClipboardDocumentListIcon },
    { to: '/client/profile', label: 'Profil', icon: UserCircleIcon },
  ]

  return props.role === 'provider' ? provider : client
})
</script>
