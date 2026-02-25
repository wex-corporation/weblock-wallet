interface JwtPayload {
  exp?: number
  [key: string]: any
}

interface IJwt {
  parse(token: string): JwtPayload
  tryParse(token: string): JwtPayload | null
}

const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const missingPadding = (4 - (base64.length % 4)) % 4
  const padded = `${base64}${'='.repeat(missingPadding)}`
  return atob(padded)
}

const parseToken = (token: string): JwtPayload | null => {
  try {
    const [, payloadSegment] = token.split('.')
    if (!payloadSegment) return null

    const decoded = decodeBase64Url(payloadSegment)
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )

    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

export const Jwt: IJwt = {
  parse(token: string): JwtPayload {
    const payload = parseToken(token)
    if (!payload) {
      throw new Error('Error parsing JWT')
    }
    return payload
  },
  tryParse(token: string): JwtPayload | null {
    return parseToken(token)
  },
}
