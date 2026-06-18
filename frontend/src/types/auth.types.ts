export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginClaims = {
  accessToken: string;
  expiration: string;
}