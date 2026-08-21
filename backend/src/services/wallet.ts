export type WalletTransactionType = 'CREDIT' | 'DEBIT' | 'REFUND' | 'REWARD' | 'PAYOUT';

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountMinor: number;
  reference?: string;
  createdAt: Date;
}

export interface WalletBalance {
  currency: string;
  availableMinor: number;
  transactions: WalletTransaction[];
}

export function calculateWalletBalance(
  transactions: WalletTransaction[],
  currency = 'INR',
): WalletBalance {
  let balance = 0;
  for (const transaction of transactions) {
    const amount = Math.max(0, Math.floor(transaction.amountMinor));
    if (transaction.type === 'CREDIT' || transaction.type === 'REFUND' || transaction.type === 'REWARD') balance += amount;
    if (transaction.type === 'DEBIT' || transaction.type === 'PAYOUT') balance -= amount;
  }
  return { currency, availableMinor: Math.max(0, balance), transactions };
}

export function canDebit(balanceMinor: number, amountMinor: number): boolean {
  return amountMinor > 0 && balanceMinor >= amountMinor;
}
