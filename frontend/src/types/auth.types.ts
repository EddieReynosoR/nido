export type LoginRequest = {
  email: string;
  password: string;
};

export interface AuthContextType {
  accessToken: string | null;
  login: (request: LoginRequest) => void;
  logout: () => void;
  isLoading: boolean;
  isLogin: boolean;
}

export type TokenResponse = {
  accessToken: string;
  expiration: string | number;
};
