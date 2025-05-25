import { Solana } from "./Solana.ts";

export class SolanaTest extends Solana {
	constructor(privateKey?: string) {
		super(privateKey, "https://solana-testnet-rpc.publicnode.com");
	}
}
