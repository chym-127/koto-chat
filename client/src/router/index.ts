import { createRouter, createWebHashHistory } from 'vue-router';
import Chat from '@pages/chat/index.vue';
import Default from '../layouts/default.vue';


const routes = [
  {
    path: '/',
    redirect: '/chat',
    component: Default,
    children: [
      {
        path: '/chat',
        component: Chat,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  return true;
});

export default router;
