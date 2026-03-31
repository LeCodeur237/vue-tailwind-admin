import { defineStore } from 'pinia'
import api from '@/services/api'
import { clientMissionsSeed, earningsSeed, providerMissionsSeed } from '@/services/mockData'
import { useAppStore } from '@/stores/app'
import { formatShortDate } from '@/utils/display'

const clone = (value) => JSON.parse(JSON.stringify(value))

const updateMission = (missions, id, updater) => {
  const index = missions.findIndex((mission) => String(mission.id) === String(id))
  if (index === -1) return null
  const mission = { ...missions[index] }
  updater(mission)
  missions.splice(index, 1, mission)
  return mission
}

const mapClientMissionItem = (item) => ({
  id: item.id,
  service: item.title || item.service || 'Mission FlexiCare',
  title: item.title || item.service || 'Mission FlexiCare',
  address: item.address || '',
  description: item.description || '',
  amount: Number(item.price || 0),
  status: item.status || 'pending',
  assigned_provider: item.provider?.user?.name || item.provider?.name || item.assigned_provider || 'En attente',
  client_name: item.client?.name || 'Client FlexiCare',
  rating: item.rating ?? null,
  client_started_at: item.client_started_at || null,
  client_completed_at: item.client_completed_at || null,
  provider_started_at: item.provider_started_at || null,
  latitude: item.latitude ?? null,
  longitude: item.longitude ?? null,
  created_at: item.created_at || null,
  updated_at: item.updated_at || null,
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
})

const mapProviderMissionItem = (item) => ({
  id: item.id,
  service: item.title || item.service?.name || 'Mission FlexiCare',
  title: item.title || item.service?.name || 'Mission FlexiCare',
  address: item.address || '',
  description: item.description || '',
  amount: Number(item.price || 0),
  status: item.status || 'pending',
  assigned_provider: item.client?.name || item.assigned_provider || 'Client FlexiCare',
  client_name: item.client?.name || 'Client FlexiCare',
  rating: item.rating ?? null,
  time: item.start_date ? formatShortDate(item.start_date) : 'Horaire a confirmer',
  latitude: item.latitude ?? null,
  longitude: item.longitude ?? null,
  created_at: item.created_at || null,
  updated_at: item.updated_at || null,
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
})

const syncMissionCollection = (missions, mission) => {
  const index = missions.findIndex((item) => String(item.id) === String(mission.id))
  if (index === -1) {
    missions.unshift(mission)
    return mission
  }

  missions.splice(index, 1, { ...missions[index], ...mission })
  return missions[index]
}

export const useMissionStore = defineStore('missions', {
  state: () => ({
    providerStatus: 'offline',
    providerAvailability: {
      availability_days: [],
      availability_start_time: '',
      availability_end_time: '',
      latitude: null,
      longitude: null,
    },
    providerMissions: clone(providerMissionsSeed),
    clientMissions: clone(clientMissionsSeed),
    earnings: clone(earningsSeed),
    providerDashboard: null,
    clientDashboard: null,
    loading: {
      provider: false,
      client: false,
      list: false,
      dashboard: false,
      action: false,
    },
  }),
  getters: {
    providerTodayMissions: (state) => state.providerMissions.slice(0, 2),
    pendingProviderCount: (state) => state.providerMissions.filter((m) => m.status === 'pending').length,
    providerRevenue: (state) => Number(state.providerDashboard?.wallet?.balance ?? state.earnings.today ?? 0),
    providerWallet: (state) => state.providerDashboard?.wallet || {
      balance: '0.00',
      currency: 'XOF',
    },
    providerProfile: (state) => state.providerDashboard?.provider || null,
    providerAvailabilityPayload: (state) => ({
      availability_status: state.providerStatus === 'online' ? 'available' : 'offline',
      availability_days: Array.isArray(state.providerAvailability.availability_days)
        ? state.providerAvailability.availability_days
        : [],
      availability_start_time: state.providerAvailability.availability_start_time || '',
      availability_end_time: state.providerAvailability.availability_end_time || '',
      latitude: state.providerAvailability.latitude,
      longitude: state.providerAvailability.longitude,
    }),
    clientSummaryCards: (state) => state.clientDashboard?.summary_cards || {
      total_missions: state.clientMissions.length,
      in_progress_missions: state.clientMissions.filter((m) => m.status === 'in_progress').length,
      completed_missions: state.clientMissions.filter((m) => m.status === 'completed').length,
      pending_missions: state.clientMissions.filter((m) => m.status === 'pending').length,
    },
    clientSummary: (state) => ({
      total: state.clientDashboard?.summary_cards?.total_missions ?? state.clientMissions.length,
      active: state.clientDashboard?.summary_cards?.in_progress_missions
        ?? state.clientMissions.filter((m) => m.status === 'in_progress').length,
      completed: state.clientDashboard?.summary_cards?.completed_missions
        ?? state.clientMissions.filter((m) => m.status === 'completed').length,
      pending: state.clientDashboard?.summary_cards?.pending_missions
        ?? state.clientMissions.filter((m) => m.status === 'pending').length,
    }),
    clientWallet: (state) => state.clientDashboard?.wallet || {
      balance: '0.00',
      currency: 'XOF',
    },
    clientRecentTransactions: (state) => state.clientDashboard?.recent_transactions || [],
    findProviderMission: (state) => (id) => state.providerMissions.find((mission) => String(mission.id) === String(id)),
    findClientMission: (state) => (id) => state.clientMissions.find((mission) => String(mission.id) === String(id)),
  },
  actions: {
    async fetchProviderDashboard() {
      this.loading.dashboard = true
      try {
        const { data } = await api.get('/provider/dashboard')
        if (data?.success && data?.data) {
          this.providerDashboard = {
            provider: data.data.provider || null,
            wallet: {
              balance: data.data.wallet?.balance || '0.00',
              currency: data.data.wallet?.currency || 'XOF',
            },
            recent_missions: Array.isArray(data.data.recent_missions) ? data.data.recent_missions : [],
          }

          if (this.providerDashboard.provider?.availability_status) {
            this.providerStatus = this.providerDashboard.provider.availability_status === 'available' ? 'online' : 'offline'
          }

          this.providerAvailability = {
            availability_days: Array.isArray(this.providerDashboard.provider?.availability_days)
              ? this.providerDashboard.provider.availability_days
              : [],
            availability_start_time: this.providerDashboard.provider?.availability_start_time || '',
            availability_end_time: this.providerDashboard.provider?.availability_end_time || '',
            latitude: this.providerDashboard.provider?.latitude ?? null,
            longitude: this.providerDashboard.provider?.longitude ?? null,
          }

          this.providerMissions = this.providerDashboard.recent_missions.map(mapProviderMissionItem)
        }
      } catch (error) {
        console.warn('Fallback provider dashboard seed used', error?.message)
      } finally {
        this.loading.dashboard = false
      }
    },
    async fetchProviderMissions() {
      this.loading.provider = true
      try {
        const { data } = await api.get('/provider/missions')
        const items = Array.isArray(data?.data?.items) ? data.data.items : []
        this.providerMissions = items.map(mapProviderMissionItem)
      } catch (error) {
        console.warn('Fallback provider missions seed used', error?.message)
      } finally {
        this.loading.provider = false
      }
    },
    async setProviderStatus(status, coordinates = null) {
      this.providerStatus = status
      try {
        const payload =
          status === 'online'
            ? {
                ...this.providerAvailabilityPayload,
                availability_status: 'available',
                latitude: coordinates?.latitude ?? this.providerAvailability.latitude,
                longitude: coordinates?.longitude ?? this.providerAvailability.longitude,
              }
            : {
                availability_status: 'offline',
              }

        await api.post('/provider/availability', payload)
        if (this.providerDashboard?.provider) {
          this.providerDashboard.provider.availability_status = payload.availability_status
        }
      } catch (error) {
        useAppStore().pushToast({
          type: 'warning',
          title: 'Disponibilité localisée',
          message: 'Le backend est indisponible, la disponibilité a été mise à jour localement.',
        })
      }
    },
    async acceptMission(id) {
      this.loading.action = true
      try {
        await api.post(`/missions/${id}/accept`)
      } catch (error) {
        console.warn('Accept mission fallback', error?.message)
      } finally {
        updateMission(this.providerMissions, id, (mission) => {
          mission.status = 'assigned'
          mission.progress = Math.max(mission.progress, 35)
        })
        updateMission(this.clientMissions, id, (mission) => {
          mission.status = 'assigned'
          mission.progress = Math.max(mission.progress, 35)
        })
        useAppStore().pushToast({
          type: 'info',
          title: 'Mission attribuee',
          message: 'La mission a ete attribuee a un prestataire.',
        })
        this.loading.action = false
      }
    },
    async acceptProviderMission(id) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/provider/missions/${id}/accept`)
        const mission = data?.data?.mission || data?.data || null
        if (mission) {
          syncMissionCollection(this.providerMissions, mapProviderMissionItem(mission))
          syncMissionCollection(this.clientMissions, mapClientMissionItem(mission))
        }

        useAppStore().pushToast({
          type: 'success',
          title: 'Acceptation enregistrée',
          message: data?.message || 'La mission a été acceptée.',
        })
      } catch (error) {
        console.warn('Accept provider mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async startProviderMission(id) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/provider/missions/${id}/start`)
        const mission = data?.data?.mission || data?.data || null
        if (mission) {
          syncMissionCollection(this.providerMissions, mapProviderMissionItem(mission))
          syncMissionCollection(this.clientMissions, mapClientMissionItem(mission))
        }

        useAppStore().pushToast({
          type: 'info',
          title: 'Démarrage confirmé',
          message: data?.message || 'La mission a été marquée comme démarrée.',
        })
      } catch (error) {
        console.warn('Start provider mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async cancelProviderMission(id) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/provider/missions/${id}/cancel`)
        const mission = data?.data?.mission || data?.data || null
        if (mission) {
          syncMissionCollection(this.providerMissions, mapProviderMissionItem(mission))
          syncMissionCollection(this.clientMissions, mapClientMissionItem(mission))
        }

        useAppStore().pushToast({
          type: 'info',
          title: 'Mission annulée',
          message: data?.message || 'La mission a été annulée.',
        })
      } catch (error) {
        console.warn('Cancel provider mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async completeProviderMission(id) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/provider/missions/${id}/complete`)
        const mission = data?.data?.mission || data?.data || null
        if (mission) {
          syncMissionCollection(this.providerMissions, mapProviderMissionItem(mission))
          syncMissionCollection(this.clientMissions, mapClientMissionItem(mission))
        }

        useAppStore().pushToast({
          type: 'success',
          title: 'Mission terminée',
          message: data?.message || 'La mission a été finalisée.',
        })
      } catch (error) {
        console.warn('Complete provider mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async startClientMission(id) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/client/missions/${id}/start`)
        const startedAt = data?.data?.client_started_at || new Date().toISOString()

        updateMission(this.clientMissions, id, (mission) => {
          mission.client_started_at = startedAt
          if (!mission.status) mission.status = 'assigned'
        })

        useAppStore().pushToast({
          type: 'info',
          title: 'Démarrage confirmé',
          message: 'Votre confirmation de démarrage a bien été enregistrée.',
        })
      } catch (error) {
        console.warn('Start client mission fallback', error?.message)
      } finally {
        this.loading.action = false
      }
    },
    async cancelClientMission(id, reason) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/client/missions/${id}/cancel`, {
          reason: reason?.trim(),
        })
        const cancelledMission = data?.data?.mission

        updateMission(this.clientMissions, id, (mission) => {
          mission.status = cancelledMission?.status || 'cancelled'
          mission.cancellation_reason = cancelledMission?.cancellation_reason || reason?.trim() || ''
          mission.progress = 0
        })

        useAppStore().pushToast({
          type: 'info',
          title: 'Mission annulee',
          message: 'La mission a ete annulee avec succes.',
        })
      } catch (error) {
        console.warn('Cancel client mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async completeClientMission(id, paymentMethod) {
      this.loading.action = true
      try {
        const { data } = await api.post(`/client/missions/${id}/complete`, {
          payment_method: paymentMethod,
        })
        const completedMission = data?.data?.mission || data?.data

        updateMission(this.clientMissions, id, (mission) => {
          mission.status = completedMission?.status || 'completed'
          mission.client_completed_at = completedMission?.client_completed_at || new Date().toISOString()
          mission.progress = 100
        })

        useAppStore().pushToast({
          type: 'success',
          title: 'Mission terminee',
          message: 'La mission a ete terminee avec succes.',
        })
      } catch (error) {
        console.warn('Complete client mission fallback', error?.message)
        throw error
      } finally {
        this.loading.action = false
      }
    },
    async startMission(id) {
      this.loading.action = true
      try {
        await api.post(`/missions/${id}/start`)
      } catch (error) {
        console.warn('Start mission fallback', error?.message)
      } finally {
        updateMission(this.providerMissions, id, (mission) => {
          mission.status = 'in_progress'
          mission.progress = Math.max(mission.progress, 65)
        })
        updateMission(this.clientMissions, id, (mission) => {
          mission.status = 'in_progress'
          mission.progress = Math.max(mission.progress, 65)
        })
        useAppStore().pushToast({
          type: 'info',
          title: 'Mission demarree',
          message: 'Le suivi de mission est actif.',
        })
        this.loading.action = false
      }
    },
    async cancelMission(id) {
      this.loading.action = true
      try {
        await api.post(`/missions/${id}/cancel`)
      } catch (error) {
        console.warn('Cancel mission fallback', error?.message)
      } finally {
        updateMission(this.providerMissions, id, (mission) => {
          mission.status = 'cancelled'
          mission.progress = 0
        })
        updateMission(this.clientMissions, id, (mission) => {
          mission.status = 'cancelled'
          mission.progress = 0
        })
        useAppStore().pushToast({
          type: 'info',
          title: 'Mission annulee',
          message: 'La mission a ete annulee.',
        })
        this.loading.action = false
      }
    },
    async completeMission(id) {
      this.loading.action = true
      const relatedMission = this.providerMissions.find((mission) => String(mission.id) === String(id))
      const amount = relatedMission?.amount || 22000
      try {
        await api.post(`/missions/${id}/complete`)
      } catch (error) {
        console.warn('Complete mission fallback', error?.message)
      } finally {
        updateMission(this.providerMissions, id, (mission) => {
          mission.status = 'completed'
          mission.progress = 100
        })
        updateMission(this.clientMissions, id, (mission) => {
          mission.status = 'completed'
          mission.progress = 100
        })
        const app = useAppStore()
        this.earnings.total += amount
        this.earnings.today += amount
        this.earnings.history.unshift({
          id: Date.now(),
          label: `Mission #${id}`,
          date: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          amount,
          status: 'completed',
        })
        app.pushToast({
          type: 'success',
          title: 'Mission terminee',
          message: 'La mission a ete enregistree avec succes.',
        })
        this.loading.action = false
      }
    },
    async createMission(payload) {
      this.loading.client = true
      try {
        const apiPayload = {
          mission_type: payload.mission_type || 'scheduled',
          service_id: Number(payload.service_id),
          title: payload.title?.trim(),
          description: payload.description?.trim(),
          price: Number(payload.price || 0),
          start_date: payload.start_date || null,
          end_date: payload.end_date || null,
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
          address: payload.address?.trim(),
        }

        const { data } = await api.post('/client/missions', apiPayload)
        const created = data?.data ? mapClientMissionItem(data.data) : null

        if (!created) {
          throw new Error(data?.message || 'La mission a ete creee, mais la reponse est invalide.')
        }

        this.clientMissions.unshift(created)
        if (this.clientDashboard?.summary_cards) {
          this.clientDashboard.summary_cards.total_missions += 1
          this.clientDashboard.summary_cards.pending_missions += 1
        }

        useAppStore().pushToast({
          type: 'success',
          title: 'Mission creee',
          message: 'La demande de service a ete envoyee.',
        })

        return created
      } catch (error) {
        console.warn('Create mission failed', error?.message)
        throw error
      } finally {
        this.loading.client = false
      }
    },
    async submitReview({ missionId, rating, note }) {
      try {
        await api.post('/reviews', { mission_id: missionId, rating, note })
      } catch (error) {
        console.warn('Review fallback', error?.message)
      } finally {
        updateMission(this.clientMissions, missionId, (mission) => {
          mission.rating = rating
        })
        useAppStore().pushToast({
          type: 'success',
          title: 'Avis enregistre',
          message: 'Votre note a bien ete prise en compte.',
        })
      }
    },
    async loadClientMissions({ status = '', perPage = 10 } = {}) {
      this.loading.list = true
      try {
        const { data } = await api.get('/client/missions', {
          params: {
            per_page: perPage,
            ...(status ? { status } : {}),
          },
        })
        const items = Array.isArray(data?.data?.items) ? data.data.items : []
        this.clientMissions = items.map(mapClientMissionItem)
      } catch (error) {
        console.warn('Fallback client missions seed used', error?.message)
      } finally {
        this.loading.list = false
      }
    },
    async fetchClientDashboard() {
      this.loading.dashboard = true
      try {
        const { data } = await api.get('/client/dashboard')
        if (data?.success && data?.data) {
          this.clientDashboard = {
            summary_cards: {
              total_missions: Number(data.data.summary_cards?.total_missions || 0),
              in_progress_missions: Number(data.data.summary_cards?.in_progress_missions || 0),
              completed_missions: Number(data.data.summary_cards?.completed_missions || 0),
              pending_missions: Number(data.data.summary_cards?.pending_missions || 0),
            },
            wallet: {
              balance: data.data.wallet?.balance || '0.00',
              currency: data.data.wallet?.currency || 'XOF',
            },
            recent_transactions: Array.isArray(data.data.recent_transactions) ? data.data.recent_transactions : [],
          }
        }
      } catch (error) {
        console.warn('Fallback client dashboard seed used', error?.message)
      } finally {
        this.loading.dashboard = false
      }
    },
  },
})
