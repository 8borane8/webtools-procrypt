import type * as signerPayment from "@scure/btc-signer/payment";
import * as signerUtils from "@scure/btc-signer/utils";
import * as signer from "@scure/btc-signer";
import * as base from "@scure/base";

import type { Transaction } from "../../interfaces/Transaction.ts";
import type { Chain } from "../../interfaces/Chain.ts";
import type { Network } from "./Network.ts";
import type { Utxo } from "./Utxo.ts";

export abstract class Segwit implements Chain {
	protected static readonly network: Network;

	public static readonly type: number;

	private readonly privateKey: string;
	private readonly payment: signerPayment.P2WPKH;

	constructor(private readonly network: Network, privateKey?: string) {
		const wif = signer.WIF(this.network);
		this.privateKey = privateKey || wif.encode(signerUtils.randomPrivateKeyBytes());

		const pubKey = signerUtils.pubECDSA(wif.decode(this.privateKey));
		this.payment = signer.p2wpkh(pubKey, this.network);
	}

	public getPrivateKey(): string {
		return this.privateKey;
	}

	public getAddress(): string {
		return this.payment.address;
	}

	protected abstract getUTXOs(address: string): Promise<Array<Utxo>>;
	protected abstract getRecommendedFees(): Promise<number>;
	protected abstract broadcastTransaction(tx: string): Promise<string>;

	public async estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>> {
		const fees = await this.getRecommendedFees();

		const utxo = await this.getUTXOs(this.payment.address);
		const inputs = utxo.map((utxo) => ({
			txid: utxo.txid,
			index: utxo.index,
			witnessUtxo: {
				script: this.payment.script,
				amount: BigInt(utxo.value),
			},
		}));

		const outputs = transactions.map((tx) => ({
			address: tx.to,
			amount: signer.Decimal.decode(tx.amount.toString()),
		}));

		const selected = signer.selectUTXO(inputs, outputs, "default", {
			changeAddress: this.payment.address,
			feePerByte: 0n,
			bip69: true,
			createTx: true,
			network: this.network,
		});

		const transaction = selected?.tx!;
		transaction.sign(signer.WIF(this.network).decode(this.privateKey));
		transaction.finalize();

		return [Number(signer.Decimal.encode(BigInt(transaction.vsize * fees)))];
	}

	public async signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		const fees = await this.getRecommendedFees();

		const utxo = await this.getUTXOs(this.payment.address);
		const inputs = utxo.map((utxo) => ({
			txid: utxo.txid,
			index: utxo.index,
			witnessUtxo: {
				script: this.payment.script,
				amount: BigInt(utxo.value),
			},
		}));

		const outputs = transactions.map((tx) => ({
			address: tx.to,
			amount: signer.Decimal.decode(tx.amount.toString()),
		}));

		const selected = signer.selectUTXO(inputs, outputs, "default", {
			changeAddress: this.payment.address,
			feePerByte: BigInt(fees),
			bip69: true,
			createTx: true,
			network: this.network,
		});

		const transaction = selected?.tx!;
		transaction.sign(signer.WIF(this.network).decode(this.privateKey));
		transaction.finalize();

		return [transaction.hex];
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map((tx) => this.broadcastTransaction(tx)));
	}

	public static isValidAddress(address: string): boolean {
		try {
			if (address.startsWith(this.network.bech32)) {
				const decoded = base.bech32.decode(address as `${string}1${string}`);
				if (decoded.prefix != this.network.bech32) return false;

				const program = base.bech32.fromWords(decoded.words.slice(1));
				return decoded.words[0] == 0 && program.length === 20;
			}

			const decoded = base.base58.decode(address);
			if (decoded.length != 25) return false;

			const version = decoded[0];
			return version == this.network.pubKeyHash || version == this.network.scriptHash;
		} catch {
			return false;
		}
	}

	public static privateKeyBytesToString(bytes: Uint8Array): string {
		const wif = signer.WIF(this.network);
		return wif.encode(bytes);
	}
}
