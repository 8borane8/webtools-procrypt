import { Evm } from "../../Evm.ts";

export class Bsc extends Evm {
	constructor(privateKey?: string) {
		super("https://bsc-rpc.publicnode.com", 56, privateKey);
	}
}
