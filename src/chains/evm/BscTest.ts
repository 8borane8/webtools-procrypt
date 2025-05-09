import type { Chain } from "../../interfaces/Chain.ts";
import { Evm } from "../../Evm.ts";

export class BscTest extends Evm implements Chain {
	constructor(privateKey?: string) {
		super("https://bsc-testnet-rpc.publicnode.com", 97, privateKey);
	}
}
