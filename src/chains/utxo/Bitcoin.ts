import type { ChainConstructor } from "../../interfaces/ChainConstructor.ts";
import * as types from "../../types/index.ts";

class Instance extends types.Utxo.Segwit {
	protected static override readonly network = {
		bech32: "bc",
		pubKeyHash: 0x00,
		scriptHash: 0x05,
		wif: 0x80,
	};

	public static override readonly type = 0;

	constructor(privateKey?: string) {
		super(Instance.network, privateKey);
	}

	protected override async getUTXOs(address: string): Promise<Array<types.Utxo.Utxo>> {
		const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);
		const jsonResponse = await response.json();
		return jsonResponse.map((utxo: { txid: string; vout: number; value: number }) => ({
			txid: utxo.txid,
			index: utxo.vout,
			value: utxo.value,
		}));
	}

	protected override async getRecommendedFees(): Promise<number> {
		const response = await fetch("https://mempool.space/api/v1/fees/recommended");
		const jsonResponse = await response.json();
		return jsonResponse.fastestFee;
	}

	protected override async broadcastTransaction(tx: string): Promise<string> {
		const response = await fetch("https://mempool.space/api/tx", {
			method: "POST",
			body: tx,
		});
		return await response.text();
	}
}

export const Bitcoin: ChainConstructor = Instance;
