<template>
  <header class="bg-dark text-white sticky top-0 z-40 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-1 shrink-0">
          <span class="text-xl font-black text-white tracking-tight">LEKO</span>
          <span class="text-primary-400 font-black text-xl">GmbH</span>
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink to="/stock" class="text-sm font-medium text-gray-300 hover:text-white transition-colors" active-class="text-primary-400">
            {{ t('nav.stock') }}
          </RouterLink>
          <RouterLink to="/contact" class="text-sm font-medium text-gray-300 hover:text-white transition-colors" active-class="text-primary-400">
            {{ t('nav.contact') }}
          </RouterLink>
        </nav>

        <!-- Search -->
        <form @submit.prevent="handleSearch" class="hidden md:flex flex-1 max-w-sm mx-6">
          <div class="flex w-full">
            <input
              v-model="searchQuery"
              type="search"
              :placeholder="t('home.searchPlaceholder')"
              class="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-l px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400 focus:bg-white/15"
            />
            <button type="submit" class="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-r text-sm transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- Right -->
        <div class="flex items-center gap-2">
          <a href="tel:+4965112345678" class="hidden lg:flex items-center gap-1.5 text-sm text-gray-300 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +49 651 123 4567
          </a>

          <LanguageSwitcher />

          <!-- Mobile burger -->
          <button @click="mobileOpen = !mobileOpen" class="md:hidden p-2 text-gray-300 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-3 space-y-1">
      <RouterLink to="/stock" @click="mobileOpen = false" class="flex items-center gap-2 py-2.5 px-3 rounded text-gray-300 hover:text-white hover:bg-dark-700">
        {{ t('nav.stock') }}
      </RouterLink>
      <RouterLink to="/contact" @click="mobileOpen = false" class="flex items-center gap-2 py-2.5 px-3 rounded text-gray-300 hover:text-white hover:bg-dark-700">
        {{ t('nav.contact') }}
      </RouterLink>
      <a href="tel:+4965112345678" class="flex items-center gap-2 py-2.5 px-3 rounded text-gray-300 hover:text-white hover:bg-dark-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        +49 651 123 4567
      </a>
      <!-- Mobile search -->
      <form @submit.prevent="handleSearch" class="md:hidden px-4 pb-3">
        <div class="flex">
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('home.searchPlaceholder')"
            class="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-primary-400"
          />
          <button type="submit" class="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-r text-sm transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const mobileOpen = ref(false);
const searchQuery = ref('');

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'catalog', query: { search: searchQuery.value } });
    searchQuery.value = '';
    mobileOpen.value = false;
  }
}
</script>
