<h1 align="center">Welcome on ProCrypt !</h1>

<p align="center">
    <em>
        ProCrypt is a small, simple, and ultrafast library for managing crypto wallets, built on Web Standards for Deno.
    </em>
</p>

<p align="center">
    <img src="https://img.shields.io/github/issues-closed/8borane8/webtools-procrypt.svg" alt="issues-closed" />
    &nbsp;
    <img src="https://img.shields.io/github/license/8borane8/webtools-procrypt.svg" alt="license" />
    &nbsp;
    <img src="https://img.shields.io/github/stars/8borane8/webtools-procrypt.svg" alt="stars" />
    &nbsp;
    <img src="https://img.shields.io/github/forks/8borane8/webtools-procrypt.svg" alt="forks" />
</p>

---

## ✨ Features

- Unified interface for managing **multi-chain wallets**
- Support for both **UTXO** and **account-based** chains
- Fully typed and **polymorphic** architecture
- Native support for **BIP-39**, **BIP-32**, **BIP-44**
- Built-in **testnet support** for all blockchains
- Seamless handling of **native and token transactions**

---

## 🧩 Core Architecture

ProCrypt exposes two main base classes and one extended type:

### ✅ `Wallet`

Handles hierarchical deterministic wallets using standard derivation paths.\
Allows you to generate, validate, and derive addresses for multiple blockchains from a single mnemonic.

### ✅ `Chain`

Abstract interface implemented by all supported blockchains.\
Provides a common, unified API to interact with native coin transactions.

### ✅ `TokenChain` (extends `Chain`)

Used for blockchains that support token standards (like Ethereum, Solana, Tron).\
Adds methods to handle token-based transactions via the `TokenTransaction` interface.

---

## 📦 Installation

```bash
deno add jsr:@webtools/procrypt
```

---

## 🧠 Wallet Example

```ts
import { Chains, Wallet } from "jsr:@webtools/procrypt";

// Create or restore a mnemonic-based wallet
const wallet = new Wallet(); // or: new Wallet("your mnemonic");

// Derive a Bitcoin wallet at index 0
const btc = wallet.derive(Chains.Bitcoin, 0);

console.log(btc.getAddress()); // e.g. 1BoatSLRHt...
console.log(wallet.getMnemonic()); // The mnemonic phrase

// Check mnemonic validity
console.log(Wallet.isValidMnemonic(wallet.getMnemonic())); // true
```

---

## 🔗 Chain Example (native transaction)

```ts
import { Chains } from "jsr:@webtools/procrypt";

// Bitcoin testnet 4 example
const btc = new Chains.BitcoinTest4("0xYourPrivateKey");

const tx = [
	{ to: "0xRecipient...", amount: 0.001 },
];

const fees = await btc.estimateTransactionsFees(tx); // => [feeAmount]
const signed = await btc.signTransactions(tx); // => ["0xSignedTx"]
const hashes = await btc.sendTransactions(signed); // => ["0xTransactionHash"]
```

---

## 🪙 TokenChain Example (token transaction)

```ts
import { Chains } from "jsr:@webtools/procrypt";

// Ethereum mainnet
const eth = new Chains.Ethereum("0xYourPrivateKey");

const tokenTx = [
	{
		to: "0xRecipient...",
		amount: 50,
		tokenAddress: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48", // USDC
	},
];

const tokenFees = await eth.estimateTokenTransactionsFees(tokenTx); // => [feeAmount]
const tokenSigned = await eth.signTokenTransactions(tokenTx); // => ["0xSignedTx"]
const tokenHashes = await eth.sendTransactions(tokenSigned); // => ["0xTransactionHash"]
```

---

## 📚 API Summary

### `interface Transaction`

```ts
interface Transaction {
	readonly to: string;
	readonly amount: number; // in native units
}
```

### `interface TokenTransaction`

```ts
interface TokenTransaction {
	readonly to: string;
	readonly amount: number;
	readonly tokenAddress: string;
}
```

### `class Wallet`

```ts
class Wallet {
	constructor(mnemonic?: string, complex?: boolean);

	getMnemonic(): string;
	derive(chain: ChainConstructor, index: number): Chain;

	static isValidMnemonic(mnemonic: string): boolean;
}
```

### `interface Chain`

```ts
interface Chain {
	constructor(privateKey?: string);

	getPrivateKey(): string;
	getAddress(): string;

	estimateTransactionsFees(transactions: Transaction[]): Promise<number[]>;
	signTransactions(transactions: Transaction[]): Promise<string[]>;
	sendTransactions(transactions: string[]): Promise<string[]>;
}
```

### `interface TokenChain` (extends `Chain`)

```ts
interface TokenChain extends Chain {
	constructor(privateKey?: string, rpcUrl: string);

	estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]>;
	signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]>;
}
```

---

## ✅ Supported Networks

| Blockchain          | Mainnet Class     | Testnet Class            | Tokens |
| ------------------- | ----------------- | ------------------------ | ------ |
| Bitcoin             | `Chains.Bitcoin`  | `Chains.BitcoinTest4`    | ❌     |
| Litecoin            | `Chains.Litecoin` | `Chains.LitecoinTest`    | ❌     |
| Ethereum            | `Chains.Ethereum` | `Chains.EthereumSepolia` | ✅     |
| Binance Smart Chain | `Chains.Bsc`      | `Chains.BscTest`         | ✅     |
| Solana              | `Chains.Solana`   | `Chains.SolanaDev`       | ✅     |
| Tron                | `Chains.Tron`     | `Chains.TronShasta`      | ✅     |

---

## 🪪 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
