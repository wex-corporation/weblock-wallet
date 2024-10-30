// src/state/walletState.ts
import { atom } from 'recoil'
import { Wallet } from 'wallet-sdk' // core SDK에서 지갑 타입 가져오기

export const walletState = atom<Wallet | null>({
  key: 'walletState',
  default: null // 기본값은 지갑이 없을 때를 의미
})
