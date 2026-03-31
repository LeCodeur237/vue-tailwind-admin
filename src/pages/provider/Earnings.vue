<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <Loader v-if="loading" class="py-8" />

    <template v-else>
      <section class="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Solde wallet</p>
            <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">
              {{ formatMoney(wallet.balance, wallet.currency) }}
            </p>
            <p class="mt-2 text-sm text-slate-500">Montant disponible sur votre wallet FlexiCare.</p>
          </div>
          <div class="rounded-2xl bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
            <ArrowTrendingUpIcon class="h-6 w-6" />
          </div>
        </div>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <RouterLink
            to="/provider/earnings/withdraw"
            class="wide-action bg-violet-600 text-white hover:bg-violet-500"
          >
            Faire un retrait
          </RouterLink>
        </div>
      </section>

      <section class="overflow-hidden bg-white p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="section-title">Historique</p>
            <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Dernieres transactions</h2>
          </div>
        </div>

        <div class="mt-4 divide-y divide-slate-100">
          <div
            v-for="item in transactions"
            :key="item.id"
            class="flex cursor-pointer items-center justify-between gap-4 py-4 text-left transition first:pt-0 last:pb-0 hover:bg-slate-50/70"
            role="button"
            tabindex="0"
            @click="openReceipt(item)"
            @keydown.enter.prevent="openReceipt(item)"
            @keydown.space.prevent="openReceipt(item)"
          >
            <div class="min-w-0">
              <p class="break-words text-sm font-semibold text-slate-900">{{ item.description }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ item.date }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-semibold" :class="item.direction === 'in' ? 'text-emerald-600' : 'text-slate-900'">
                {{ item.direction === 'in' ? '+' : '-' }}{{ formatMoney(item.amount, wallet.currency) }}
              </p>
              <span
                :class="[
                  'mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold',
                  item.direction === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700',
                ]"
              >
                {{ item.direction === 'in' ? 'Crédit' : 'Débit' }}
              </span>
            </div>
          </div>

          <div v-if="transactions.length === 0" class="py-6 text-center text-sm text-slate-500">
            Aucune transaction disponible pour le moment.
          </div>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <Transition name="route-fade">
        <div
          v-if="receiptOpen"
          class="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/55 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center sm:px-6 sm:pb-6"
          @click.self="closeReceipt"
        >
          <div class="w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto overflow-x-hidden rounded-[1.5rem] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] select-none">
            <div class="px-5 py-6 text-black">
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <img src="/logo_bg_white.png" alt="FlexiCare" class="h-8 w-8 object-contain" />
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/70">Reçu FlexiCare</p>
                    <h3 class="mt-1 text-lg font-black tracking-tight">Transaction enregistrée</h3>
                  </div>
                </div>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white/20"
                  @click="closeReceipt"
                >
                  <span class="sr-only">Fermer</span>
                  ×
                </button>
              </div>
            </div>

            <div class="space-y-4 p-5 sm:p-6">
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  @click="printReceipt"
                >
                  <span class="sr-only">Imprimer</span>
                  <PrinterIcon class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  @click="downloadReceipt"
                >
                  <span class="sr-only">Télécharger</span>
                  <ArrowDownTrayIcon class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  @click="shareReceipt"
                >
                  <span class="sr-only">Partager</span>
                  <ShareIcon class="h-4 w-4" />
                </button>
              </div>

              <div class="rounded-[1.25rem] bg-slate-50 p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Reçu</p>
                    <p class="mt-1 text-sm font-semibold text-slate-900">Transaction FlexiCare</p>
                  </div>
                  <span
                    class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    :class="selectedTransaction?.direction === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'"
                  >
                    {{ selectedTransaction?.direction === 'in' ? 'Crédit' : 'Débit' }}
                  </span>
                </div>

                <div class="mt-4 border-t border-dashed border-slate-200 pt-4">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Description</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedTransaction?.description }}</p>

                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-[1rem] bg-white p-3">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Montant</p>
                      <p class="mt-1 text-lg font-black tracking-tight text-slate-900">
                        {{ selectedTransaction?.direction === 'in' ? '+' : '-' }}{{ formatMoney(selectedTransaction?.amount, wallet.currency) }}
                      </p>
                    </div>
                    <div class="rounded-[1rem] bg-white p-3">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Référence</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">
                        {{ selectedTransaction?.reference }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4 grid gap-3 border-t border-dashed border-slate-200 pt-4 sm:grid-cols-2">
                    <div class="rounded-[1rem] bg-white p-3">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Date</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedTransaction?.date }}</p>
                    </div>
                    <div class="rounded-[1rem] bg-white p-3">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Statut</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">Confirmé</p>
                    </div>
                  </div>

                  <div class="mt-4 border-t border-dashed border-slate-200 pt-4">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Ticket</span>
                      <span class="text-xs font-semibold text-slate-500">#{{ selectedTransaction?.id }}</span>
                    </div>
                    <div class="mt-4 h-px w-full bg-slate-200" />
                    <p class="mt-3 text-center text-xs leading-5 text-slate-500">
                      Merci d’utiliser FlexiCare.
                      <br />
                      Conservez ce reçu pour votre historique.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
                @click="closeReceipt"
              >
                Fermer le reçu
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { useAppStore } from '@/stores/app'
import Loader from '@/components/Loader.vue'
import { formatShortDate, formatMoney as formatMoneyUtil } from '@/utils/display'
import { ArrowDownTrayIcon, ArrowTrendingUpIcon, PrinterIcon, ShareIcon } from '@heroicons/vue/24/solid'

const app = useAppStore()

const loading = ref(false)
const wallet = ref({
  balance: '0.00',
  currency: 'XOF',
})
const transactions = ref([])
const receiptOpen = ref(false)
const selectedTransaction = ref(null)

function formatMoney(value, currency = 'XOF') {
  return formatMoneyUtil(Number(value || 0), currency)
}

async function loadWallet() {
  loading.value = true
  try {
    const [balanceResponse, transactionsResponse] = await Promise.all([
      api.get('/wallet/balance'),
      api.get('/wallet/transactions'),
    ])

    const balanceData = balanceResponse?.data?.data || null
    wallet.value = {
      balance: balanceData?.balance || '0.00',
      currency: balanceData?.currency || 'XOF',
    }

    const items = Array.isArray(transactionsResponse?.data?.data?.items)
      ? transactionsResponse.data.data.items
      : []

    transactions.value = items.map((item) => ({
      id: item.id,
      description: item.description || `Transaction #${item.id}`,
      reference: item.reference || 'Aucune reference',
      date: formatShortDate(item.created_at),
      amount: Number(item.amount || 0),
      direction: item.type === 'credit' ? 'in' : 'out',
    }))

  } catch (error) {
    console.warn('Wallet dashboard fallback', error?.message)
  } finally {
    loading.value = false
  }
}

function openReceipt(item) {
  selectedTransaction.value = item
  receiptOpen.value = true
}

function closeReceipt() {
  receiptOpen.value = false
  selectedTransaction.value = null
}

function receiptLine(item) {
  if (!item) return ''
  const direction = item.direction === 'in' ? 'Credit' : 'Debit'
  const sign = item.direction === 'in' ? '+' : '-'
  return [
    'FlexiCare',
    '--- Recu de transaction ---',
    `Description: ${item.description}`,
    `Montant: ${sign}${formatMoney(item.amount, wallet.value.currency)}`,
    `Reference: ${item.reference}`,
    `Date: ${item.date}`,
    `Statut: Confirme`,
    `Type: ${direction}`,
    `Ticket: #${item.id}`,
  ].join('\n')
}

function buildReceiptHtml(item) {
  if (!item) return ''
  const direction = item.direction === 'in' ? 'Credit' : 'Debit'
  const sign = item.direction === 'in' ? '+' : '-'
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reçu FlexiCare</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
    .card { max-width: 520px; margin: 0 auto; background: white; border-radius: 20px; padding: 24px; }
    .head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .logo { width: 44px; height: 44px; border-radius: 14px; background: #ede9fe; display: flex; align-items: center; justify-content: center; }
    .logo img { width: 28px; height: 28px; }
    .title { font-size: 20px; font-weight: 800; margin: 0; }
    .muted { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .18em; margin: 0; }
    .box { background: #f8fafc; border-radius: 16px; padding: 16px; margin-top: 16px; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 12px; }
    .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .18em; margin: 0; }
    .value { font-size: 14px; font-weight: 700; margin: 4px 0 0; }
    .amount { font-size: 24px; font-weight: 900; margin: 4px 0 0; }
    .footer { margin-top: 20px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div class="logo"><img src="/logo_bg_white.png" alt="FlexiCare" /></div>
      <div>
        <p class="muted">Reçu FlexiCare</p>
        <h1 class="title">Transaction enregistrée</h1>
      </div>
    </div>
    <div class="box">
      <p class="muted">Transaction FlexiCare</p>
      <div class="row">
        <div>
          <p class="label">Description</p>
          <p class="value">${item.description}</p>
        </div>
        <div style="padding: 6px 10px; border-radius: 999px; background: ${item.direction === 'in' ? '#ecfdf5' : '#f5f3ff'}; color: ${item.direction === 'in' ? '#047857' : '#6d28d9'}; font-size: 11px; font-weight: 700; height: fit-content;">
          ${direction}
        </div>
      </div>
      <div class="row">
        <div>
          <p class="label">Montant</p>
          <p class="amount">${sign}${formatMoney(item.amount, wallet.value.currency)}</p>
        </div>
        <div>
          <p class="label">Référence</p>
          <p class="value">${item.reference}</p>
        </div>
      </div>
      <div class="row">
        <div>
          <p class="label">Date</p>
          <p class="value">${item.date}</p>
        </div>
        <div>
          <p class="label">Statut</p>
          <p class="value">Confirmé</p>
        </div>
      </div>
      <div class="footer">
        Merci d'utiliser FlexiCare.<br />
        Conservez ce reçu pour votre historique.<br />
        Ticket #${item.id}
      </div>
    </div>
  </div>
</body>
</html>`
}

function printReceipt() {
  if (!selectedTransaction.value) return
  const html = buildReceiptHtml(selectedTransaction.value)
  const printWindow = window.open('', '_blank', 'width=900,height=1100')
  if (!printWindow) return
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  window.setTimeout(() => {
    try {
      printWindow.focus()
      printWindow.print()
    } catch {
      // ignore
    }
  }, 250)
}

function downloadReceipt() {
  if (!selectedTransaction.value) return
  const html = buildReceiptHtml(selectedTransaction.value)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `flexicare-recu-${selectedTransaction.value.id}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function shareReceipt() {
  if (!selectedTransaction.value) return
  const text = receiptLine(selectedTransaction.value)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Reçu FlexiCare',
        text,
      })
      return
    } catch {
      // ignored
    }
  }

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // ignored
  }
}

onMounted(() => {
  if (app.user?.role === 'provider') {
    loadWallet()
  }
})
</script>
