export const RBT_PRIMARY_SALE_ROUTER_ABI = [
  {
    inputs: [{ name: 'offeringId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'asset', type: 'address' },
      { name: 'seriesId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'unitPrice', type: 'uint256' },
      { name: 'remainingUnits', type: 'uint256' },
      { name: 'startAt', type: 'uint64' },
      { name: 'endAt', type: 'uint64' },
      { name: 'treasury', type: 'address' },
      { name: 'enabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'offeringId', type: 'uint256' },
      { name: 'units', type: 'uint256' },
      { name: 'maxCost', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const RBT_PROPERTY_TOKEN_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    name: 'claimable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const WEBLOCK_RWA_ASSET_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'productId', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'getProduct',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'metadataUri', type: 'string' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'transfersEnabled', type: 'bool' },
      { name: 'currentSupply', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const WEBLOCK_RWA_SALE_ESCROW_ABI = [
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'targetUnits', type: 'uint256' },
      { name: 'unitsSold', type: 'uint256' },
      { name: 'saleStart', type: 'uint64' },
      { name: 'saleEnd', type: 'uint64' },
      { name: 'treasury', type: 'address' },
      { name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'paymentOptions',
    outputs: [
      { name: 'enabled', type: 'bool' },
      { name: 'known', type: 'bool' },
      { name: 'unitPrice', type: 'uint256' },
      { name: 'escrowedAmount', type: 'uint256' },
      { name: 'releasedAmount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'getPaymentTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'units', type: 'uint256' },
      { name: 'maxCost', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const WEBLOCK_RWA_INTEREST_VAULT_ABI = [
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'getRewardTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'rewardToken', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    name: 'claimable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'rewardToken', type: 'address' },
    ],
    name: 'claim',
    outputs: [{ name: 'amount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'claimAll',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const WEBLOCK_RWA_REDEMPTION_VAULT_ABI = [
  {
    inputs: [{ name: 'productId', type: 'uint256' }],
    name: 'getPayoutTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'payoutToken', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    name: 'previewRedeem',
    outputs: [
      { name: 'units', type: 'uint256' },
      { name: 'payoutAmount', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'productId', type: 'uint256' },
      { name: 'payoutToken', type: 'address' },
      { name: 'units', type: 'uint256' },
    ],
    name: 'redeem',
    outputs: [{ name: 'payoutAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
