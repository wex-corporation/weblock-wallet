import { WeBlockSDK, WalletInfo, SDKError } from "@leeddolddol/wallet";
import { createContext, useContext, useState, ReactNode } from "react";

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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// useWallet 훅 추가
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};
