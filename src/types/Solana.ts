import * as solanaSpl from "@solana/spl-token";
import * as solana from "@solana/web3.js";
import * as base from "@scure/base";

import type { TokenTransaction } from "../interfaces/TokenTransaction.ts";
import type { Transaction } from "../interfaces/Transaction.ts";
import type { TokenChain } from "../interfaces/TokenChain.ts";

export class Solana implements TokenChain {
	public static readonly type = 501;

	private readonly connection: solana.Connection;
	private readonly keyPair: solana.Keypair;

	constructor(rpc: string, privateKey?: string) {
		this.connection = new solana.Connection(rpc);

		if (privateKey) this.keyPair = solana.Keypair.fromSecretKey(base.base58.decode(privateKey));
		else this.keyPair = solana.Keypair.generate();
	}

	public getPrivateKey(): string {
		return base.base58.encode(this.keyPair.secretKey);
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

	public async estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]> {
		const transaction = new solana.Transaction();

		const decimalsCache = new Map<string, number>();

		for (const tx of transactions) {
			const mint = new solana.PublicKey(tx.tokenAddress);
			const toPublicKey = new solana.PublicKey(tx.to);

			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const mintInfo = await solanaSpl.getMint(this.connection, mint);
				decimals = mintInfo.decimals;

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const fromTokenAccount = await solanaSpl.getOrCreateAssociatedTokenAccount(
				this.connection,
				this.keyPair,
				mint,
				this.keyPair.publicKey,
			);

			const toTokenAccount = await solanaSpl.getOrCreateAssociatedTokenAccount(
				this.connection,
				this.keyPair,
				mint,
				toPublicKey,
			);

			transaction.add(
				solanaSpl.createTransferInstruction(
					fromTokenAccount.address,
					toTokenAccount.address,
					this.keyPair.publicKey,
					tx.amount * 10 ** decimals,
				),
			);
		}

		const blockHash = await this.connection.getLatestBlockhash("finalized");
		transaction.recentBlockhash = blockHash.blockhash;
		transaction.feePayer = this.keyPair.publicKey;

		const message = transaction.compileMessage();
		const feeInfo = await this.connection.getFeeForMessage(message);
		return [feeInfo.value! / solana.LAMPORTS_PER_SOL];
	}

	public async signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]> {
		const transaction = new solana.Transaction();

		const decimalsCache = new Map<string, number>();

		for (const tx of transactions) {
			const mint = new solana.PublicKey(tx.tokenAddress);
			const toPublicKey = new solana.PublicKey(tx.to);

			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const mintInfo = await solanaSpl.getMint(this.connection, mint);
				decimals = mintInfo.decimals;
				console.log(decimals);

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const fromTokenAccount = await solanaSpl.getOrCreateAssociatedTokenAccount(
				this.connection,
				this.keyPair,
				mint,
				this.keyPair.publicKey,
			);

			const toTokenAccount = await solanaSpl.getOrCreateAssociatedTokenAccount(
				this.connection,
				this.keyPair,
				mint,
				toPublicKey,
			);

			transaction.add(
				solanaSpl.createTransferInstruction(
					fromTokenAccount.address,
					toTokenAccount.address,
					this.keyPair.publicKey,
					tx.amount * 10 ** decimals,
				),
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

	public static isValidAddress(address: string): boolean {
		try {
			const publicKey = new solana.PublicKey(address);
			return solana.PublicKey.isOnCurve(publicKey);
		} catch {
			return false;
		}
	}

	public static privateKeyBytesToString(bytes: Uint8Array): string {
		const keyPair = solana.Keypair.fromSeed(bytes);
		return base.base58.encode(keyPair.secretKey);
	}
}
