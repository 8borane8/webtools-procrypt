export type Utxo = {
	readonly txid: string;
	readonly index: number;
	readonly value: number;
	readonly hex?: string | Uint8Array;
};
