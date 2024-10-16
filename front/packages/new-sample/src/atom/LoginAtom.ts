import { atom } from 'recoil'

export const loginState = atom<boolean>({
  key: 'isLoggedIn',
  default: false
})
