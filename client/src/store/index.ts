import { createPinia } from 'pinia';
import useUserStore from './userStore';
import useMessageStore from './messageStore';

const pinia = createPinia();

export { useUserStore, useMessageStore };
export default pinia;
