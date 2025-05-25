import * as solana from "@solana/web3.js";
import bs58 from "bs58";

import type { Transaction } from "../../interfaces/Transaction.ts";
import type { Chain } from "../../interfaces/Chain.ts";

export class Solana implements Chain {
	private readonly keyPair: solana.Keypair;
	private readonly connection: solana.Connection;

	constructor(privateKey?: string, rpc = "https://solana-rpc.publicnode.com") {
		this.connection = new solana.Connection(rpc);
		if (privateKey) this.keyPair = solana.Keypair.fromSecretKey(bs58.decode(privateKey));
		else this.keyPair = solana.Keypair.generate();
	}

	public getPrivateKey(): string {
		return bs58.encode(this.keyPair.secretKey);
	}

	public getAddress(): string {
		return this.keyPair.publicKey.toBase58();
	}

	public async estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>> {
		const transaction = new solana.Transaction();

		for (const tx of transactions) {
			transaction.add(
				solana.SystemProgram.transfer({
					fromPubkey: this.keyPair.publicKey,
					toPubkey: new solana.PublicKey(tx.to),
					lamports: solana.LAMPORTS_PER_SOL * tx.amount,
				}),
			);
		}

		const blockHash = await this.connection.getLatestBlockhash("finalized");
		transaction.recentBlockhash = blockHash.blockhash;
		transaction.feePayer = this.keyPair.publicKey;

		const message = transaction.compileMessage();
		const feeInfo = await this.connection.getFeeForMessage(message);
		return [feeInfo.value! / solana.LAMPORTS_PER_SOL];
	}

	public async signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		const transaction = new solana.Transaction();

		for (const tx of transactions) {
			transaction.add(
				solana.SystemProgram.transfer({
					fromPubkey: this.keyPair.publicKey,
					toPubkey: new solana.PublicKey(tx.to),
					lamports: solana.LAMPORTS_PER_SOL * tx.amount,
				}),
			);
		}

		const blockHash = await this.connection.getLatestBlockhash("finalized");
		transaction.recentBlockhash = blockHash.blockhash;
		transaction.feePayer = this.keyPair.publicKey;

		transaction.sign(this.keyPair);
		return [transaction.serialize().toString("base64")];
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => await this.connection.sendEncodedTransaction(tx)));
	}

	public isValidAddress(address: string): boolean {
		try {
			const publicKey = new solana.PublicKey(address);
			return solana.PublicKey.isOnCurve(publicKey);
		} catch {
			return false;
		}
	}
}
