import { split, combine } from 'shamir-secret-sharing';
import { SecretSharingError } from '../errors';

export class Secrets {
  private static instance: Secrets;

  private constructor() {}

  static getInstance(): Secrets {
    if (!Secrets.instance) {
      Secrets.instance = new Secrets();
    }
    return Secrets.instance;
  }

  /**
   * 비밀값을 여러 조각으로 분할
   * @param secret - 분할할 비밀값 (16진수 문자열)
   * @param total - 총 조각 수
   * @param threshold - 복구에 필요한 최소 조각 수
   * @throws {SecretSharingError} 분할 실패시
   */
  async split(
    secret: string,
    total: number,
    threshold: number
  ): Promise<string[]> {
    try {
      const cleanSecret = this.removeHexPrefix(secret);
      const secretBytes = new Uint8Array(Buffer.from(cleanSecret, 'hex'));

      const shares = await split(secretBytes, total, threshold);
      return shares.map((share) => Buffer.from(share).toString('hex'));
    } catch (error) {
      throw new SecretSharingError('Failed to split secret', {
        cause: error as Error,
      });
    }
  }

  /**
   * 분할된 조각들을 결합하여 원래의 비밀값 복구
   * @param shares - 비밀 조각들 (16진수 문자열 배열)
   * @throws {SecretSharingError} 결합 실패시
   */
  async combine(shares: string[]): Promise<string> {
    try {
      const shareBytes = shares.map(
        (share) => new Uint8Array(Buffer.from(share, 'hex'))
      );

      const combined = await combine(shareBytes);
      return this.addHexPrefix(Buffer.from(combined).toString('hex'));
    } catch (error) {
      throw new SecretSharingError('Failed to combine shares', {
        cause: error as Error,
      });
    }
  }

  private removeHexPrefix(hex: string): string {
    return hex.startsWith('0x') ? hex.slice(2) : hex;
  }

  private addHexPrefix(hex: string): string {
    return `0x${hex}`;
  }
}
