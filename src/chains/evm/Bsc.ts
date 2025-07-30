import type { TokenChainConstructor } from "../../interfaces/TokenChainConstructor.ts";
import * as types from "../../types/index.ts";

class Instance extends types.Evm {
	public static override readonly type = 60;

	constructor(privateKey?: string, rpcUrl: string = "https://bsc-rpc.publicnode.com") {
		super(rpcUrl, 56, privateKey);
	}
}

export const Bsc: TokenChainConstructor = Instance;
