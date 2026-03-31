<template>
  <div class="page-shell">
    <div class="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="hidden lg:block lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-3rem)]">
        <div class="glass-panel flex h-full flex-col rounded-[1.75rem] p-5">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <UserGroupIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.24em] text-slate-400">FlexiCare</p>
              <h2 class="text-lg font-black tracking-tight text-slate-900">Client Hub</h2>
            </div>
          </div>

          <div class="mt-6 space-y-2 overflow-y-auto pr-1">
            <RouterLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
              :class="route.path.startsWith(item.to) ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
            >
              <component :is="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </RouterLink>
          </div>
        </div>
      </aside>

      <section class="flex flex-col gap-5 pb-4 sm:pb-4 lg:pb-0">
        <div class="rounded-[50px] border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_55%,#a855f7_100%)] py-4 px-5 text-white lg:hidden">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h1 class="text-2xl font-black tracking-tight text-white">FlexiCare</h1>
            </div>

            <RouterLink
              to="/client/profile"
              class="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm shadow-black/10"
            >
              <span class="flex items-center gap-2">
                <span class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                  <img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    alt="Photo de profil"
                    class="h-full w-full object-cover"
                  />
                  <UserCircleIcon v-else class="h-4 w-4" />
                </span>
                <span>Profile</span>
              </span>
            </RouterLink>
          </div>
        </div>

        <RouterView />
      </section>
    </div>
    <BottomNav role="client" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ClipboardDocumentListIcon, HomeIcon, UserCircleIcon, UserGroupIcon, WalletIcon } from '@heroicons/vue/24/solid'
import BottomNav from '@/components/BottomNav.vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const app = useAppStore()

const avatarUrl = computed(() => app.user?.profile_photo_url || app.profile?.profile_photo_url || '')

  const nav = [
  { to: '/client/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/client/wallet', label: 'Portefeuille', icon: WalletIcon },
  { to: '/client/missions', label: 'Missions', icon: ClipboardDocumentListIcon },
  { to: '/client/profile', label: 'Profil', icon: UserCircleIcon },
]
</script>
