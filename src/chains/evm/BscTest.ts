import { Evm } from "../../Evm.ts";

export class BscTest extends Evm {
	constructor(privateKey?: string) {
		super("https://bsc-testnet-rpc.publicnode.com", 97, privateKey);
	}
}
