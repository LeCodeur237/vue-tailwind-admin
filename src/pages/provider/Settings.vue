<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <PageHero
      eyebrow="Prestataire"
      title="Parametres"
      subtitle="Gerez les reglages generaux de votre compte et de l application."
    />

    <section class="card-surface p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Compte</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Reglages generaux</h2>
        </div>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Langue</span>
          <select v-model="settings.language" class="select-base">
            <option value="fr">Francais</option>
            <option value="en">English</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Fuseau horaire</span>
          <select v-model="settings.timezone" class="select-base">
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="UTC">UTC</option>
          </select>
        </label>
      </div>

      <div class="mt-5 space-y-3">
        <ToggleRow
          title="Notifications"
          description="Recevoir les alertes sur les nouvelles missions et les changements de statut."
          :model-value="settings.notifications"
          @update:model-value="settings.notifications = $event"
        />
        <ToggleRow
          title="Confidentialite"
          description="Masquer les donnees sensibles sur les ecrans partages."
          :model-value="settings.privacy"
          @update:model-value="settings.privacy = $event"
        />
        <ToggleRow
          title="Synchronisation automatique"
          description="Actualiser les missions et revenus en arriere plan."
          :model-value="settings.autoSync"
          @update:model-value="settings.autoSync = $event"
        />
      </div>

      <div class="mt-5">
        <button type="button" class="wide-action bg-violet-600 text-white hover:bg-violet-500" @click="saveSettings">
          Enregistrer les parametres
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import PageHero from '@/components/PageHero.vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const storageKey = 'flexicare-provider-settings'

const settings = reactive({
  language: 'fr',
  timezone: 'Africa/Lagos',
  notifications: true,
  privacy: true,
  autoSync: true,
})

function loadSettings() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    Object.assign(settings, JSON.parse(raw))
  } catch {
    // ignore invalid saved data
  }
}

function saveSettings() {
  localStorage.setItem(storageKey, JSON.stringify({ ...settings }))
  app.pushToast({
    type: 'success',
    title: 'Parametres sauvegardes',
    message: 'Vos reglages ont ete mis a jour.',
  })
}

onMounted(loadSettings)

const ToggleRow = {
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    modelValue: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  template: `
    <button type="button" class="flex w-full items-center justify-between gap-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40" @click="$emit('update:modelValue', !modelValue)">
      <div class="min-w-0">
        <p class="font-semibold text-slate-900">{{ title }}</p>
        <p v-if="description" class="mt-1 text-sm leading-6 text-slate-500">{{ description }}</p>
      </div>
      <span class="flex h-7 w-12 items-center rounded-full p-1 transition" :class="modelValue ? 'bg-violet-600' : 'bg-slate-300'">
        <span class="h-5 w-5 rounded-full bg-white transition" :class="modelValue ? 'translate-x-5' : 'translate-x-0'" />
      </span>
    </button>
  `,
}
</script>
