<template>
  <div class="min-h-screen w-full overflow-hidden bg-white text-slate-900">
    <div class="mx-auto flex h-screen w-full max-w-none flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header class="flex items-center justify-end gap-4">
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:text-violet-700"
          @click="finishOnboarding"
        >
          Passer
        </button>
      </header>

      <main class="mt-4 flex min-h-0 flex-1 flex-col">
        <section
          class="flex min-h-0 flex-1 overflow-hidden bg-white"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div
            class="flex h-full w-full transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <article
              v-for="slide in slides"
              :key="slide.id"
              class="flex h-full w-full shrink-0 flex-col overflow-y-auto p-5 sm:p-8 lg:p-10"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-violet-500" />
                  <span class="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-500">
                    {{ slide.eyebrow }}
                  </span>
                </div>
                <span class="text-sm font-medium text-slate-400">{{ currentSlide + 1 }}/{{ slides.length }}</span>
              </div>

              <div class="mt-4 flex min-h-0 flex-1 flex-col">
                <div class="max-w-2xl">
                  <div class="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                    <img
                      :src="slide.image"
                      :alt="slide.title"
                      class="aspect-[16/10] w-full object-cover"
                    />
                  </div>

                  <div class="mt-6">
                    <h1 class="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                      {{ slide.title }}
                    </h1>
                    <p class="mt-4 max-w-xl text-sm leading-7  text-slate-600 sm:text-base sm:leading-8">
                      {{ slide.description }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer class="mt-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <button
              v-for="(slide, index) in slides"
              :key="slide.id"
              type="button"
              class="h-2.5 rounded-full transition-all"
              :class="currentSlide === index ? 'w-8 bg-violet-600' : 'w-2.5 bg-slate-300'"
              @click="currentSlide = index"
            />
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-40"
              :disabled="currentSlide === 0"
              @click="previousSlide"
            >
              <ArrowLeftIcon class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              @click="nextSlide"
            >
              <ArrowRightIcon class="h-4 w-4" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/vue/24/solid'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const app = useAppStore()
const currentSlide = ref(0)
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const threshold = 45

const slides = [
  {
    id: 'welcome',
    eyebrow: 'Bienvenue dans FlexiCare',
    title: 'Simplifiez votre vie quotidienne avec FlexiCare.',
    description:
      'FlexiCare vous met en relation avec des professionnels de confiance pour tous vos besoins domestiques.',
    image: '/slide-1.png',
  },
  {
    id: 'provider',
    eyebrow: 'Pour les prestataires',
    title: 'Acceptez, demarrez et terminez vos missions sans friction.',
    description:
      'Visualisez vos missions assignees, activez votre statut en ligne et suivez vos revenus avec des actions rapides.',
    image: '/slide-2.png',
  },
  {
    id: 'client',
    eyebrow: 'Pour les clients',
    title: 'Creer une mission et suivre son avancement facilement.',
    description:
      'Conservez une vue claire de chaque demande, du prestataire assigne et de la progression jusqu a la completion.',
    image: '/slide-3.png',
  },
]

const isLastSlide = computed(() => currentSlide.value === slides.length - 1)

function finishOnboarding() {
  app.markOnboardingSeen()
  router.push('/login')
}

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value += 1
    return
  }
  finishOnboarding()
}

function previousSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value -= 1
  }
}

function onTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
  touchDeltaX.value = 0
}

function onTouchMove(event) {
  touchDeltaX.value = event.touches[0].clientX - touchStartX.value
}

function onTouchEnd() {
  if (touchDeltaX.value < -threshold) {
    nextSlide()
  } else if (touchDeltaX.value > threshold) {
    previousSlide()
  }
}
</script>
