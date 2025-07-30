import { Buffer } from "node:buffer";
import * as tronweb from "tronweb";

import type { TokenTransaction } from "../interfaces/TokenTransaction.ts";
import type { Transaction } from "../interfaces/Transaction.ts";
import type { TokenChain } from "../interfaces/TokenChain.ts";

export class Tron implements TokenChain {
	public static readonly type = 195;

	private readonly tronWeb: tronweb.TronWeb;
	private readonly privateKey: string;
	private readonly address: string;

	constructor(rpc: string, privateKey?: string) {
		this.tronWeb = new tronweb.TronWeb({ fullHost: rpc });

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

	public estimateTransactionsFees(transactions: Array<Transaction>): Promise<number[]> {
		return Promise.all(transactions.map(async (tx) => {
			const transaction = await this.tronWeb.transactionBuilder.sendTrx(
				tx.to,
				tx.amount * 1e6,
				this.address,
			);

			const size = transaction.raw_data_hex.length / 2;
			return Math.round(size * 1e2) / 1e8;
		}));
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

	public estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]> {
		const decimalsCache = new Map<string, number>();

		return Promise.all(transactions.map(async (tx) => {
			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const res = await this.tronWeb.transactionBuilder.triggerConstantContract(
					tx.tokenAddress,
					"decimals()",
					{},
					[],
					this.address,
				);
				decimals = parseInt(res.constant_result[0], 16);

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const amount = tx.amount * 10 ** decimals;

			const trigger = await this.tronWeb.transactionBuilder.triggerSmartContract(
				tx.tokenAddress,
				"transfer(address,uint256)",
				{},
				[{ type: "address", value: tx.to }, { type: "uint256", value: amount }],
				this.address,
			);

			const size = trigger.transaction.raw_data_hex.length / 2;
			return Math.round(size * 1e2) / 1e8;
		}));
	}

	public signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]> {
		const decimalsCache = new Map<string, number>();

		return Promise.all(transactions.map(async (tx) => {
			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const res = await this.tronWeb.transactionBuilder.triggerConstantContract(
					tx.tokenAddress,
					"decimals()",
					{},
					[],
					this.address,
				);
				decimals = parseInt(res.constant_result[0], 16);

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const amount = tx.amount * 10 ** decimals;

			const trigger = await this.tronWeb.transactionBuilder.triggerSmartContract(
				tx.tokenAddress,
				"transfer(address,uint256)",
				{},
				[{ type: "address", value: tx.to }, { type: "uint256", value: amount }],
				this.address,
			);

			const signedTransaction = await this.tronWeb.trx.sign(trigger.transaction, this.privateKey);
			return btoa(JSON.stringify(signedTransaction));
		}));
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => {
			const transaction = JSON.parse(atob(tx));
			const response = await this.tronWeb.trx.sendRawTransaction(transaction);
			if (response.result != true) throw response.code;

			return response.txid;
		}));
	}

	public static isValidAddress(address: string): boolean {
		return tronweb.TronWeb.isAddress(address);
	}

	public static privateKeyBytesToString(bytes: Uint8Array): string {
		return Buffer.from(bytes).toString("hex");
	}
}
