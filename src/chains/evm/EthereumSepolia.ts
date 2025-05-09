import { Evm } from "../../Evm.ts";

export class EthereumSepolia extends Evm {
	constructor(privateKey?: string) {
		super("https://ethereum-sepolia-rpc.publicnode.com", 11155111, privateKey);
	}
}
