import { assert, assertEquals } from "jsr:@std/assert";
import * as procrypt from "../../src/mod.ts";

Deno.test("Evm generates a valid address", () => {
	const evm = new procrypt.Chains.EthereumSepolia();
	const addr = evm.getAddress();
	assert(procrypt.Chains.EthereumSepolia.isValidAddress(addr));
});

Deno.test("Evm generates consistent address", () => {
	const evm = new procrypt.Chains.EthereumSepolia(
		"0xb14e0a4c187673924f3b994d1761b91c6836e7ec0e53b0895f5861a75815372c",
	);
	assertEquals(evm.getAddress(), "0x0fB34D5bE24F5983b6Fa8af4d45a1E1aee0938e4");
});

// ! Leaks detected
// Deno.test("Evm: estimate fees & sign transaction", async () => {
// 	const evm = new procrypt.Chains.EthereumSepolia();

// 	const txData = [
// 		{
// 			to: evm.getAddress(),
// 			amount: 0.00005,
// 		},
// 	];

// 	const fees = await evm.estimateTransactionsFees(txData);
// 	assertEquals(fees.length, 1);
// 	assert(fees[0] > 0);

// 	const signed = await evm.signTransactions(txData);
// 	assertEquals(signed.length, 1);
// 	assertMatch(signed[0], /^0x[0-9a-f]+$/i);
// });
