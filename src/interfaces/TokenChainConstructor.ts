import type { ChainConstructor } from "./ChainConstructor.ts";
import type { TokenChain } from "./TokenChain.ts";

export interface TokenChainConstructor extends ChainConstructor {
	new (privateKey?: string, rpcUrl?: string): TokenChain;
}
