<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="bg-white rounded shadow-lg p-8 w-full max-w-sm">

      <div class="text-center mb-8">
        <span class="text-2xl font-black text-dark">LEKO</span>
        <span class="text-primary-500 font-black text-2xl">GmbH</span>
        <p class="text-sm text-gray-400 mt-1">Admin Panel</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="label">{{ t('admin.email') }}</label>
          <input v-model="email" type="email" required autocomplete="email" class="input" />
        </div>
        <div>
          <label class="label">{{ t('admin.password') }}</label>
          <input v-model="password" type="password" required autocomplete="current-password" class="input" />
        </div>

        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-3">
          {{ loading ? '...' : t('admin.login') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <RouterLink to="/" class="text-sm text-gray-400 hover:text-gray-600">← Back to site</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push(route.query.redirect || '/admin');
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
