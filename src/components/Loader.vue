<template>
  <div class="flex items-center justify-center gap-3 py-8 text-slate-300">
    <div class="h-5 w-5 animate-spin rounded-full border-2 border-flexi-blue border-t-transparent" />
    <span class="text-sm font-medium">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: 'Chargement en cours...',
  },
})
</script>
