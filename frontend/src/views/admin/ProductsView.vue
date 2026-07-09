<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">{{ t('admin.products') }}</h2>
      <RouterLink to="/admin/products/new" class="btn-primary text-sm">
        + {{ t('admin.addProduct') }}
      </RouterLink>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Search..."
        class="input max-w-xs"
        @input="debouncedFetch"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">Loading...</div>

      <table v-else class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Photo</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Ref</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Brand / Model</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Year</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <div class="w-14 h-10 bg-gray-100 rounded overflow-hidden">
                <img
                  v-if="product.photos?.[0]"
                  :src="uploadsUrl(product.photos[0].filename)"
                  class="w-full h-full object-cover"
                />
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ product.referenceNumber }}</td>
            <td class="px-4 py-3">
              <div class="font-semibold text-gray-900">{{ product.brand }}</div>
              <div class="text-gray-400 text-xs">{{ product.model }}</div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ product.category }}</td>
            <td class="px-4 py-3 text-gray-600">{{ product.year || '—' }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ product.active ? t('admin.active') : 'Hidden' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <RouterLink
                  :to="`/admin/products/${product.id}/edit`"
                  class="text-primary-600 hover:text-primary-700 font-medium text-xs"
                >
                  {{ t('admin.editProduct') }}
                </RouterLink>
                <button
                  @click="confirmDelete(product)"
                  class="text-red-500 hover:text-red-700 font-medium text-xs"
                >
                  {{ t('admin.deleteProduct') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="meta.totalPages > 1" class="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <span>{{ meta.total }} products</span>
        <div class="flex gap-1">
          <button
            v-for="p in meta.totalPages"
            :key="p"
            @click="goToPage(p)"
            class="w-8 h-8 rounded text-xs"
            :class="p === currentPage ? 'bg-primary-500 text-white' : 'hover:bg-gray-100'"
          >{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded shadow-xl p-6 max-w-sm w-full">
        <h3 class="font-bold text-gray-900 mb-2">{{ t('admin.deleteProduct') }}</h3>
        <p class="text-gray-600 text-sm mb-6">{{ t('admin.confirmDelete') }}</p>
        <div class="flex gap-3">
          <button @click="deleteProduct" class="btn bg-red-500 text-white hover:bg-red-600 flex-1">
            {{ t('admin.deleteProduct') }}
          </button>
          <button @click="deleteTarget = null" class="btn-outline flex-1">
            {{ t('admin.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { productsApi } from '@/services/api';
import { uploadsUrl } from '@/services/uploads';

const { t } = useI18n();

const products = ref([]);
const meta = ref({ total: 0, totalPages: 0 });
const loading = ref(true);
const search = ref('');
const currentPage = ref(1);
const deleteTarget = ref(null);

let debounceTimer = null;

async function fetchProducts() {
  loading.value = true;
  try {
    const { data } = await productsApi.adminList({ page: currentPage.value, limit: 20, search: search.value });
    products.value = data.data;
    meta.value = data.meta;
  } finally {
    loading.value = false;
  }
}

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchProducts();
  }, 400);
}

function goToPage(p) {
  currentPage.value = p;
  fetchProducts();
}

function confirmDelete(product) {
  deleteTarget.value = product;
}

async function deleteProduct() {
  if (!deleteTarget.value) return;
  await productsApi.delete(deleteTarget.value.id);
  deleteTarget.value = null;
  fetchProducts();
}

onMounted(fetchProducts);
</script>
