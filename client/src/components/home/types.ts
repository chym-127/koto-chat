enum UserState {
  OFFLINE = 1,
  ONLINE = 2,
}

interface User {
  id: number;
  username: string;
  state: UserState;
}

export { UserState };

export type { User };
