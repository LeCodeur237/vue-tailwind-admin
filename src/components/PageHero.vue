<template>
  <section
    class="relative overflow-hidden px-6 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:px-8"
    :style="{ borderRadius: radius }"
    :class="variant === 'violet'
      ? 'border border-violet-200 bg-[linear-gradient(135deg,#7c3aed_0%,#8b5cf6_55%,#a855f7_100%)] text-white shadow-[0_18px_48px_rgba(124,58,237,0.14)]'
      : 'border border-slate-200 bg-white text-slate-900'"
  >
    <div
      class="pointer-events-none absolute inset-0"
      :class="variant === 'violet'
        ? 'bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_24%)]'
        : 'bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.035),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.035),transparent_24%)]'"
    />
    <div class="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div class="max-w-2xl">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em]"
          :class="variant === 'violet' ? 'bg-white/10 text-white/75' : 'bg-violet-50 text-violet-600'"
        >
          <span class="h-2 w-2 rounded-full" :class="variant === 'violet' ? 'bg-white' : 'bg-violet-500'" />
          {{ eyebrow }}
        </span>
        <h1
          class="mt-4 text-2xl font-black tracking-tight sm:text-[2rem]"
          :class="variant === 'violet' ? 'text-white' : 'text-slate-900'"
        >
          {{ title }}
        </h1>
        <p
          class="mt-3 max-w-xl text-sm leading-6 sm:text-[0.98rem]"
          :class="variant === 'violet' ? 'text-white/75' : 'text-slate-500'"
        >
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.action" class="flex shrink-0 items-center gap-3">
        <slot name="action" />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  radius: {
    type: String,
    default: '1.75rem',
  },
  variant: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'violet'].includes(value),
  },
  eyebrow: {
    type: String,
    default: 'FlexiCare',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>
