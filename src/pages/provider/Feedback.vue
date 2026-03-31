<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <PageHero
      eyebrow="Prestataire"
      title="Laisser un commentaire"
      subtitle="Partagez votre avis pour ameliorer l experience FlexiCare."
    />

    <section class="card-surface p-5">
      <div>
        <p class="section-title">Note</p>
        <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Votre niveau de satisfaction</h2>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          v-for="rating in ratings"
          :key="rating"
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold transition"
          :class="form.rating === rating ? 'border-violet-200 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700'"
          @click="form.rating = rating"
        >
          {{ rating }}
        </button>
      </div>
    </section>

    <section class="card-surface p-5">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="section-title">Commentaire</p>
          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Racontez votre experience</h2>
        </div>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="submitFeedback">
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Sujet</span>
          <select v-model="form.subject" class="select-base">
            <option value="experience">Experience generale</option>
            <option value="ui">Interface</option>
            <option value="missions">Gestion des missions</option>
            <option value="revenues">Revenus</option>
            <option value="support">Support</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700">Message</span>
          <textarea
            v-model="form.message"
            rows="5"
            class="input-base resize-none"
            placeholder="Decrivez ce qui fonctionne bien et ce qui peut etre ameliore."
          />
        </label>

        <button type="submit" class="wide-action bg-violet-600 text-white hover:bg-violet-500">
          Envoyer le commentaire
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import PageHero from '@/components/PageHero.vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const ratings = [1, 2, 3, 4, 5]

const form = reactive({
  rating: 5,
  subject: 'experience',
  message: '',
})

function submitFeedback() {
  app.pushToast({
    type: 'success',
    title: 'Merci pour votre retour',
    message: 'Votre commentaire a ete enregistre.',
  })
  form.rating = 5
  form.subject = 'experience'
  form.message = ''
}
</script>
