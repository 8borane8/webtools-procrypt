import type { ChainConstructor } from "../../interfaces/ChainConstructor.ts";
import * as types from "../../types/index.ts";

class Instance extends types.Utxo.Segwit {
	protected static override readonly network = {
		bech32: "tb",
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef,
	};

	public static override readonly type = 1;

	constructor(privateKey?: string) {
		super(Instance.network, privateKey);
	}

	protected override async getUTXOs(address: string): Promise<Array<types.Utxo.Utxo>> {
		const response = await fetch(`https://mempool.space/testnet4/api/address/${address}/utxo`);
		const jsonResponse = await response.json();
		return jsonResponse.map((utxo: { txid: string; vout: number; value: number }) => ({
			txid: utxo.txid,
			index: utxo.vout,
			value: utxo.value,
		}));
	}

	protected override async getRecommendedFees(): Promise<number> {
		const response = await fetch("https://mempool.space/testnet4/api/v1/fees/recommended");
		const jsonResponse = await response.json();
		return jsonResponse.fastestFee;
	}

	protected override async broadcastTransaction(tx: string): Promise<string> {
		const response = await fetch("https://mempool.space/testnet4/api/tx", {
			method: "POST",
			body: tx,
		});
		return await response.text();
	}
}

export const BitcoinTest4: ChainConstructor = Instance;
