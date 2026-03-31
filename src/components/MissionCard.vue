<template>
  <article
    :class="[
      'min-w-0 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.03)]',
    ]"
  >
    <div class="flex min-w-0">
      <div class="min-w-0 flex-1 p-4">
        <div class="flex min-w-0 items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="min-w-0 break-words text-base font-bold tracking-tight text-slate-900">{{ mission.service }}</h3>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', badge.class]">
                {{ badge.label }}
              </span>
            </div>
          </div>
          <div class="shrink-0 rounded-xl bg-violet-50 px-3 py-2 text-right ring-1 ring-violet-100">
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-500">
              {{ amountLabel }}
            </p>
            <p class="mt-1 text-sm font-black text-violet-700">{{ displayAmount }}</p>
          </div>
        </div>

        <div class="mt-3 flex min-w-0 items-center justify-between gap-3 text-[11px] font-medium text-slate-500">
          <span class="min-w-0 truncate">{{ mission.time || 'Horaire a confirmer' }}</span>
          <span class="min-w-0 truncate">{{ mission.client_name || mission.assigned_provider || 'Mission FlexiCare' }}</span>
        </div>

        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-violet-100">
          <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" :style="{ width: `${mission.progress || 0}%` }" />
        </div>

        <div class="mt-3 flex items-center gap-3">
          <RouterLink
            :to="detailRoute"
            class="wide-action bg-violet-600 py-2.5 text-sm text-white shadow-sm shadow-violet-200 hover:bg-violet-700"
          >
            Voir la mission
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatMoney, statusMeta } from '@/utils/display'

const props = defineProps({
  mission: {
    type: Object,
    required: true,
  },
  role: {
    type: String,
    default: 'provider',
  },
})

const badge = computed(() => statusMeta(props.mission.status))
const netAmount = computed(() => {
  const amount = Number(props.mission.amount || 0)
  return props.role === 'provider' ? amount * 0.75 : amount
})
const amountLabel = computed(() => (props.role === 'provider' ? 'Net' : 'Montant'))
const displayAmount = computed(() => {
  if (!props.mission.amount) return 'Suivi'
  return formatMoney(netAmount.value)
})
const detailRoute = computed(() => {
  const base = props.role === 'client' ? '/client/missions/' : '/provider/missions/'
  return `${base}${props.mission.id}`
})
</script>
