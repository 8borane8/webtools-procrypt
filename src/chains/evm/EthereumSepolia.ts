import type { Chain } from "../../interfaces/Chain.ts";
import { Evm } from "../../Evm.ts";

export class EthereumSepolia extends Evm implements Chain {
	constructor(privateKey?: string) {
		super("https://ethereum-sepolia-rpc.publicnode.com", 11155111, privateKey);
	}
}
