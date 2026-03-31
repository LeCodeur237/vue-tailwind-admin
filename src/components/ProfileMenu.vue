<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10"
      @click="open = !open"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-flexi-blue to-flexi-gold text-sm font-black text-slate-950">
        {{ initials }}
      </div>
      <div class="hidden min-w-0 sm:block">
        <p class="truncate text-sm font-semibold text-white">{{ profile.name }}</p>
        <p class="truncate text-xs text-slate-400">{{ roleLabel }}</p>
      </div>
      <ChevronDownIcon class="h-4 w-4 text-slate-400" />
    </button>

    <Transition name="menu-fade">
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/98 shadow-soft backdrop-blur-xl"
      >
        <div class="border-b border-white/10 p-4">
          <p class="text-sm font-semibold text-white">{{ profile.name }}</p>
          <p class="mt-1 text-xs text-slate-400">{{ profile.email }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ profile.phone }}</p>
        </div>

        <div class="p-2">
          <RouterLink
            :to="profileRoute"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            @click="open = false"
          >
            <UserCircleIcon class="h-5 w-5" />
            Mon profil
          </RouterLink>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            @click="switchRole"
          >
            <ArrowsRightLeftIcon class="h-5 w-5" />
            Basculer vers {{ app.isProvider ? 'client' : 'prestataire' }}
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
            @click="logout"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
            Deconnexion
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  ArrowsRightLeftIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/solid'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const app = useAppStore()
const router = useRouter()
const open = ref(false)
const root = ref(null)

const profile = computed(() => app.profile || { name: 'FlexiCare User', email: 'user@flexicare.app', phone: '' })
const roleLabel = computed(() => (props.role === 'provider' ? 'Prestataire' : 'Client'))
const profileRoute = computed(() => (props.role === 'provider' ? '/provider/profile' : '/client/profile'))
const initials = computed(() =>
  (profile.value.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
)

const closeOnOutsideClick = (event) => {
  if (root.value && !root.value.contains(event.target)) {
    open.value = false
  }
}

const switchRole = () => {
  const nextRole = app.isProvider ? 'client' : 'provider'
  app.setRole(nextRole)
  open.value = false
  router.push(nextRole === 'provider' ? '/provider/dashboard' : '/client/dashboard')
}

const logout = () => {
  app.logout()
  open.value = false
  router.push('/onboarding')
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
})
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
