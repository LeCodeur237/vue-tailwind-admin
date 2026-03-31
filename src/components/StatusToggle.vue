<template>
  <button
    type="button"
    class="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="relative inline-flex h-10 w-20 items-center rounded-full p-1 transition"
      :class="modelValue ? 'bg-violet-100' : 'bg-slate-100'"
    >
      <span
        class="inline-block h-8 w-8 rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition"
        :class="modelValue ? 'translate-x-9' : 'translate-x-0'"
      />
    </span>
    <div>
      <p class="text-[10px] uppercase tracking-[0.24em] text-slate-400">Statut</p>
      <p class="text-sm font-semibold" :class="modelValue ? 'text-violet-700' : 'text-slate-600'">
        {{ modelValue ? 'En ligne' : 'Hors ligne' }}
      </p>
    </div>
  </button>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>
