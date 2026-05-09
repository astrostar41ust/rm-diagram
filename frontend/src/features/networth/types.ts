export type AccountType =
  | "CASH"
  | "BANK"
  | "CREDIT"
  | "INVESTMENT"
  | "ASSET"
  | "LIABILITY";

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  balanceInBase: number;
  baseCurrency: string;
  archived: boolean;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  currency?: string;
  balance?: number;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  currency?: string;
  balance?: number;
  archived?: boolean;
}

export interface NetWorthSnapshot {
  snapshotOn: string;
  baseCurrency: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export interface NetWorthOverview {
  baseCurrency: string;
  assets: number;
  liabilities: number;
  netWorth: number;
  accounts: Account[];
  history: NetWorthSnapshot[];
}
