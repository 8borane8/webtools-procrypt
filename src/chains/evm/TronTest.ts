import * as tronweb from "npm:tronweb";

import type { Transaction } from "../../interfaces/Transaction.ts";
import type { Chain } from "../../interfaces/Chain.ts";

export class TronTest implements Chain {
	private readonly tronWeb: tronweb.TronWeb;
	private readonly privateKey: string;
	private readonly address: string;

	constructor(privateKey?: string) {
		this.tronWeb = new tronweb.TronWeb({ fullHost: "https://api.shasta.trongrid.io" });
		if (privateKey) {
			this.privateKey = privateKey;
			this.address = this.tronWeb.address.fromPrivateKey(privateKey) as string;
		} else {
			const account = this.tronWeb.utils.accounts.generateAccount();
			this.privateKey = account.privateKey;
			this.address = account.address.base58;
		}
	}

	public getPrivateKey(): string {
		return this.privateKey;
	}

	public getAddress(): string {
		return this.address;
	}

	public signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => {
			const transaction = await this.tronWeb.transactionBuilder.sendTrx(
				tx.to,
				tx.amount * 1e6,
				this.address,
			);

			const signedTransaction = await this.tronWeb.trx.sign(transaction, this.privateKey);
			return btoa(JSON.stringify(signedTransaction));
		}));
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => {
			const transaction = JSON.parse(atob(tx));
			const response = await this.tronWeb.trx.sendRawTransaction(transaction);
			return response.txid;
		}));
	}
}
