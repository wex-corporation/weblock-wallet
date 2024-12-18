"use client";

import { WeBlockSDK } from "@weblock-wallet/sdk";
import { useEffect, useState } from "react";

export default function Home() {
  const [sdk, setSdk] = useState<WeBlockSDK>();

  useEffect(() => {
    const sdk = new WeBlockSDK({
      environment: "local",
      apiKey: "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=",
      orgHost: "http://localhost:3000",
    });
    setSdk(sdk);
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await sdk?.user.signIn("google.com");
      console.log("SignIn Response:", result); // 응답 확인
    } catch (error) {
      console.error("SignIn Error:", error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">WeBlock SDK Sample</h1>
      <div className="space-y-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSignIn}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
