import { assert, assertEquals } from "jsr:@std/assert";
import * as procrypt from "../src/mod.ts";

Deno.test("Wallet generates a valid mnemonic", () => {
	const wallet = new procrypt.Wallet();
	const mnemonic = wallet.getMnemonic();
	assert(procrypt.Wallet.isValidMnemonic(mnemonic));
});

Deno.test("Wallet derives consistent address", () => {
	const wallet = new procrypt.Wallet(
		"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
	);
	const btc = wallet.derive(procrypt.Chains.Bitcoin, 0);
	assertEquals(btc.getAddress(), "bc1qmxrw6qdh5g3ztfcwm0et5l8mvws4eva24kmp8m");
});
