// auth/Login.ts
export enum LoginProvider {
  Google = 'google.com',
  Apple = 'apple.com',
  Twitter = 'twitter.com',
  Discord = 'discord.com'
}

export interface LoginWithIdTokenRequest {
  idToken: string
  sig: string
}

export interface LoginWithAccessTokenRequest {
  accessToken: string
  issuer: LoginProvider
  sig: string
}
