export const RBT_PRIMARY_SALE_ROUTER_ABI = [
  {
    inputs: [{ name: 'offeringId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'asset', type: 'address' },
      { name: 'seriesId', type: 'uint256' },
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
