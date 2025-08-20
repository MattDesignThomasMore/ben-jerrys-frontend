import { createRouter, createWebHistory } from "vue-router";
import CustomizerView from "../components/IceCustomizer.vue";

const routes = [{ path: "/", name: "Customizer", component: CustomizerView }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
