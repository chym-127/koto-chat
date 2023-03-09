import VueRouter from 'vue-router';
import Chat from '@pages/chat/index.vue';



const About = { template: '<div>About</div>' };

const routes = [
  { path: '/', component: Chat },
  { path: '/about', component: About },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
});

export default router;
