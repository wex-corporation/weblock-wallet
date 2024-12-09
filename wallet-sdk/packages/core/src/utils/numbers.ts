import { ethers } from 'ethers';
import { NumbersError } from '../errors';

export class Numbers {
  private static instance: Numbers;

  private constructor() {}

  static getInstance(): Numbers {
    if (!Numbers.instance) {
      Numbers.instance = new Numbers();
    }
    return Numbers.instance;
  }

  /**
   * 16진수 문자열을 10진수 문자열로 변환
   * @param hexString - 변환할 16진수 문자열
   * @throws {NumbersError} 변환 실패시
   */
  hexToDecimal(hexString: string): string {
    try {
      const cleanHex = hexString.startsWith('0x')
        ? hexString
        : `0x${hexString}`;
      return ethers.toBigInt(cleanHex).toString();
    } catch (error) {
      throw new NumbersError('Failed to convert hex to decimal', {
        cause: error as Error,
      });
    }
  }

  /**
   * Wei 단위를 ETH 단위로 변환
   * @param wei - 변환할 Wei 값
   * @throws {NumbersError} 변환 실패시
   */
  weiToEth(wei: string): string {
    try {
      return ethers.formatEther(wei);
    } catch (error) {
      throw new NumbersError('Failed to convert wei to eth', {
        cause: error as Error,
      });
    }
  }

  /**
   * ETH 단위를 Wei 단위로 변환
   * @param eth - 변환할 ETH 값
   * @throws {NumbersError} 변환 실패시
   */
  ethToWei(eth: string): string {
    try {
      return ethers.parseEther(eth).toString();
    } catch (error) {
      throw new NumbersError('Failed to convert eth to wei', {
        cause: error as Error,
      });
    }
  }
}
