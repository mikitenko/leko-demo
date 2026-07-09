<template>
  <div class="min-h-screen flex bg-gray-100">

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-20 lg:hidden" />

    <!-- Sidebar -->
    <aside
      class="w-64 bg-dark text-white flex flex-col fixed top-0 left-0 h-screen z-30 transition-transform duration-300"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="p-5 border-b border-dark-700 flex items-center justify-between">
        <div>
          <RouterLink to="/" class="text-xl font-bold text-primary-400">Leko GmbH</RouterLink>
          <p class="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
        <button @click="sidebarOpen = false" class="lg:hidden text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <RouterLink
          to="/admin/products"
          @click="sidebarOpen = false"
          class="flex items-center gap-3 px-4 py-2.5 rounded text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
          active-class="bg-primary-500 text-white"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {{ t('admin.products') }}
        </RouterLink>

        <RouterLink
          to="/admin/products/new"
          @click="sidebarOpen = false"
          class="flex items-center gap-3 px-4 py-2.5 rounded text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('admin.addProduct') }}
        </RouterLink>
      </nav>

      <!-- Bottom -->
      <div class="p-4 border-t border-dark-700 space-y-3">
        <!-- Мова -->
        <div class="flex gap-1">
          <button
            v-for="lang in adminLangs"
            :key="lang.code"
            @click="switchLang(lang.code)"
            class="flex-1 py-1.5 text-xs font-bold rounded transition-colors"
            :class="currentLocale === lang.code ? 'bg-primary-500 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'"
          >
            {{ lang.label }}
          </button>
        </div>

        <div class="text-sm text-gray-400 truncate">{{ auth.user?.name }}</div>

        <button @click="handleLogout" class="w-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 text-sm py-1.5 rounded transition-colors">
          {{ t('admin.logout') }}
        </button>
      </div>
    </aside>

    <!-- Content -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-64">

      <!-- Top bar -->
      <header class="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button @click="sidebarOpen = true" class="lg:hidden p-1.5 text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-base font-semibold text-gray-800">{{ t('admin.dashboard') }}</h1>
      </header>

      <main class="flex-1 p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { loadLocale } from '@/i18n';

const { t, locale } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const sidebarOpen = ref(false);

const adminLangs = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

const currentLocale = computed(() => locale.value);

async function switchLang(code) { await loadLocale(code); }

function handleLogout() {
  auth.logout();
  router.push('/login');
}

onMounted(() => loadLocale('de'));
</script>
