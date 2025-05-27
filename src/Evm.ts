import * as ethers from "ethers";

import type { Transaction } from "./interfaces/Transaction.ts";
import type { Chain } from "./interfaces/Chain.ts";

export class Evm implements Chain {
	private readonly provider: ethers.Provider;
	private readonly wallet: ethers.Wallet;

	constructor(provider: string, private readonly chainId: number, privateKey?: string) {
		this.provider = new ethers.JsonRpcProvider(provider);
		this.wallet = new ethers.Wallet(privateKey || ethers.Wallet.createRandom().privateKey, this.provider);
	}

	public getPrivateKey(): string {
		return this.wallet.privateKey;
	}

	public getAddress(): string {
		return this.wallet.address;
	}

	public async estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>> {
		const fees = await this.provider.getFeeData();
		const gasLimit = BigInt(21000);

		const fee = Number(ethers.formatEther(gasLimit * fees.gasPrice!));
		return new Array(transactions.length).fill(fee);
	}

	public async signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		const fees = await this.provider.getFeeData();
		const gasLimit = BigInt(21000);

		return Promise.all(transactions.map(async (tx, i) =>
			await this.wallet.signTransaction({
				to: tx.to,
				value: ethers.parseEther(tx.amount.toString()),
				gasLimit,
				gasPrice: fees.gasPrice!,
				nonce: await this.wallet.getNonce() + i,
				chainId: this.chainId,
			})
		));
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => {
			const response = await this.provider.broadcastTransaction(tx);
			return response.hash;
		}));
	}

	public static isValidAddress(address: string): boolean {
		return ethers.isAddress(address);
	}
}
