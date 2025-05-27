import type { Chain } from "./Chain.ts";

export interface ChainConstructor {
	new (privateKey?: string): Chain;
	isValidAddress(address: string): boolean;
}
