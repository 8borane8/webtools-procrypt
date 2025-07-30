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
		txid: "451adc5212583ad320ad212121fe961d048d9fb47c2deb73dda2ae3d9fb326c4",
		index: 1,
		value: 500000,
		hex: "020000000001014cd9ca632fb3817ab80a47a72aa72088b3735ae690e9dc17f850fc990f9afeb30200000000fdffffff03ee3cc815010000001976a91412118c24e4815370afc67bc0061b09caf310b5e288ac20a10700000000001976a914523b43ca866b29706107034395f1d2c45266431288ac0000000000000000196a176661756365742e746573746e6574342e6465762074786e02473044022033c886ec875c1d3cd5714443f01f7e726a8a0247b0095fa1fc090f7bcfa086ae022033eb72d825516886c9a8535741a2671d630cd739d00bc96c5135323fdec87e140121037f922eac25849794af68b5df637f36b11bfa47a00b2b53b9f8224b62ea353ae000000000",
	},
];

class TestLegacy extends procrypt.Types.Utxo.Legacy {
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

Deno.test("Legacy generates a valid address", () => {
	const legacy = new TestLegacy();
	const addr = legacy.getAddress();
	assert(TestLegacy.isValidAddress(addr));
});

Deno.test("Legacy generates consistent address", () => {
	const legacy = new TestLegacy("cUkfbEf9EVQJay9G5VtpZAwZgoJAaaxmb3U2YfTAooHFvMaZc5v3");
	assertEquals(legacy.getAddress(), "mo1khaKMKQvRyxF9EcnzHkcCNoCkWpD69q");
});

Deno.test("Legacy: estimate fees & sign transaction", async () => {
	const legacy = new TestLegacy("cUkfbEf9EVQJay9G5VtpZAwZgoJAaaxmb3U2YfTAooHFvMaZc5v3");

	const txData = [
		{
			to: legacy.getAddress(),
			amount: 0.00005,
		},
	];

	const fees = await legacy.estimateTransactionsFees(txData);
	assertEquals(fees.length, 1);
	assert(fees[0] > 0);

	const signed = await legacy.signTransactions(txData);
	assertEquals(signed.length, 1);
	assertMatch(signed[0], /^[0-9a-f]+$/i);
});
