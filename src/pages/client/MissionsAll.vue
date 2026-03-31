<template>
  <div class="min-w-0 space-y-4 overflow-x-hidden px-3 pb-2 sm:px-0 sm:pb-5 lg:pb-4">
    <section class="rounded-[1.5rem] bg-white p-4  sm:p-6">
      <div class="flex items-center gap-3">
        <label class="block min-w-0 flex-1">
          <span class="sr-only">Rechercher une mission</span>
          <div class="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-3 py-2.5">
            <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
            <input v-model="searchQuery" type="search" placeholder="Rechercher par service, adresse, statut..."
              class="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </div>
        </label>

        <div class="flex shrink-0 items-center gap-2">
          <span
            class="hidden rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-100 sm:inline-flex">
            {{ total }} mission(s)
          </span>
          <div ref="filtersMenuRef" class="relative">
            <button type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:text-violet-700"
              @click="filtersMenuOpen = !filtersMenuOpen">
              <span class="sr-only">Ouvrir les filtres</span>
              <EllipsisVerticalIcon class="h-5 w-5" />
            </button>

            <div v-if="filtersMenuOpen"
              class="absolute right-0 top-12 z-20 min-w-52 overflow-hidden rounded-[1rem] border border-slate-200 bg-white py-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
              <button v-for="filter in filters" :key="filter.value" type="button"
                class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold transition"
                :class="activeFilter === filter.value
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                @click="activeFilter = filter.value; filtersMenuOpen = false">
                <span>{{ filter.label }}</span>
                <span v-if="activeFilter === filter.value" class="h-2.5 w-2.5 rounded-full bg-violet-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <span class="rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
          {{ total }} mission(s)
        </span>
      </div>
    </section>

    <Loader v-if="loading" />

    <section v-else class="space-y-3">
      <MissionCard v-for="mission in missions" :key="mission.id" :mission="mission" role="client" />

      <div v-if="!missions.length && !loading"
        class="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 ">
        Aucune mission ne correspond à ce filtre.
      </div>

      <div ref="sentinel" class="h-6" />

      <div v-if="loadingMore" class="py-2">
        <Loader />
      </div>
    </section>

    <p v-if="error" class="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import MissionCard from '@/components/MissionCard.vue'
import Loader from '@/components/Loader.vue'
import { useMissionExplorer } from '@/composables/useMissionExplorer'

const {
  activeFilter,
  searchQuery,
  filters,
  missions,
  loading,
  loadingMore,
  error,
  hasMore,
  total,
  sentinel,
  resetAndLoad,
} = useMissionExplorer('client', { perPage: 8 })

const filtersMenuOpen = ref(false)
const filtersMenuRef = ref(null)

function closeFiltersMenuOnOutsideClick(event) {
  if (!filtersMenuOpen.value) return
  if (!filtersMenuRef.value) return
  if (filtersMenuRef.value.contains(event.target)) return
  filtersMenuOpen.value = false
}

onMounted(() => {
  resetAndLoad()
  document.addEventListener('click', closeFiltersMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeFiltersMenuOnOutsideClick)
})
</script>
