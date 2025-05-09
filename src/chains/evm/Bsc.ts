import type { Chain } from "../../interfaces/Chain.ts";
import { Evm } from "../../Evm.ts";

export class Bsc extends Evm implements Chain {
	constructor(privateKey?: string) {
		super("https://bsc-rpc.publicnode.com", 56, privateKey);
	}
}
