import * as utxo from "../../utxo/index.ts";

export class BitcoinTest4 extends utxo.Segwit {
	public static readonly network: utxo.Network = {
		messagePrefix: "\x18Bitcoin Signed Message:\n",
		bech32: "tb",
		bip32: {
			private: 0x04358394,
			public: 0x043587cf,
		},
		pubKeyHash: 0x6f,
		scriptHash: 0xc4,
		wif: 0xef,
	};

	constructor(privateKey?: string) {
		super(BitcoinTest4.network, privateKey);
	}

	override async getUTXOs(address: string): Promise<Array<utxo.Utxo>> {
		const response = await fetch(`https://mempool.space/testnet4/api/address/${address}/utxo`);
		const jsonResponse = await response.json();
		return jsonResponse.map((utxo: { txid: string; vout: number; value: number }) => ({
			txid: utxo.txid,
			index: utxo.vout,
			value: utxo.value,
		}));
	}

	override async getRecommendedFees(): Promise<number> {
		const response = await fetch("https://mempool.space/testnet4/api/v1/fees/recommended");
		const jsonResponse = await response.json();
		return jsonResponse.fastestFee;
	}

	override async broadcastTransaction(tx: string): Promise<string> {
		const response = await fetch("https://mempool.space/testnet4/api/tx", {
			method: "POST",
			body: tx,
		});
		return await response.text();
	}
}
