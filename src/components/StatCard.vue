<template>
  <article class="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
    <div class="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 via-violet-300 to-fuchsia-300" />
    <div class="flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{{ label }}</p>
        <p class="mt-2 break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl">{{ value }}</p>
        <p v-if="hint" class="mt-1 break-words text-xs text-slate-500">{{ hint }}</p>
      </div>
      <div class="shrink-0 rounded-2xl bg-violet-50 p-3 text-violet-600 ring-1 ring-violet-100">
        <slot name="icon" />
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
})
</script>
