<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <PageHero
      eyebrow="Prestataire"
      title="Preferences"
      subtitle="Affinez votre disponibilite et les types de missions que vous souhaitez recevoir."
    />

    <section class="card-surface p-5">
      <div>
        <p class="section-title">Disponibilite</p>
        <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Votre rythme de travail</h2>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Heure de debut</span>
          <input v-model="preferences.startTime" type="time" class="input-base" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Heure de fin</span>
          <input v-model="preferences.endTime" type="time" class="input-base" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Max missions par jour</span>
          <input v-model.number="preferences.maxPerDay" type="number" min="1" class="input-base" />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Zone principale</span>
          <input v-model="preferences.zone" type="text" class="input-base" placeholder="Lagos, Lekki..." />
        </label>
      </div>
    </section>

    <section class="card-surface p-5">
      <div>
        <p class="section-title">Types de missions</p>
        <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Services favoris</h2>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <label
          v-for="service in serviceOptions"
          :key="service.value"
          class="flex items-center justify-between gap-4 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-4"
        >
          <span class="text-sm font-semibold text-slate-900">{{ service.label }}</span>
          <input v-model="preferences.services" type="checkbox" :value="service.value" class="h-5 w-5 accent-violet-600" />
        </label>
      </div>

      <div class="mt-5">
        <button type="button" class="wide-action bg-violet-600 text-white hover:bg-violet-500" @click="savePreferences">
          Enregistrer les preferences
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
const storageKey = 'flexicare-provider-preferences'

const preferences = reactive({
  startTime: '08:00',
  endTime: '18:00',
  maxPerDay: 5,
  zone: 'Lagos',
  services: ['cleaning', 'delivery'],
})

const serviceOptions = [
  { label: 'Nettoyage', value: 'cleaning' },
  { label: 'Livraison', value: 'delivery' },
  { label: 'Soutien a domicile', value: 'home-care' },
  { label: 'Urgence', value: 'emergency' },
]

function loadPreferences() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    Object.assign(preferences, JSON.parse(raw))
  } catch {
    // ignore invalid saved data
  }
}

function savePreferences() {
  localStorage.setItem(storageKey, JSON.stringify({ ...preferences }))
  app.pushToast({
    type: 'success',
    title: 'Preferences sauvegardees',
    message: 'Vos choix de disponibilite ont ete enregistres.',
  })
}

onMounted(loadPreferences)
</script>
