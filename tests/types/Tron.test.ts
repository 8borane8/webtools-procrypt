import { assert, assertEquals } from "jsr:@std/assert";
import * as procrypt from "../../src/mod.ts";

Deno.test("Tron generates a valid address", () => {
	const tron = new procrypt.Chains.TronShasta();
	const addr = tron.getAddress();
	assert(procrypt.Chains.TronShasta.isValidAddress(addr));
});

Deno.test("Tron generates consistent address", () => {
	const tron = new procrypt.Chains.TronShasta("1088897332CD1E527A84C7047A5CFB246C4A1FB5BAACBB9F486A7EBF25FBE8E5");
	assertEquals(tron.getAddress(), "TKwQh4oGT1Hyy71d4Yf1heJ87jWs99zfxi");
});

// ! Leaks detected
// Deno.test("Tron: estimate fees & sign transaction", async () => {
// 	const tron = new procrypt.Chains.TronShasta();

// 	const txData = [
// 		{
// 			to: tron.getAddress(),
// 			amount: 0.00005,
// 		},
// 	];

// 	const fees = await tron.estimateTransactionsFees(txData);
// 	assertEquals(fees.length, 1);
// 	assert(fees[0] > 0);

// 	const signed = await tron.signTransactions(txData);
// 	assertEquals(signed.length, 1);
// 	assertMatch(signed[0], /^0x[0-9a-f]+$/i);
// });
