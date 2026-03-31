<template>
  <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <p :class="['text-xs font-semibold uppercase tracking-[0.24em]', inverse ? 'text-white/70' : 'text-violet-500']">
        {{ eyebrow }}
      </p>
      <h1 :class="['mt-1 break-words text-2xl font-black tracking-tight', inverse ? 'text-white' : 'text-slate-900']">
        {{ title }}
      </h1>
      <p v-if="subtitle" :class="['mt-1 text-sm leading-6', inverse ? 'text-white/75' : 'text-slate-500']">
        {{ subtitle }}
      </p>
    </div>
    <div class="shrink-0 self-start">
      <slot name="action" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'FlexiCare',
  },
  inverse: {
    type: Boolean,
    default: false,
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
