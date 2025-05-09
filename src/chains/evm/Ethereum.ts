import type { Chain } from "../../interfaces/Chain.ts";
import { Evm } from "../../Evm.ts";

export class Ethereum extends Evm implements Chain {
	constructor(privateKey?: string) {
		super("https://ethereum-rpc.publicnode.com", 1, privateKey);
	}
}
