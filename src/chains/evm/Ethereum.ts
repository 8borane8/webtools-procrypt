import { Evm } from "../../Evm.ts";

export class Ethereum extends Evm {
	constructor(privateKey?: string) {
		super("https://ethereum-rpc.publicnode.com", 1, privateKey);
	}
}
