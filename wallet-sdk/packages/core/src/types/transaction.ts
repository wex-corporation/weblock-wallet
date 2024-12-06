export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  blockHash: string;
  status: string;
  from: string;
  to: string;
  contractAddress?: string;
  gasUsed: string;
}
