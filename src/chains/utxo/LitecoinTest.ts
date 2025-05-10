import * as utxo from "../../utxo/index.ts";

export class LitecoinTest extends utxo.Segwit {
	public static readonly network: utxo.Network = {
		messagePrefix: "\x19Litecoin Signed Message:\n",
		bech32: "tltc",
		bip32: {
			private: 0x04358394,
			public: 0x043587cf,
		},
		pubKeyHash: 0x6f,
		scriptHash: 0x3a,
		wif: 0xef,
	};

	constructor(privateKey?: string) {
		super(LitecoinTest.network, privateKey);
	}

	override async getUTXOs(address: string): Promise<Array<utxo.Utxo>> {
		const response = await fetch(`https://litecoinspace.org/testnet/api/address/${address}/utxo`);
		const jsonResponse = await response.json();
		return jsonResponse.map((utxo: { txid: string; vout: number; value: number }) => ({
			txid: utxo.txid,
			index: utxo.vout,
			value: utxo.value,
		}));
	}

	override async getRecommendedFees(): Promise<number> {
		const response = await fetch("https://litecoinspace.org/testnet/api/v1/fees/recommended");
		const jsonResponse = await response.json();
		return jsonResponse.fastestFee;
	}

	override async broadcastTransaction(tx: string): Promise<string> {
		const response = await fetch("https://litecoinspace.org/testnet/api/tx", {
			method: "POST",
			body: tx,
		});
		return await response.text();
	}
}
