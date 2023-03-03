import { http } from './http';

const login = (data: any = {}) => {
  return http('/login', data);
};

const register = (data: any = {}) => {
  return http('/register', data);
};

const listUser = (data: any = {}) => {
  return http('/list/user', data);
};

export { register, login, listUser };
