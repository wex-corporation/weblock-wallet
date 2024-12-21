import { parseUnits, formatUnits } from 'ethers'

export class TokenAmount {
  /**
   * Wei 단위의 값을 사용자가 읽을 수 있는 형태로 변환
   * @param value - Wei 단위의 값 (hex string 또는 decimal string)
   * @param decimals - 토큰의 소수점 자리수
   * @returns 변환된 문자열
   */
  static fromWei(value: string, decimals: number): string {
    try {
      return formatUnits(value, decimals)
    } catch (error) {
      console.error('Error converting from wei:', error)
      return '0.0'
    }
  }

  /**
   * 사용자 입력값을 Wei 단위로 변환
   * @param value - 사용자 입력값 (예: "1.5")
   * @param decimals - 토큰의 소수점 자리수
   * @returns Wei 단위의 값
   */
  static toWei(value: string, decimals: number): string {
    try {
      return parseUnits(value, decimals).toString()
    } catch (error) {
      console.error('Error converting to wei:', error)
      return '0'
    }
  }

  /**
   * 표시용 포맷으로 변환
   * @param value - Wei 단위의 값
   * @param decimals - 토큰의 소수점 자리수
   * @param maxDecimals - 최대 표시할 소수점 자리수 (기본값: 4)
   * @returns 포맷된 문자열
   */
  static format(
    value: string,
    decimals: number,
    maxDecimals: number = 4
  ): string {
    const fullNumber = this.fromWei(value, decimals)
    const [beforeDecimal, afterDecimal = ''] = fullNumber.split('.')

    return `${beforeDecimal}.${afterDecimal.slice(0, maxDecimals)}`
  }

  /**
   * 값이 유효한지 검증
   * @param value - 검증할 값
   * @returns 유효성 여부
   */
  static isValid(value: string): boolean {
    return /^\d*\.?\d*$/.test(value) && value !== ''
  }
}

// 자주 사용되는 상수들
export const DECIMALS = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
} as const
