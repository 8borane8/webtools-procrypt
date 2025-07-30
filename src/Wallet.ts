import { wordlist } from "@scure/bip39/wordlists/english";
import * as bip39 from "@scure/bip39";
import * as bip32 from "@scure/bip32";

import type { ChainConstructor } from "./interfaces/ChainConstructor.ts";
import type { Chain } from "./interfaces/Chain.ts";

export class Wallet {
	private readonly mnemonic: string;
	private readonly seed: Uint8Array;
	private readonly root: bip32.HDKey;

	constructor(mnemonic?: string, complex = false) {
		const valid = mnemonic && Wallet.isValidMnemonic(mnemonic);
		this.mnemonic = valid ? mnemonic : bip39.generateMnemonic(wordlist, complex ? 256 : 128);

		this.seed = bip39.mnemonicToSeedSync(this.mnemonic);
		this.root = bip32.HDKey.fromMasterSeed(this.seed);
	}

	public getMnemonic(): string {
		return this.mnemonic;
	}

	public derive(chain: ChainConstructor, index: number): Chain {
		const path = `m/44'/${chain.type}'/0'/0/${index}`;
		const derived = this.root.derive(path);

		const privateKey = chain.privateKeyBytesToString(derived.privateKey!);
		return new chain(privateKey);
	}

	public static isValidMnemonic(mnemonic: string): boolean {
		return bip39.validateMnemonic(mnemonic, wordlist);
	}
}
