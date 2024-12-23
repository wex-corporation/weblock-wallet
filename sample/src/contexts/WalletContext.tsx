import { WeBlockSDK, WalletInfo, SDKError } from "@wefunding-dev/wallet";
import { createContext, useContext, useState, ReactNode } from "react";
import { TokenInfo } from "@wefunding-dev/wallet";

interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface WalletContextType {
  sdk: WeBlockSDK;
  walletInfo: WalletInfo | null;
  isConnected: boolean;
  error: string | null;
  createWallet: (password: string) => Promise<void>;
  retrieveWallet: (password: string) => Promise<void>;
  getWalletInfo: () => Promise<void>;
  clearError: () => void;
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  addToken: (address: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  getTokenInfo: (address: string) => Promise<TokenMetadata>;
  isTokenLoading: boolean;
  tokenError: string | null;
  clearTokenError: () => void;
}

// Context 생성 추가
const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [sdk] = useState(
    () =>
      new WeBlockSDK({
        environment: "local",
        apiKey: "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=",
        orgHost: "http://localhost:3000",
      })
  );

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  const createWallet = async (password: string) => {
    try {
      const response = await sdk.user.createWallet(password);
      setWalletInfo(response.wallet);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof SDKError ? err.message : "Unknown error occurred"
      );
    }
  };

  const retrieveWallet = async (password: string) => {
    try {
      const response = await sdk.user.retrieveWallet(password);
      setWalletInfo(response.wallet);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof SDKError ? err.message : "Unknown error occurred"
      );
    }
  };

  const getWalletInfo = async () => {
    try {
      const info = await sdk.wallet.getInfo();
      setWalletInfo(info);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(
        err instanceof SDKError ? err.message : "Unknown error occurred"
      );
    }
  };

  const clearError = () => setError(null);

  const signIn = async () => {
    try {
      const response = await sdk.user.signIn("google.com");
      setIsLoggedIn(true);

      switch (response.status) {
        case "WALLET_READY":
          setWalletInfo(response.wallet ?? null);
          setIsConnected(true);
          break;
        case "NEEDS_PASSWORD":
          setIsConnected(false);
          break;
        case "NEW_USER":
          setIsConnected(false);
          break;
      }
    } catch (err) {
      setError(err instanceof SDKError ? err.message : "Sign in failed");
    }
  };

  const signOut = async () => {
    try {
      await sdk.user.signOut();
      setIsLoggedIn(false);
      setWalletInfo(null);
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof SDKError ? err.message : "Sign out failed");
    }
  };

  const getTokenInfo = async (address: string): Promise<TokenMetadata> => {
    if (!walletInfo?.network.current) {
      throw new Error("Network not selected");
    }
    return sdk.asset.getTokenInfo({
      networkId: walletInfo.network.current.chainId.toString(),
      tokenAddress: address,
    });
  };

  const addToken = async (address: string) => {
    if (!walletInfo?.network.current) return;
    try {
      setIsTokenLoading(true);
      await sdk.asset.registerToken({
        networkId: walletInfo.network.current.chainId.toString(),
        tokenAddress: address,
      });
      await refreshTokens();
    } catch (err) {
      setTokenError(
        err instanceof SDKError ? err.message : "Failed to add token"
      );
      throw err;
    } finally {
      setIsTokenLoading(false);
    }
  };

  const refreshTokens = async () => {
    if (!walletInfo?.network.current || !walletInfo.address) return;
    try {
      setIsTokenLoading(true);
      const tokensWithInfo = await sdk.asset.getRegisteredTokens(
        walletInfo.network.current.chainId.toString()
      );
      setWalletInfo((prev) =>
        prev
          ? {
              ...prev,
              assets: {
                ...prev.assets,
                tokens: tokensWithInfo,
              },
            }
          : null
      );
    } catch (err) {
      setTokenError(
        err instanceof SDKError ? err.message : "Failed to refresh tokens"
      );
      throw err;
    } finally {
      setIsTokenLoading(false);
    }
  };

  const clearTokenError = () => {
    setTokenError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        sdk,
        walletInfo,
        isConnected,
        error,
        createWallet,
        retrieveWallet,
        getWalletInfo,
        clearError,
        isLoggedIn,
        signIn,
        signOut,
        addToken,
        refreshTokens,
        getTokenInfo,
        isTokenLoading,
        tokenError,
        clearTokenError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
