<template>
  <div class="flex min-h-screen items-center justify-center bg-violet-600 px-6">
    <img src="/logo_any_bg.png" alt="FlexiCare" class="h-24 w-24 object-contain" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const app = useAppStore()

onMounted(() => {
  window.setTimeout(() => {
    app.markSplashReady()

    if (!app.onboardingSeen) {
      router.replace('/onboarding')
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (redirect.startsWith('/')) {
      router.replace(redirect)
      return
    }

    const role = app.user?.role || app.role

    if (app.isAuthenticated && role) {
      if (role === 'provider') {
        router.replace('/provider/dashboard')
        return
      }

      if (role === 'client') {
        router.replace('/client/dashboard')
        return
      }

      if (role === 'admin' || role === 'superadmin') {
        router.replace('/provider/dashboard')
        return
      }

      router.replace('/login')
      return
    }

    router.replace('/login')
  }, 1100)
})
</script>
