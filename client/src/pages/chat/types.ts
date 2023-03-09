enum UserState {
  OFFLINE = 1,
  ONLINE = 2,
}

interface User {
  id: number;
  username: string;
  state: UserState;
}

interface RecentMsg {
  content: string;
  newMsgCount: number;
  isTyping: boolean;
}

export { UserState };

export type { User, RecentMsg };
