// auth/UserSession.ts
export interface UserSession {
  sessionId: string
  userId: string
  expiration: Date
}

export interface SessionToken {
  token: string
  createdAt: Date
  expiresAt: Date
}
