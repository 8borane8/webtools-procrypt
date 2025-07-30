import type { TokenChainConstructor } from "../../interfaces/TokenChainConstructor.ts";
import * as types from "../../types/index.ts";

class Instance extends types.Solana {
	constructor(privateKey?: string, rpcUrl: string = "https://api.solana.com") {
		super(rpcUrl, privateKey);
	}
}

export const Solana: TokenChainConstructor = Instance;
