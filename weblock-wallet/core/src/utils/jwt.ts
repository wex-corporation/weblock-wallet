interface JwtPayload {
  exp?: number
  iat?: number
  [key: string]: unknown
}

export class Jwt {
  static decode<T extends JwtPayload = JwtPayload>(token: string): T | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (err) {
      console.error('Error decoding JWT:', err)
      return null
    }
  }

  static isExpired(token: string): boolean {
    const payload = this.decode(token)
    if (!payload?.exp) return true
    return Date.now() >= payload.exp * 1000
  }
}

export type { JwtPayload }
