import type * as signerPayment from "@scure/btc-signer/payment";
import * as signer from "@scure/btc-signer";
import * as tinysecp from "tiny-secp256k1";
import * as ecp from "ecpair";

import type { Transaction } from "../interfaces/Transaction.ts";
import type { Chain } from "../interfaces/Chain.ts";
import type { Utxo } from "./Utxo.ts";
import type { Network } from "./Network.ts";

const ECPair = ecp.ECPairFactory(tinysecp);

export abstract class Segwit implements Chain {
	private readonly keyPair: ecp.ECPairInterface;
	private readonly payment: signerPayment.P2WPKH;

	constructor(private readonly network: Network, privateKey?: string) {
		if (privateKey) this.keyPair = ECPair.fromWIF(privateKey, network);
		else this.keyPair = ECPair.makeRandom({ network });

		this.payment = signer.p2wpkh(this.keyPair.publicKey, network);
	}

	public getPrivateKey(): string {
		return this.keyPair.toWIF();
	}

	public getAddress(): string {
		return this.payment.address;
	}

	abstract getUTXOs(address: string): Promise<Array<Utxo>>;
	abstract getRecommendedFees(): Promise<number>;
	abstract broadcastTransaction(tx: string): Promise<string>;

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
		transaction.sign(this.keyPair.privateKey!);
		transaction.finalize();

		return [transaction.hex];
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map((tx) => this.broadcastTransaction(tx)));
	}
}
