<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-black uppercase tracking-tight text-gray-900 mb-10">{{ t('contact.title') }}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">

      <!-- Form -->
      <div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">{{ t('contact.name') }}</label>
            <input v-model="form.name" type="text" required class="input" />
          </div>
          <div>
            <label class="label">{{ t('contact.email') }}</label>
            <input v-model="form.email" type="email" required class="input" />
          </div>
          <div>
            <label class="label">{{ t('contact.phone') }}</label>
            <input v-model="form.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label">{{ t('contact.message') }}</label>
            <textarea v-model="form.message" rows="5" required class="input resize-none" />
          </div>
          <button type="submit" :disabled="sending" class="btn-primary w-full py-3">
            {{ sending ? '...' : t('contact.send') }}
          </button>
          <p v-if="sent" class="text-green-600 text-sm font-medium text-center">✓ Message sent!</p>
        </form>
      </div>

      <!-- Info -->
      <div class="space-y-6">
        <div>
          <h3 class="font-bold text-gray-900 mb-2">{{ t('contact.address') }}</h3>
          <p class="text-gray-600">Leko demo<br>Musterstraße 1<br>54290 Trier<br>Germany</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 mb-2">{{ t('contact.workingHours') }}</h3>
          <p class="text-gray-600">{{ t('contact.workingHoursValue') }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 mb-2">{{ t('contact.phone') }}</h3>
          <a href="tel:+4965112345678" class="text-primary-600 hover:text-primary-700 font-medium">+49 651 123 4567</a>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 mb-2">{{ t('contact.email') }}</h3>
          <a href="mailto:info@lekocom" class="text-primary-600 hover:text-primary-700 font-medium">info@lekocom</a>
        </div>

        <!-- Map placeholder -->
        <div class="bg-gray-100 rounded h-48 flex items-center justify-center text-gray-400">
          <span class="text-sm">Trier, Germany 📍</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const form = ref({ name: '', email: '', phone: '', message: '' });
const sending = ref(false);
const sent = ref(false);

async function handleSubmit() {
  sending.value = true;
  // Тут можна підключити email сервіс (nodemailer на бекенді)
  await new Promise((r) => setTimeout(r, 1000));
  sent.value = true;
  sending.value = false;
  form.value = { name: '', email: '', phone: '', message: '' };
  setTimeout(() => { sent.value = false; }, 5000);
}
</script>
