// src/state/blockchainState.ts
import { atom } from 'recoil'
import { Blockchain } from 'wallet-sdk' // core SDK에서 Blockchain 타입 가져오기

export const blockchainState = atom<Blockchain[]>({
  key: 'blockchainState',
  default: [] // 기본값은 빈 블록체인 목록
})
