import { computed, onBeforeUnmount, ref, watch } from 'vue'
import api from '@/services/api'
import { formatShortDate } from '@/utils/display'

const STATUS_MAP = {
  all: '',
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

function mapMissionItem(item, role) {
  const isClient = role === 'client'

  return {
    id: item.id,
    service: item.title || item.service?.name || 'Mission FlexiCare',
    title: item.title || item.service?.name || 'Mission FlexiCare',
    address: item.address || '',
    description: item.description || '',
    amount: Number(item.price || 0),
    status: item.status || 'pending',
    assigned_provider: isClient
      ? item.provider?.user?.name || item.provider?.name || item.assigned_provider || 'En attente'
      : item.client?.name || item.assigned_provider || 'Client FlexiCare',
    client_name: item.client?.name || 'Client FlexiCare',
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,
    client_started_at: item.client_started_at || null,
    client_completed_at: item.client_completed_at || null,
    provider_started_at: item.provider_started_at || null,
    provider_completed_at: item.provider_completed_at || null,
    progress:
      item.status === 'assigned'
        ? 35
        : item.status === 'in_progress'
          ? 65
          : item.status === 'completed'
            ? 100
            : item.status === 'cancelled'
              ? 0
              : 15,
    time: item.start_date ? formatShortDate(item.start_date) : 'Horaire a confirmer',
    service_category: item.service?.category || '',
  }
}

export function useMissionExplorer(role, options = {}) {
  const endpoint = role === 'provider' ? '/provider/missions' : '/client/missions'
  const perPage = options.perPage || 10
  const filters = options.filters || (role === 'provider'
    ? [
        { label: 'Toutes', value: 'all' },
        { label: 'Effectuées', value: 'completed' },
        { label: 'Annulées', value: 'cancelled' },
      ]
      : [
        { label: 'Toutes', value: 'all' },
        { label: 'En attente', value: 'pending' },
        { label: 'Attribuées', value: 'assigned' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'Terminées', value: 'completed' },
        { label: 'Annulées', value: 'cancelled' },
      ])

  const activeFilter = ref('all')
  const searchQuery = ref('')
  const missions = ref([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const hasMore = ref(true)
  const page = ref(1)
  const total = ref(0)
  const sentinel = ref(null)
  const currentSearch = ref('')
  let observer = null
  let searchTimer = null

  const activeStatus = computed(() => STATUS_MAP[activeFilter.value] || '')

  function clearObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function observeSentinel(el) {
    clearObserver()
    if (!el || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore()
        }
      },
      { rootMargin: '240px' }
    )

    observer.observe(el)
  }

  watch(sentinel, (el) => {
    observeSentinel(el)
  })

  function buildParams(nextPage) {
    const params = {
      per_page: perPage,
      page: nextPage,
    }

    if (activeStatus.value) {
      params.status = activeStatus.value
    }

    const query = currentSearch.value.trim()
    if (query) {
      params.search = query
    }

    return params
  }

  async function fetchPage({ reset = false } = {}) {
    if (loading.value || loadingMore.value) return
    if (!hasMore.value && !reset) return

    const nextPage = reset ? 1 : page.value

    if (reset) {
      missions.value = []
      total.value = 0
      hasMore.value = true
      page.value = 1
    }

    if (nextPage > 1) {
      loadingMore.value = true
    } else {
      loading.value = true
    }

    error.value = ''

    try {
      const { data } = await api.get(endpoint, {
        params: buildParams(nextPage),
      })

      const items = Array.isArray(data?.data?.items) ? data.data.items : []
      const pagination = data?.data?.pagination || {}
      const mapped = items.map((item) => mapMissionItem(item, role))

      missions.value = reset ? mapped : [...missions.value, ...mapped]

      const currentPage = Number(pagination.current_page || nextPage)
      const lastPage = Number(pagination.last_page || currentPage)
      total.value = Number(pagination.total || missions.value.length)
      hasMore.value = currentPage < lastPage && mapped.length > 0
      page.value = hasMore.value ? currentPage + 1 : currentPage
    } catch (fetchError) {
      error.value = fetchError?.response?.data?.message || 'Impossible de charger les missions.'
      hasMore.value = false
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function resetAndLoad() {
    currentSearch.value = searchQuery.value
    return fetchPage({ reset: true })
  }

  function loadMore() {
    if (loading.value || loadingMore.value || !hasMore.value) return
    return fetchPage({ reset: false })
  }

  let debounceHandle = null
  watch(activeFilter, () => {
    resetAndLoad()
  })

  watch(searchQuery, () => {
    if (debounceHandle) clearTimeout(debounceHandle)
    debounceHandle = setTimeout(() => {
      currentSearch.value = searchQuery.value
      resetAndLoad()
    }, 300)
  })

  onBeforeUnmount(() => {
    clearObserver()
    if (debounceHandle) clearTimeout(debounceHandle)
  })

  return {
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
    loadMore,
    activeStatus,
  }
}
