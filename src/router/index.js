import { createRouter, createWebHistory } from 'vue-router';
import CustomizerView from '../views/CustomizerView.vue';
import AdminView from '../views/AdminView.vue';
import OrderDetail from '../views/OrderDetail.vue';

const routes = [
  { path: '/', name: 'Customizer', component: CustomizerView },
  { path: '/admin', name: 'Admin', component: AdminView },
  { path: '/admin/order/:id', name: 'OrderDetail', component: OrderDetail }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
