import * as ethers from "npm:ethers";

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

	public async signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		const fees = await this.provider.getFeeData();
		return Promise.all(transactions.map(async (tx) =>
			await this.wallet.signTransaction({
				to: tx.to,
				value: ethers.parseEther(tx.amount.toString()),
				gasLimit: 21000,
				gasPrice: fees.gasPrice,
				nonce: await this.wallet.getNonce(),
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
}
