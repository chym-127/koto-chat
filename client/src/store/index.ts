import { createPinia } from 'pinia';
import useUserStore from './userStore';

const pinia = createPinia();

export { useUserStore };
export default pinia;
