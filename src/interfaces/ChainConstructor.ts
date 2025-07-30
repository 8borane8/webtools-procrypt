import type { Chain } from "./Chain.ts";

export interface ChainConstructor {
	readonly type: number;

	new (privateKey?: string): Chain;
	isValidAddress(address: string): boolean;
	privateKeyBytesToString(bytes: Uint8Array): string;
}
