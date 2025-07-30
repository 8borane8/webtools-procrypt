import type { TokenChainConstructor } from "../../interfaces/TokenChainConstructor.ts";
import * as types from "../../types/index.ts";

class Instance extends types.Tron {
	constructor(privateKey?: string, rpcUrl: string = "https://api.shasta.trongrid.io") {
		super(rpcUrl, privateKey);
	}
}

export const TronShasta: TokenChainConstructor = Instance;
