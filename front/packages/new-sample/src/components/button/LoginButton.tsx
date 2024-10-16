// import React, { useState } from 'react'
// import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
// import { walletState } from '../../atom/WalletAtom'
// import { loginState } from '../../atom/LoginAtom'
// import { AlWalletSDK } from '@alwallet/sdk'
// import { blockchainsState } from '../../atom/BlockchainsAtom'
// import { errorState } from '../../atom/ErrorAtom'
// // import BlockchainDropdown from '../dropdown/BlockchainDropdown'
// import { coinsState } from '../../atom/CoinsAtom'
//
// const LoginButton: React.FC<{ core: AlWalletSDK }> = ({ core }) => {
//   const [isLoggedIn, setLoggedIn] = useRecoilState(loginState)
//   const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
//   const [wallet, setWallet] = useRecoilState(walletState)
//   const [userPassword, setUserPassword] = useState('')
//   const setError = useSetRecoilState(errorState)
//   const setBlockchains = useSetRecoilState(blockchainsState)
//
//   const handleLogin = async () => {
//     try {
//       // login
//       await core.signInWithGoogle()
//       setLoggedIn(true)
//
//       // retrieve wallet without password
//       // await core.retrieveWallet()
//       // setBlockchains(await core.getBlockchains())
//       setUserPassword('')
//       setError('')
//       // setWallet(core.getWallet()!)
//       setIsPasswordModalOpen(false)
//     } catch (e) {
//       if (e instanceof Error) {
//         if (
//           e.message === 'User password needs to be provided' ||
//           e.message === 'Must provide userPassword for new user'
//         ) {
//           // if password needed, open password modal
//           setIsPasswordModalOpen(true)
//           return
//         }
//         setError(e.message)
//       }
//     }
//   }
//
//   return (
//     <button
//       onClick={handleLogin}
//       className="px-4 py-2 bg-blue-500 text-white rounded-md mb-2"
//     >
//       Login with Google
//     </button>
//   )
// }
//
// export default LoginButton
