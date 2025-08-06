import { assert, assertEquals } from "jsr:@std/assert";
import * as procrypt from "../../src/mod.ts";

Deno.test("Solana generates a valid address", () => {
	const solana = new procrypt.Chains.SolanaDev();
	const addr = solana.getAddress();
	assert(procrypt.Chains.SolanaDev.isValidAddress(addr));
});

Deno.test("solana generates consistent address", () => {
	const solana = new procrypt.Chains.SolanaDev(
		"5wembGfpoDVMsV8176FGFouWAdrNwjTEshCjyA3oAxuLcHDkLkkAcE2jndeoxBVS5eTLZXwsMpjYa4V9NmVC3did",
	);
	assertEquals(solana.getAddress(), "3zfmnQSWv2aNneQfK9zC9PivFa4AqhYEv4n32phMKwxZ");
});

// ! Leaks detected
// Deno.test("solana: estimate fees & sign transaction", async () => {
// 	const solana = new procrypt.Chains.SolanaDev();

// 	const txData = [
// 		{
// 			to: solana.getAddress(),
// 			amount: 0.00005,
// 		},
// 	];

// 	const fees = await solana.estimateTransactionsFees(txData);
// 	assertEquals(fees.length, 1);
// 	assert(fees[0] > 0);

// 	const signed = await solana.signTransactions(txData);
// 	assertEquals(signed.length, 1);
// 	assertMatch(signed[0], /^0x[0-9a-f]+$/i);
// });
