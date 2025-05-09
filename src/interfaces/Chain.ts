import type { Transaction } from "../interfaces/Transaction.ts";

export interface Chain {
	getPrivateKey(): string;
	getAddress(): string;
	signTransactions(transactions: Array<Transaction>): Promise<Array<string>>;
	sendTransactions(transactions: Array<string>): Promise<Array<string>>;
}
