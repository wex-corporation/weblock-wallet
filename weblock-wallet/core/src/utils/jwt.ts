export interface JwtPayload {
  exp?: number
  [key: string]: any
}

export interface IJwt {
  parse(token: string): JwtPayload
}

export const Jwt: IJwt = {
  parse(token: string): JwtPayload {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload) as JwtPayload
    } catch (error) {
      throw new Error(`Error parsing JWT: ${error}`)
    }
  }
}
