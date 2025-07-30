import { assert, assertEquals, assertMatch } from "jsr:@std/assert";
import * as procrypt from "../../../src/mod.ts";

const mockNetwork = {
	bech32: "tb",
	pubKeyHash: 0x6f,
	scriptHash: 0xc4,
	wif: 0xef,
};

const mockUtxos = [
	{
		txid: "c5e9ebf23ba69489217b30f96259ffc28cd389b5cc755115da5fc78acad53c2a",
		index: 0,
		value: 99588,
	},
];

class TestSegwit extends procrypt.Types.Utxo.Segwit {
	protected static override readonly network = mockNetwork;
	public static override readonly type = 0;

	constructor(privateKey?: string) {
		super(mockNetwork, privateKey);
	}

	// deno-lint-ignore require-await
	protected override async getUTXOs(): Promise<typeof mockUtxos> {
		return mockUtxos;
	}

	// deno-lint-ignore require-await
	protected override async getRecommendedFees(): Promise<number> {
		return 15;
	}

	// deno-lint-ignore require-await
	protected override async broadcastTransaction(tx: string): Promise<string> {
		return `broadcasted-${tx.slice(0, 10)}`;
	}
}

Deno.test("Segwit generates a valid address", () => {
	const segwit = new TestSegwit();
	const addr = segwit.getAddress();
	assert(TestSegwit.isValidAddress(addr));
});

Deno.test("Segwit generates consistent address", () => {
	const segwit = new TestSegwit("cUkfbEf9EVQJay9G5VtpZAwZgoJAaaxmb3U2YfTAooHFvMaZc5v3");
	assertEquals(segwit.getAddress(), "tb1q2ga58j5xdv5hqcg8qdpetuwjc3fxvscj2g6wjp");
});

Deno.test("Segwit: estimate fees & sign transaction", async () => {
	const segwit = new TestSegwit();

	const txData = [
		{
			to: segwit.getAddress(),
			amount: 0.00005,
		},
	];

	const fees = await segwit.estimateTransactionsFees(txData);
	assertEquals(fees.length, 1);
	assert(fees[0] > 0);

	const signed = await segwit.signTransactions(txData);
	assertEquals(signed.length, 1);
	assertMatch(signed[0], /^[0-9a-f]+$/i);
});
