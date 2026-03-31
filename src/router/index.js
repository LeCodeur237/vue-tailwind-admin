import { createRouter, createWebHistory } from 'vue-router'
import SplashScreen from '@/pages/SplashScreen.vue'
import Onboarding from '@/pages/Onboarding.vue'
import LoginPage from '@/pages/Login.vue'
import ClientRegisterPage from '@/pages/client/Register.vue'
import ProviderLayout from '@/layouts/ProviderLayout.vue'
import ClientLayout from '@/layouts/ClientLayout.vue'
import pinia from '@/pinia'
import { useAppStore } from '@/stores/app'

const providerRoutes = [
  {
    path: 'dashboard',
    name: 'ProviderDashboard',
    component: () => import('@/pages/provider/Dashboard.vue'),
    meta: { title: 'Prestataire - Dashboard' },
  },
  {
    path: 'missions',
    name: 'ProviderMissions',
    component: () => import('@/pages/provider/Missions.vue'),
    meta: { title: 'Prestataire - Missions' },
  },
  {
    path: 'missions/all',
    name: 'ProviderMissionsAll',
    component: () => import('@/pages/provider/MissionsAll.vue'),
    meta: { title: 'Prestataire - Toutes les missions' },
  },
  {
    path: 'missions/:id',
    name: 'ProviderMissionDetail',
    component: () => import('@/pages/provider/MissionDetail.vue'),
    meta: { title: 'Prestataire - Detail mission' },
  },
  {
    path: 'earnings',
    name: 'ProviderEarnings',
    component: () => import('@/pages/provider/Earnings.vue'),
    meta: { title: 'Prestataire - Revenus' },
  },
  {
    path: 'earnings/withdraw',
    name: 'ProviderEarningsWithdraw',
    component: () => import('@/pages/provider/Withdraw.vue'),
    meta: { title: 'Prestataire - Retrait' },
  },
  {
    path: 'profile',
    name: 'ProviderProfile',
    component: () => import('@/pages/provider/Profile.vue'),
    meta: { title: 'Prestataire - Profil' },
  },
  {
    path: 'profile/informations',
    name: 'ProviderInformations',
    component: () => import('@/pages/provider/Informations.vue'),
    meta: { title: 'Prestataire - Mes informations' },
  },
  {
    path: 'profile/informations/edit',
    name: 'ProviderInformationsEdit',
    component: () => import('@/pages/provider/InformationsEdit.vue'),
    meta: { title: 'Prestataire - Modifier mes informations' },
  },
  {
    path: 'settings',
    name: 'ProviderSettings',
    component: () => import('@/pages/provider/Settings.vue'),
    meta: { title: 'Prestataire - Parametres' },
  },
  {
    path: 'preferences',
    name: 'ProviderPreferences',
    component: () => import('@/pages/provider/Preferences.vue'),
    meta: { title: 'Prestataire - Preferences' },
  },
  {
    path: 'share',
    name: 'ProviderShare',
    component: () => import('@/pages/provider/ShareApp.vue'),
    meta: { title: "Prestataire - Partager l'application" },
  },
  {
    path: 'feedback',
    name: 'ProviderFeedback',
    component: () => import('@/pages/provider/Feedback.vue'),
    meta: { title: 'Prestataire - Commentaire' },
  },
]

const clientRoutes = [
  {
    path: 'dashboard',
    name: 'ClientDashboard',
    component: () => import('@/pages/client/Dashboard.vue'),
    meta: { title: 'Client - Dashboard' },
  },
  {
    path: 'missions/create',
    name: 'CreateMission',
    component: () => import('@/pages/client/CreateMission.vue'),
    meta: { title: 'Client - Nouvelle mission' },
  },
  {
    path: 'wallet',
    name: 'ClientWallet',
    component: () => import('@/pages/client/Wallet.vue'),
    meta: { title: 'Client - Portefeuille' },
  },
  {
    path: 'wallet/topup',
    name: 'ClientWalletTopup',
    component: () => import('@/pages/client/WalletTopup.vue'),
    meta: { title: 'Client - Recharge wallet' },
  },
  {
    path: 'wallet/withdraw',
    name: 'ClientWalletWithdraw',
    component: () => import('@/pages/client/WalletWithdraw.vue'),
    meta: { title: 'Client - Retrait wallet' },
  },
  {
    path: 'missions',
    name: 'ClientMissions',
    component: () => import('@/pages/client/Missions.vue'),
    meta: { title: 'Client - Missions' },
  },
  {
    path: 'missions/all',
    name: 'ClientMissionsAll',
    component: () => import('@/pages/client/MissionsAll.vue'),
    meta: { title: 'Client - Toutes les missions' },
  },
  {
    path: 'missions/:id',
    name: 'ClientMissionDetail',
    component: () => import('@/pages/client/MissionDetail.vue'),
    meta: { title: 'Client - Detail mission' },
  },
  {
    path: 'missions/:id/searching',
    name: 'ClientMissionSearch',
    component: () => import('@/pages/client/MissionSearch.vue'),
    meta: { title: 'Client - Recherche prestataire' },
  },
  {
    path: 'profile',
    name: 'ClientProfile',
    component: () => import('@/pages/client/Profile.vue'),
    meta: { title: 'Client - Profil' },
  },
  {
    path: 'profile/details',
    name: 'ClientProfileDetails',
    component: () => import('@/pages/client/ProfileEdit.vue'),
    meta: { title: 'Client - Profil' },
  },
  {
    path: 'profile/edit',
    name: 'ClientProfileEdit',
    component: () => import('@/pages/client/ProfileUpdate.vue'),
    meta: { title: 'Client - Profil' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/splash' },
    { path: '/splash', name: 'Splash', component: SplashScreen, meta: { title: 'FlexiCare' } },
    { path: '/onboarding', name: 'Onboarding', component: Onboarding, meta: { title: 'Bienvenue sur FlexiCare' } },
    { path: '/login', name: 'Login', component: LoginPage, meta: { title: 'Connexion' } },
    { path: '/client/register', name: 'ClientRegister', component: ClientRegisterPage, meta: { title: 'Créer un compte client' } },
    {
      path: '/provider',
      component: ProviderLayout,
      children: providerRoutes,
      redirect: '/provider/dashboard',
    },
    {
      path: '/client',
      component: ClientLayout,
      children: clientRoutes,
      redirect: '/client/dashboard',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

const publicRoutes = new Set(['Splash', 'Onboarding', 'Login', 'ClientRegister'])
let hasBooted = false

function getHomeRoute(role) {
  if (role === 'client') return '/client/dashboard'
  if (role === 'provider') return '/provider/dashboard'
  if (role === 'admin' || role === 'superadmin') return '/provider/dashboard'
  return '/login'
}

router.beforeEach((to) => {
  const app = useAppStore(pinia)
  const isPublicRoute = publicRoutes.has(to.name)
  const role = app.user?.role || app.role
  const isAuthenticated = app.isAuthenticated && !!app.token

  if (!hasBooted && to.name === 'Splash') {
    hasBooted = true
  }

  if (!hasBooted && to.name !== 'Splash') {
    hasBooted = true
    return {
      name: 'Splash',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (!isAuthenticated && !isPublicRoute) {
    return '/login'
  }

  if (isAuthenticated && isPublicRoute && to.name !== 'Splash') {
    return getHomeRoute(role)
  }

  if (to.path.startsWith('/client') && !['client', 'admin', 'superadmin'].includes(role)) {
    return getHomeRoute(role)
  }

  if (to.path.startsWith('/provider') && !['provider', 'admin', 'superadmin'].includes(role)) {
    return getHomeRoute(role)
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} | FlexiCare` : 'FlexiCare'
})

export default router
