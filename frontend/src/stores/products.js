import { defineStore } from 'pinia';
import { ref } from 'vue';
import { productsApi } from '@/services/api';

export const useProductsStore = defineStore('products', () => {
  const products = ref([]);
  const product = ref(null);
  const categories = ref([]);
  const filters = ref({ brands: [], yearRange: {}, hoursRange: {} });
  const meta = ref({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts(params) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await productsApi.getAll(params);
      products.value = data.data;
      meta.value = data.meta;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id, locale) {
    loading.value = true;
    error.value = null;
    product.value = null;
    try {
      const { data } = await productsApi.getOne(id, locale);
      product.value = data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await productsApi.getCategories();
      categories.value = data;
    } catch (e) {
      console.error('fetchCategories error:', e);
    }
  }

  async function fetchFilters(category) {
    try {
      const { data } = await productsApi.getFilters(category);
      filters.value = data;
    } catch (e) {
      console.error('fetchFilters error:', e);
    }
  }

  return {
    products, product, categories, filters, meta, loading, error,
    fetchProducts, fetchProduct, fetchCategories, fetchFilters,
  };
});
