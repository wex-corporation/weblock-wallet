// src/state/loginState.ts
import { atom } from 'recoil'

export const loginState = atom<boolean>({
  key: 'loginState',
  default: false // 기본값은 로그아웃 상태
})
