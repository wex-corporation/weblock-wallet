import { JwtError } from '../errors';

export class Jwt {
  private static instance: Jwt;

  private constructor() {}

  static getInstance(): Jwt {
    if (!Jwt.instance) {
      Jwt.instance = new Jwt();
    }
    return Jwt.instance;
  }

  /**
   * JWT 토큰을 파싱하여 페이로드를 반환
   * @param token - JWT 토큰 문자열
   * @returns 파싱된 JWT 페이로드
   * @throws {JwtError} 토큰이 유효하지 않거나 파싱 실패시
   */
  parse(token: string): { exp?: number } | null {
    if (!token) {
      return null;
    }

    try {
      const [, base64Payload] = token.split('.');
      if (!base64Payload) {
        throw new Error('Invalid token format');
      }

      const payload = this.decodeBase64Url(base64Payload);
      return JSON.parse(payload);
    } catch (error) {
      throw new JwtError('Failed to parse JWT token', {
        cause: error as Error,
      });
    }
  }

  private decodeBase64Url(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString();
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
}
