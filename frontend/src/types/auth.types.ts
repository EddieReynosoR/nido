export type LoginRequest = {
  email: string;
  password: string;
};

export interface AuthContextType {
  accessToken: string | null;
  status: AuthStatus;
  login: (request: LoginRequest) => void;
  logout: () => void;
  isLogin: boolean;
}

export type TokenResponse = {
  accessToken: string;
  expiration?: string;
};

export type AuthStatus = 'loading' | 'authed' | 'guest';
