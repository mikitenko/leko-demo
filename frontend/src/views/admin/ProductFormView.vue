<template>
  <div class="max-w-4xl">
    <div class="sticky top-[52px] z-20 bg-gray-100 -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6 border-b border-gray-200 flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <RouterLink to="/admin/products" class="text-gray-400 hover:text-gray-600 text-lg">←</RouterLink>
        <h2 class="text-xl font-bold text-gray-800">
          {{ isEdit ? t('admin.editProduct') : t('admin.addProduct') }}
        </h2>
      </div>
      <div class="flex items-center gap-3">
        <RouterLink to="/admin/products" class="btn-outline px-5 py-2">
          {{ t('admin.cancel') }}
        </RouterLink>
        <button type="submit" form="product-form" :disabled="saving" class="btn-primary px-5 py-2">
          {{ saving ? '...' : t('admin.save') }}
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

    <form id="product-form" @submit.prevent="handleSubmit" class="space-y-6">

      <!-- Main info -->
      <div class="bg-white rounded shadow p-6">
        <h3 class="font-semibold text-gray-700 mb-4">Main Information</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="label">Reference Number *</label>
            <input v-model="form.referenceNumber" type="text" required class="input" placeholder="E00001" />
          </div>
          <div>
            <label class="label">Category *</label>
            <select v-model="form.category" required class="input">
              <option value="">Select category</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="label">Brand *</label>
            <input v-model="form.brand" type="text" required class="input" placeholder="Caterpillar" />
          </div>
          <div>
            <label class="label">Model *</label>
            <input v-model="form.model" type="text" required class="input" placeholder="390F LME" />
          </div>
          <div>
            <label class="label">Year</label>
            <input v-model="form.year" type="number" min="1950" :max="new Date().getFullYear()" class="input" />
          </div>
          <div>
            <label class="label">Hours</label>
            <input v-model="form.hours" type="number" min="0" class="input" />
          </div>
          <div>
            <label class="label">Condition</label>
            <select v-model="form.condition" class="input">
              <option value="USED">Used</option>
              <option value="NEW">New</option>
            </select>
          </div>
          <div>
            <label class="label">Location</label>
            <input v-model="form.location" type="text" class="input" placeholder="Demo, Locatioon" />
          </div>
          <div>
            <label class="label">Price (€)</label>
            <input v-model="form.price" type="number" min="0" class="input" :disabled="form.priceOnRequest" />
          </div>
          <div class="flex flex-col gap-3 pt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.priceOnRequest" class="accent-primary-500" />
              <span class="text-sm font-medium text-gray-700">Price on request</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.inYard" class="accent-primary-500" />
              <span class="text-sm font-medium text-gray-700">{{ t('product.inYard') }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.featured" class="accent-primary-500" />
              <span class="text-sm font-medium text-gray-700">{{ t('admin.featured') }}</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.active" class="accent-primary-500" />
              <span class="text-sm font-medium text-gray-700">{{ t('admin.active') }}</span>
            </label>
          </div>
        </div>

        <div class="mt-4">
          <label class="label">Highlights</label>
          <input v-model="form.highlights" type="text" class="input" placeholder="VG UNDERCARRIAGE - CE/EPA" />
        </div>
      </div>

      <!-- Photos -->
      <div class="bg-white rounded shadow p-6">
        <h3 class="font-semibold text-gray-700 mb-4">{{ t('admin.uploadPhotos') }}</h3>

        <!-- Existing photos (edit mode) -->
        <div v-if="existingPhotos.length" class="flex flex-wrap gap-3 mb-4">
          <div v-for="photo in existingPhotos" :key="photo.id" class="relative group">
            <img :src="uploadsUrl(photo.filename)" class="w-24 h-20 object-cover rounded border border-gray-200" alt="" />
            <button
              type="button"
              @click="removeExistingPhoto(photo.id)"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >✕</button>
          </div>
        </div>

        <!-- New photos preview -->
        <div v-if="newPhotoPreviews.length" class="flex flex-wrap gap-3 mb-4">
          <div v-for="(preview, idx) in newPhotoPreviews" :key="idx" class="relative group">
            <img :src="preview.url" class="w-24 h-20 object-cover rounded border border-primary-200" alt="" />
            <button
              type="button"
              @click="removeNewPhoto(idx)"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >✕</button>
          </div>
        </div>

        <!-- Drop zone -->
        <div
          @dragenter.prevent="dragActive = true"
          @dragover.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          @drop.prevent="onDrop"
          @click="fileInputRef?.click()"
          tabindex="0"
          class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors focus:outline-none focus:border-primary-400"
          :class="dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'"
        >
          <svg class="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm text-gray-600 font-medium">
            Drag & drop images here, click to browse, or paste from clipboard
          </p>
          <p class="text-xs text-gray-400 mt-1">JPEG, PNG, WebP • Max 5 MB per file</p>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          @change="onFileSelect"
          class="hidden"
        />
      </div>

      <!-- Translations -->
      <div class="bg-white rounded shadow p-6">
        <h3 class="font-semibold text-gray-700 mb-4">{{ t('admin.translations') }}</h3>
        <div class="space-y-4">
          <div v-for="lang in languages" :key="lang.code" class="border border-gray-100 rounded p-4">
            <div class="flex items-center gap-2 mb-3">
              <span>{{ lang.flag }}</span>
              <span class="font-medium text-sm text-gray-700">{{ lang.label }}</span>
            </div>
            <div class="space-y-2">
              <input
                v-model="form.translations[lang.code].title"
                type="text"
                :placeholder="`Title in ${lang.label}`"
                class="input text-sm"
              />
              <textarea
                v-model="form.translations[lang.code].description"
                :placeholder="`Description in ${lang.label}`"
                rows="2"
                class="input text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { productsApi } from '@/services/api';
import { uploadsUrl } from '@/services/uploads';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const isEdit = computed(() => !!route.params.id);
const saving = ref(false);
const error = ref('');
const existingPhotos = ref([]);
const newPhotoFiles = ref([]);
const newPhotoPreviews = ref([]);
const dragActive = ref(false);
const fileInputRef = ref(null);

const languages = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski',     flag: '🇵🇱' },
  { code: 'cs', label: 'Čeština',    flag: '🇨🇿' },
  { code: 'ro', label: 'Română',     flag: '🇷🇴' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
];

const categories = [
  'Excavators', 'Dozers', 'Motor Graders', 'Loaders', 'Rollers', 'Pipeline',
  'Crushers', 'Screens', 'Conveyors', 'Drills', 'Compactors', 'Dump Trucks',
  'Telescopic Handlers', 'Forklifts', 'Cranes', 'Carriers', 'Chip Spreaders',
  'Asphalt Pavers', 'Trucks', 'Trailers', 'Generators', 'Forestry', 'Tractors',
  'Harvesters', 'Parts', 'Attachments', 'Buckets', 'Engines',
];

const emptyTranslations = () =>
  Object.fromEntries(languages.map((l) => [l.code, { title: '', description: '' }]));

const form = ref({
  referenceNumber: '',
  category: '',
  brand: '',
  model: '',
  year: '',
  hours: '',
  condition: 'USED',
  price: '',
  priceOnRequest: true,
  inYard: true,
  location: 'Demo, Locatioon',
  highlights: '',
  featured: false,
  active: true,
  translations: emptyTranslations(),
});

async function handleSubmit() {
  saving.value = true;
  error.value = '';
  try {
    const translations = Object.entries(form.value.translations)
      .filter(([, v]) => v.title)
      .map(([locale, v]) => ({ locale, ...v }));

    const payload = { ...form.value, translations };

    let productId;

    if (isEdit.value) {
      await productsApi.update(route.params.id, payload);
      productId = route.params.id;
    } else {
      const { data } = await productsApi.create(payload);
      productId = data.id;
    }

    // Upload new photos if any
    if (newPhotoFiles.value.length && productId) {
      await productsApi.uploadPhotos(productId, newPhotoFiles.value);
    }

    router.push('/admin/products');
  } catch (e) {
    error.value = e.response?.data?.error || 'Error saving product';
  } finally {
    saving.value = false;
  }
}

// ─── Photo handling ───────────────────────────────────────────────────────────

function addFiles(files) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  for (const file of files) {
    if (!allowed.includes(file.type)) continue;
    if (file.size > maxSize) continue;
    newPhotoFiles.value.push(file);
    newPhotoPreviews.value.push({ url: URL.createObjectURL(file) });
  }
}

function onFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length) addFiles(files);
  e.target.value = '';
}

function onDrop(e) {
  dragActive.value = false;
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length) addFiles(files);
}

function onPaste(e) {
  const items = Array.from(e.clipboardData?.items || []);
  const files = items
    .filter(item => item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean);
  if (files.length) addFiles(files);
}

function removeNewPhoto(idx) {
  URL.revokeObjectURL(newPhotoPreviews.value[idx].url);
  newPhotoFiles.value.splice(idx, 1);
  newPhotoPreviews.value.splice(idx, 1);
}

async function removeExistingPhoto(photoId) {
  await productsApi.deletePhoto(photoId);
  existingPhotos.value = existingPhotos.value.filter((p) => p.id !== photoId);
}

function globalPasteHandler(e) {
  const items = Array.from(e.clipboardData?.items || []);
  const files = items
    .filter(item => item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean);
  if (files.length) addFiles(files);
}

async function handlePhotoUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  await productsApi.uploadPhotos(route.params.id, files);
  await loadProduct();
}

async function removePhoto(photoId) {
  await productsApi.deletePhoto(photoId);
  existingPhotos.value = existingPhotos.value.filter((p) => p.id !== photoId);
}

async function loadProduct() {
  if (!isEdit.value) return;
  const { data } = await productsApi.getOne(route.params.id, 'en');
  existingPhotos.value = data.photos || [];

  form.value = {
    referenceNumber: data.referenceNumber,
    category: data.category,
    brand: data.brand,
    model: data.model,
    year: data.year || '',
    hours: data.hours || '',
    condition: data.condition,
    price: data.price || '',
    priceOnRequest: data.priceOnRequest,
    inYard: data.inYard,
    location: data.location || '',
    highlights: data.highlights || '',
    featured: data.featured,
    active: data.active,
    translations: emptyTranslations(),
  };

  data.translations?.forEach((tr) => {
    if (form.value.translations[tr.locale]) {
      form.value.translations[tr.locale] = { title: tr.title, description: tr.description || '' };
    }
  });
}

onMounted(() => {
  document.addEventListener('paste', globalPasteHandler);
  loadProduct();
});

onBeforeUnmount(() => {
  document.removeEventListener('paste', globalPasteHandler);
  newPhotoPreviews.value.forEach(p => URL.revokeObjectURL(p.url));
});
</script>
