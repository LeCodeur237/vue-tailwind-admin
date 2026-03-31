<template>
  <div class="space-y-6 pb-16 sm:pb-20 lg:pb-24">
    <PageHero
      eyebrow="Prestataire"
      title="Partager l'application"
      subtitle="Faites decouvrir FlexiCare a votre equipe, vos proches ou vos partenaires."
    />

    <section class="card-surface p-5">
      <p class="section-title">Lien</p>
      <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Inviter une autre personne</h2>
      <p class="mt-2 text-sm leading-6 text-slate-500">
        Copiez le lien ou utilisez le partage natif du navigateur pour envoyer FlexiCare en quelques secondes.
      </p>

      <div class="mt-5 rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lien d invitation</p>
        <p class="mt-2 break-all text-sm font-medium text-slate-900">{{ shareUrl }}</p>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" class="wide-action bg-violet-600 text-white hover:bg-violet-500" @click="shareApp">
          Partager l'application
        </button>
        <button type="button" class="wide-action border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-700" @click="copyLink">
          Copier le lien
        </button>
      </div>
    </section>

    <section class="card-surface p-5">
      <div>
        <p class="section-title">Pourquoi partager</p>
        <h2 class="mt-1 text-lg font-black tracking-tight text-slate-900">Valeur immediate</h2>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <div class="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
          <p class="font-semibold text-slate-900">Plus de missions</p>
          <p class="mt-1 text-sm leading-6 text-slate-500">Aidez votre reseau a rejoindre la plateforme.</p>
        </div>
        <div class="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
          <p class="font-semibold text-slate-900">Simple a envoyer</p>
          <p class="mt-1 text-sm leading-6 text-slate-500">Un clic suffit sur mobile ou desktop.</p>
        </div>
        <div class="rounded-[1rem] border border-slate-200 bg-slate-50 p-4">
          <p class="font-semibold text-slate-900">Compatible partout</p>
          <p class="mt-1 text-sm leading-6 text-slate-500">Partage natif, copie ou message direct.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PageHero from '@/components/PageHero.vue'
import { useAppStore } from '@/stores/app'

const app = useAppStore()
const shareUrl = computed(() =>
  typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : '/onboarding'
)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    app.pushToast({
      type: 'success',
      title: 'Lien copie',
      message: 'Le lien de partage a ete copie.',
    })
  } catch {
    app.pushToast({
      type: 'error',
      title: 'Impossible de copier',
      message: 'Utilisez le partage natif ou copiez le lien manuellement.',
    })
  }
}

async function shareApp() {
  const payload = {
    title: 'FlexiCare',
    text: 'Decouvrez FlexiCare, une plateforme simple pour gerer missions et revenus.',
    url: shareUrl.value,
  }

  if (navigator.share) {
    try {
      await navigator.share(payload)
      app.pushToast({
        type: 'success',
        title: 'Partage envoye',
        message: 'Le partage a ete lance avec succes.',
      })
      return
    } catch {
      // fall back to copy
    }
  }

  await copyLink()
}
</script>
