import type { Transaction } from "./Transaction.ts";

export interface TokenTransaction extends Transaction {
	tokenAddress: string;
}
