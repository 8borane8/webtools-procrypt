import * as utxo from "../../utxo/index.ts";

export class Litecoin extends utxo.Segwit {
	public static readonly network: utxo.Network = {
		messagePrefix: "\x19Litecoin Signed Message:\n",
		bech32: "ltc",
		bip32: {
			private: 0x0488ade4,
			public: 0x0488b21e,
		},
		pubKeyHash: 0x30,
		scriptHash: 0x32,
		wif: 0xb0,
	};

	constructor(privateKey?: string) {
		super(Litecoin.network, privateKey);
	}

	public override async getUTXOs(address: string): Promise<Array<utxo.Utxo>> {
		const response = await fetch(`https://litecoinspace.org/api/address/${address}/utxo`);
		const jsonResponse = await response.json();
		return jsonResponse.map((utxo: { txid: string; vout: number; value: number }) => ({
			txid: utxo.txid,
			index: utxo.vout,
			value: utxo.value,
		}));
	}

	public override async getRecommendedFees(): Promise<number> {
		const response = await fetch("https://litecoinspace.org/api/v1/fees/recommended");
		const jsonResponse = await response.json();
		return jsonResponse.fastestFee;
	}

	public override async broadcastTransaction(tx: string): Promise<string> {
		const response = await fetch("https://litecoinspace.org/api/tx", {
			method: "POST",
			body: tx,
		});
		return await response.text();
	}

	public static override isValidAddress(address: string): boolean {
		return utxo.Segwit.isValidAddress(address, Litecoin.network);
	}
}
