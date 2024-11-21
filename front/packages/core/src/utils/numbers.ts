import { BN } from 'ethereumjs-util'
import { ethers } from 'ethers'
import { INumbers } from '@weblock-wallet/types'

export const Numbers: INumbers = {
  hexToDecimal(hexString: string): string {
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2)
    }
    return new BN(hexString, 16).toString(10)
  },

  weiToEth(wei: string): string {
    return ethers.formatEther(wei)
  }
}
