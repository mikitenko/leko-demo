import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
      { path: 'stock', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
      { path: 'stock/:category', name: 'catalog-category', component: () => import('@/views/CatalogView.vue') },
      { path: 'product/:id', name: 'product', component: () => import('@/views/ProductView.vue') },
      { path: 'contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin', redirect: '/admin/products' },
      { path: 'products', name: 'admin-products', component: () => import('@/views/admin/ProductsView.vue') },
      { path: 'products/new', name: 'admin-product-new', component: () => import('@/views/admin/ProductFormView.vue') },
      { path: 'products/:id/edit', name: 'admin-product-edit', component: () => import('@/views/admin/ProductFormView.vue') },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }
  }
  next();
});

export default router;
