import { Tron } from "./Tron.ts";

export class TronShasta extends Tron {
	constructor(privateKey?: string) {
		super(privateKey, "https://api.shasta.trongrid.io");
	}
}
