import { useWallet } from "../contexts/WalletContext";

export function SignOut() {
  const { signOut, isLoggedIn } = useWallet();

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={signOut}
      className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Sign Out
    </button>
  );
}
