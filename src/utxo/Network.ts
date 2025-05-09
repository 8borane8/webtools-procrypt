export type Network = {
	readonly messagePrefix: string;
	readonly pubKeyHash: number;
	readonly scriptHash: number;
	readonly wif: number;
	readonly bip32: {
		readonly public: number;
		readonly private: number;
	};
	readonly cashAddr?: {
		readonly prefix: string;
		readonly pubKeyHash: number;
		readonly scriptHash: number;
	};
	readonly bech32: string;
	readonly forkId?: number;
};
