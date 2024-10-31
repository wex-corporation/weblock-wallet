// src/components/WalletSection.tsx
import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from '../state/walletState'
import { useWalletSdk } from '../context/WalletSdkContext'
import {
  FaEthereum,
  FaCopy,
  FaCog,
  FaPaperPlane,
  FaPlus,
  FaSyncAlt
} from 'react-icons/fa'
import TokenModal from './TokenModal'
import TransactionModal from './TransactionModal'

interface Network {
  id: string
  name: string
  chainId: number
  currencySymbol: string
}

interface Token {
  id: string
  name: string
  symbol: string
  balance: string
}

const WalletSection: React.FC = () => {
  const wallet = useRecoilValue(walletState)
  const { walletSdk } = useWalletSdk()

  const [networks, setNetworks] = useState<Network[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tokenModalOpen, setTokenModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    const fetchNetworks = async () => {
      if (walletSdk) {
        const networksData = await walletSdk
          .getUsersModule()
          .getRegisteredBlockchains()
        setNetworks(
          networksData.map((network) => ({
            id: network.id,
            name: network.name,
            chainId: network.chainId,
            currencySymbol: network.currencySymbol
          }))
        )
        if (networksData.length > 0) setSelectedNetwork(networksData[0])
      }
    }
    fetchNetworks()
  }, [walletSdk])

  useEffect(() => {
    const fetchTokens = async () => {
      if (walletSdk && selectedNetwork) {
        const tokensData = await walletSdk
          .getUsersModule()
          .getRegisteredCoins(selectedNetwork.id)
        setTokens(
          tokensData.map((token) => ({
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            balance: '0.0'
          }))
        )
      }
    }
    fetchTokens()
  }, [walletSdk, selectedNetwork])

  const handleCheckBalance = async () => {
    if (walletSdk && selectedNetwork) {
      setLoadingBalance(true) // 로딩 상태 활성화
      const balanceResult = await walletSdk.getBalance(selectedNetwork.chainId)
      const formattedBalance = walletSdk.weiToEth(balanceResult)
      setBalance(`${formattedBalance} ${selectedNetwork.currencySymbol}`)
      setLoadingBalance(false) // 로딩 상태 비활성화
    }
  }

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      alert('주소가 복사되었습니다.')
    }
  }

  const handleTokenRegistered = () => {
    const fetchTokens = async () => {
      if (walletSdk && selectedNetwork) {
        const tokensData = await walletSdk
          .getUsersModule()
          .getRegisteredCoins(selectedNetwork.id)
        setTokens(
          tokensData.map((token) => ({
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            balance: '0.0'
          }))
        )
      }
    }
    fetchTokens()
  }

  return (
    <div className="wallet-section bg-white bg-opacity-20 backdrop-blur-lg p-6 rounded-xl shadow-md max-w-sm mx-auto text-center">
      <h2 className="text-2xl font-semibold text-indigo-700">지갑 정보</h2>

      {wallet ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-center bg-white bg-opacity-50 p-3 rounded-lg shadow-inner">
            <span className="text-gray-900 font-semibold text-sm break-all">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
            </span>
            <button
              onClick={handleCopyAddress}
              className="ml-2 text-indigo-500 hover:text-indigo-700"
            >
              <FaCopy />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 bg-white bg-opacity-50 p-3 rounded-lg shadow-inner">
            <span className="text-gray-700 font-medium">
              잔액: {balance !== null ? balance : '--'}
            </span>
            <button
              onClick={handleCheckBalance}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <FaSyncAlt
                className={`transition-transform ${
                  loadingBalance ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex justify-around mt-6 space-x-4">
            <div className="flex flex-col items-center w-24">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-indigo-500 text-2xl"
              >
                <FaEthereum />
              </button>
              <span className="text-sm font-medium text-gray-700 mt-1 truncate w-full text-center">
                {selectedNetwork ? selectedNetwork.name : '네트워크'}
              </span>
              {dropdownOpen && (
                <div className="absolute mt-2 w-40 bg-white shadow-lg rounded-lg">
                  {networks.map((network) => (
                    <div
                      key={network.id}
                      onClick={() => {
                        setSelectedNetwork(network)
                        setDropdownOpen(false)
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {network.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center w-24">
              <button
                onClick={() => setTransactionModalOpen(true)}
                className="text-green-500 text-2xl"
              >
                <FaPaperPlane />
              </button>
              <span className="text-sm font-medium text-gray-700 mt-1">
                송금
              </span>
            </div>

            <div className="flex flex-col items-center w-24">
              <button className="text-gray-600 text-2xl">
                <FaCog />
              </button>
              <span className="text-sm font-medium text-gray-700 mt-1">
                설정
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">토큰</h3>
              <button
                onClick={() => setTokenModalOpen(true)}
                className="text-indigo-500 hover:text-indigo-700"
              >
                <FaPlus className="text-xl" />
              </button>
            </div>
            <div className="space-y-2">
              {tokens.length > 0 ? (
                tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex justify-between bg-white bg-opacity-50 p-3 rounded-lg shadow-inner"
                  >
                    <span className="text-gray-800 font-medium">
                      {token.name}
                    </span>
                    <span className="text-gray-600 font-semibold">
                      {token.balance} {token.symbol}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">등록된 토큰이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mt-4">지갑 정보가 없습니다.</p>
      )}

      {tokenModalOpen && (
        <TokenModal
          onClose={() => setTokenModalOpen(false)}
          onTokenRegistered={handleTokenRegistered}
          networkId={selectedNetwork?.id || ''}
        />
      )}

      {transactionModalOpen && (
        <TransactionModal
          onClose={() => setTransactionModalOpen(false)}
          selectedNetworkId={selectedNetwork?.id || ''}
        />
      )}
    </div>
  )
}

export default WalletSection
