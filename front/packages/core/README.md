# Core SDK

The Core SDK provides essential tools and interfaces for interacting with blockchain wallets, managing user accounts, organizations, and more. This package is designed to be used as the foundation of blockchain projects, offering a flexible and extensible SDK.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Wallet SDK Usage](#wallet-sdk-usage)
- [Modules Overview](#modules-overview)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)

---

## Installation

To add the `core` SDK to your project, use either `pnpm`, `npm`, or `yarn`:

```bash
# Using pnpm
pnpm add @alwallet/core

# Using npm
npm install @alwallet/core

# Using yarn
yarn add @alwallet/core
```

## Getting Started

### 1. Importing WalletSdk

```typescript
import WalletSdk from '@alwallet/core'

const sdk = WalletSdk.getInstance({
  firebaseConfig: {
    /* Firebase config here */
  },
  apiKey: 'your-api-key',
  orgHost: 'your-org-host'
})
```

### 2. Initialization

To start using the SDK, initialize it and sign in the user. Example:

```typescript
sdk
  .signInWithGoogle()
  .then(() => {
    console.log('User signed in successfully!')
  })
  .catch((error) => {
    console.error('Failed to sign in:', error)
  })
```

---

### 3. Example Usage

#### Retrieving Wallet Balance

```typescript
async function getBalance(chainId: number) {
  try {
    const balance = await sdk.getBalance(chainId)
    console.log('Wallet balance:', balance)
  } catch (error) {
    console.error('Error fetching balance:', error)
  }
}
```

#### Converting Wei to Ether

```typescript
const wei = '1000000000000000000' // 1 ETH in wei
const ether = sdk.weiToEth(wei)
console.log(`Ether: ${ether}`)
```

---

This is a basic introduction to using `WalletSdk`. For more details, refer to the full documentation.
