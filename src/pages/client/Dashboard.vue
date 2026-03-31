<template>
  <div class="space-y-6 pb-4 sm:pb-28 lg:pb-32">
    <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="Total missions" :value="summary.total" hint="Toutes les demandes">
        <template #icon><ClipboardDocumentListIcon class="h-6 w-6" /></template>
      </StatCard>
      <StatCard label="En cours" :value="summary.active" hint="Missions suivies">
        <template #icon><ArrowPathIcon class="h-6 w-6" /></template>
      </StatCard>
      <StatCard label="Terminees" :value="summary.completed" hint="Missions completees">
        <template #icon><CheckBadgeIcon class="h-6 w-6" /></template>
      </StatCard>
      <StatCard label="En attente" :value="summary.pending" hint="A assigner">
        <template #icon><ClockIcon class="h-6 w-6" /></template>
      </StatCard>
    </section>

    <RouterLink
      to="/client/missions/create"
      class="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-[0_18px_32px_rgba(124,58,237,0.28)] transition hover:bg-violet-500 active:scale-95 sm:bottom-28 sm:right-6"
      aria-label="Creer une mission"
    >
      <PlusIcon class="h-6 w-6" />
    </RouterLink>

    <section class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Transactions</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Dernieres transactions</h2>
        </div>
        <RouterLink to="/client/wallet" class="text-sm font-semibold text-violet-600 transition hover:text-violet-500">
          Voir tout
        </RouterLink>
      </div>

      <Loader v-if="missions.loading.dashboard" />

      <div v-else class="mt-5 divide-y divide-slate-100">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div class="min-w-0">
            <p class="break-words text-sm font-semibold text-slate-900">{{ transaction.description }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ transaction.date }} • {{ transaction.reference }}</p>
          </div>

          <div class="shrink-0 text-right">
            <p class="font-semibold" :class="transaction.direction === 'in' ? 'text-emerald-600' : 'text-slate-900'">
              {{ transaction.direction === 'in' ? '+' : '-' }}{{ formatMoney(transaction.amount, walletCurrency) }}
            </p>
            <span
              class="mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
              :class="transaction.direction === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'"
            >
              {{ transaction.direction === 'in' ? 'Credit' : 'Debit' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowPathIcon, CheckBadgeIcon, ClockIcon, ClipboardDocumentListIcon, PlusIcon } from '@heroicons/vue/24/solid'
import PageHero from '@/components/PageHero.vue'
import StatCard from '@/components/StatCard.vue'
import Loader from '@/components/Loader.vue'
import { useMissionStore } from '@/stores/missions'
import { formatShortDate } from '@/utils/display'

const missions = useMissionStore()
const dashboard = computed(() => missions.clientDashboard)
const summary = computed(() => missions.clientSummary)
const walletCurrency = computed(() => dashboard.value?.wallet?.currency || 'XOF')

const transactions = computed(() =>
  (dashboard.value?.recent_transactions || [])
    .slice(0, 3)
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description || `Transaction #${transaction.id}`,
      reference: transaction.reference || 'Aucune reference',
      date: formatShortDate(transaction.created_at),
      amount: Number(transaction.amount || 0),
      direction: transaction.type === 'credit' ? 'in' : 'out',
    }))
)

function formatMoney(amount, currency = 'XOF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

onMounted(() => {
  missions.fetchClientDashboard()
})
</script>
