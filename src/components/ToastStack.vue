<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:justify-end sm:px-6">
    <div class="flex w-full max-w-sm flex-col gap-3">
      <TransitionGroup name="toast">
        <div
          v-for="toast in app.toasts"
          :key="toast.id"
          class="pointer-events-auto rounded-3xl border border-white/10 bg-slate-900/95 p-4 shadow-soft backdrop-blur-xl"
        >
          <div class="flex items-start gap-3">
            <div class="rounded-2xl p-2" :class="toastTone(toast.type)">
              <component :is="toastIcon(toast.type)" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-white">{{ toast.title }}</p>
              <p class="mt-1 text-sm leading-5 text-slate-300">{{ toast.message }}</p>
            </div>
            <button class="text-slate-400 transition hover:text-white" @click="app.dismissToast(toast.id)">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'
import { useAppStore } from '@/stores/app'

const app = useAppStore()

const toastTone = (type) => {
  const map = {
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
    error: 'bg-rose-500/15 text-rose-300',
    info: 'bg-sky-500/15 text-sky-300',
  }
  return map[type] || map.info
}

const toastIcon = (type) => {
  const map = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }
  return map[type] || InformationCircleIcon
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
