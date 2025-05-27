import type { Transaction } from "../interfaces/Transaction.ts";

export interface Chain {
	getPrivateKey(): string;
	getAddress(): string;
	estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>>;
	signTransactions(transactions: Array<Transaction>): Promise<Array<string>>;
	sendTransactions(transactions: Array<string>): Promise<Array<string>>;
}
