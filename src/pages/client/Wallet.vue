<template>
  <div class="space-y-6 pb-5 sm:pb-4 lg:pb-4">
    <Loader v-if="loading" class="py-8" />

    <section v-else class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="section-title">Solde</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-900">
            {{ loadingBalance ? '...' : formatMoney(balance, currency) }}
          </p>
          <p class="mt-2 text-sm text-slate-500">Disponible sur votre compte FlexiCare.</p>
        </div>
        <div class="rounded-[1rem] bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
          <WalletIcon class="h-6 w-6" />
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3">
        <RouterLink
          v-if="canRecharge"
          to="/client/wallet/topup"
          class="wide-action bg-violet-600 text-white shadow-[0_12px_24px_rgba(124,58,237,0.14)] hover:bg-violet-500"
        >
          Recharger
        </RouterLink>
        <RouterLink
          to="/client/wallet/withdraw"
          class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700"
        >
          Faire un retrait
        </RouterLink>
      </div>
    </section>

    <section v-if="!loading" class="rounded-[1.5rem] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Historique</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">Dernieres transactions</h2>
        </div>
        <a href="#" class="text-sm font-semibold text-violet-600 transition hover:text-violet-500">
          Voir tout
        </a>
      </div>

      <div class="mt-5 divide-y divide-slate-100">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="flex cursor-pointer items-center justify-between gap-4 py-4 text-left transition first:pt-0 last:pb-0 hover:bg-slate-50/70"
          role="button"
          tabindex="0"
          @click="openReceipt(transaction)"
          @keydown.enter.prevent="openReceipt(transaction)"
          @keydown.space.prevent="openReceipt(transaction)"
        >
          <div class="min-w-0">
            <p class="break-words text-sm font-semibold text-slate-900">{{ transaction.description }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ transaction.date }} • {{ transaction.reference }}</p>
          </div>

          <div class="shrink-0 text-right">
            <p class="font-semibold" :class="transaction.direction === 'in' ? 'text-emerald-600' : 'text-slate-900'">
              {{ transaction.direction === 'in' ? '+' : '-' }}{{ formatMoney(transaction.amount) }}
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
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Description</p>
                      <p class="mt-1 text-sm font-semibold text-slate-900">{{ selectedTransaction?.description }}</p>
                    </div>
                  </div>

                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div class="rounded-[1rem] bg-white p-3">
                      <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Montant</p>
                      <p class="mt-1 text-lg font-black tracking-tight text-slate-900">
                        {{ selectedTransaction?.direction === 'in' ? '+' : '-' }}{{ formatMoney(selectedTransaction?.amount) }}
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
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { ArrowDownTrayIcon, PrinterIcon, ShareIcon, WalletIcon } from '@heroicons/vue/24/solid'
import { useAppStore } from '@/stores/app'
import Loader from '@/components/Loader.vue'
import { formatShortDate } from '@/utils/display'

const app = useAppStore()
const role = computed(() => app.user?.role || app.role)
const canRecharge = computed(() => role.value !== 'provider')
const loadingBalance = ref(false)
const loadingTransactions = ref(false)
const loading = computed(() => loadingBalance.value || loadingTransactions.value)
const balance = ref(0)
const currency = ref('XOF')
const stats = {
  recharges: 120000,
  withdrawals: 45000,
}
const transactions = ref([])
const receiptOpen = ref(false)
const selectedTransaction = ref(null)

function formatMoney(amount, cur = 'XOF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

async function loadBalance() {
  loadingBalance.value = true
  try {
    const { data } = await api.get('/wallet/balance')
    if (data?.success && data?.data) {
      balance.value = Number(data.data.balance || 0)
      currency.value = data.data.currency || 'XOF'
    }
  } catch (error) {
    console.warn('Wallet balance fallback', error?.message)
  } finally {
    loadingBalance.value = false
  }
}

async function loadTransactions() {
  loadingTransactions.value = true
  try {
    const { data } = await api.get('/wallet/transactions')
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    transactions.value = items.slice(0, 5).map((transaction) => ({
      id: transaction.id,
      description: transaction.description || `Transaction #${transaction.id}`,
      reference: transaction.reference || 'Aucune reference',
      date: formatShortDate(transaction.created_at),
      amount: Number(transaction.amount || 0),
      direction: transaction.type === 'credit' ? 'in' : 'out',
      raw: transaction,
    }))
  } catch (error) {
    console.warn('Wallet transactions fallback', error?.message)
  } finally {
    loadingTransactions.value = false
  }
}

function openReceipt(transaction) {
  selectedTransaction.value = transaction
  receiptOpen.value = true
}

function closeReceipt() {
  receiptOpen.value = false
  selectedTransaction.value = null
}

function receiptLine(transaction) {
  if (!transaction) return ''
  const direction = transaction.direction === 'in' ? 'Credit' : 'Debit'
  const sign = transaction.direction === 'in' ? '+' : '-'
  return [
    'FlexiCare',
    '--- Recu de transaction ---',
    `Description: ${transaction.description}`,
    `Montant: ${sign}${formatMoney(transaction.amount)}`,
    `Reference: ${transaction.reference}`,
    `Date: ${transaction.date}`,
    `Statut: Confirme`,
    `Type: ${direction}`,
    `Ticket: #${transaction.id}`,
  ].join('\n')
}

function wrapText(text, maxLen = 54) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLen) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  })

  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

function escapePdfText(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function buildReceiptPdf(transaction) {
  if (!transaction) return new Blob([], { type: 'application/pdf' })

  const direction = transaction.direction === 'in' ? 'Credit' : 'Debit'
  const sign = transaction.direction === 'in' ? '+' : '-'
  const lines = [
    'FlexiCare',
    'Recu de transaction',
    `Description: ${transaction.description}`,
    `Montant: ${sign}${formatMoney(transaction.amount)}`,
    `Reference: ${transaction.reference}`,
    `Date: ${transaction.date}`,
    'Statut: Confirme',
    `Type: ${direction}`,
    `Ticket: #${transaction.id}`,
    'Merci d utiliser FlexiCare.',
    'Conservez ce recu pour votre historique.',
  ].flatMap((line) => wrapText(line, 56))

  const content = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    `(${escapePdfText(lines[0] || 'FlexiCare')}) Tj`,
    '/F1 14 Tf',
    ...lines.slice(1).map((line) => `T* (${escapePdfText(line)}) Tj`),
    'ET',
  ].join('\n')

  const encoder = new TextEncoder()

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = ['0000000000 65535 f \n']

  objects.forEach((object) => {
    offsets.push(`${String(encoder.encode(pdf).length).padStart(10, '0')} 00000 n \n`)
    pdf += object
  })

  const xrefOffset = encoder.encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += offsets.join('')
  pdf += 'trailer\n'
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += 'startxref\n'
  pdf += `${xrefOffset}\n`
  pdf += '%%EOF'

  return new Blob([pdf], { type: 'application/pdf' })
}

function buildReceiptHtml(transaction) {
  if (!transaction) return ''
  const direction = transaction.direction === 'in' ? 'Credit' : 'Debit'
  const sign = transaction.direction === 'in' ? '+' : '-'
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
          <p class="value">${transaction.description}</p>
        </div>
        <div style="padding: 6px 10px; border-radius: 999px; background: ${transaction.direction === 'in' ? '#ecfdf5' : '#f5f3ff'}; color: ${transaction.direction === 'in' ? '#047857' : '#6d28d9'}; font-size: 11px; font-weight: 700; height: fit-content;">
          ${direction}
        </div>
      </div>
      <div class="row">
        <div>
          <p class="label">Montant</p>
          <p class="amount">${sign}${formatMoney(transaction.amount)}</p>
        </div>
        <div>
          <p class="label">Référence</p>
          <p class="value">${transaction.reference}</p>
        </div>
      </div>
      <div class="row">
        <div>
          <p class="label">Date</p>
          <p class="value">${transaction.date}</p>
        </div>
        <div>
          <p class="label">Statut</p>
          <p class="value">Confirmé</p>
        </div>
      </div>
      <div class="footer">
        Merci d'utiliser FlexiCare.<br />
        Conservez ce reçu pour votre historique.<br />
        Ticket #${transaction.id}
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
      // ignored
    }
  }, 250)
}

function downloadReceipt() {
  if (!selectedTransaction.value) return
  const blob = buildReceiptPdf(selectedTransaction.value)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `flexicare-recu-${selectedTransaction.value.id}.pdf`
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

onMounted(loadBalance)
onMounted(loadTransactions)
</script>
