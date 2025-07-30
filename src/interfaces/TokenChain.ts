import type { TokenTransaction } from "./TokenTransaction.ts";
import type { Chain } from "./Chain.ts";

export interface TokenChain extends Chain {
	estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]>;
	signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]>;
}
