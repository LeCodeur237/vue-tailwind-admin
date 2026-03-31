export const statusMeta = (status) => {
  const map = {
    pending: {
      label: 'Créée',
      class: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    },
    assigned: {
      label: 'Attribuée',
      class: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30',
    },
    in_progress: {
      label: 'En cours',
      class: 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
    },
    completed: {
      label: 'Terminée',
      class: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    },
    cancelled: {
      label: 'Annulée',
      class: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    },
    online: {
      label: 'Online',
      class: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    },
    offline: {
      label: 'Offline',
      class: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30',
    },
  }

  return map[status] || {
    label: status,
    class: 'bg-white/10 text-slate-300 ring-1 ring-white/10',
  }
}

export const formatMoney = (value, currency = 'XOF') =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0)

export const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
