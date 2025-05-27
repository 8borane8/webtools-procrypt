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

<hr>

## ✨ Features

- Multi-chain wallet support (UTXO and EVM-based)
- Supports Bitcoin, Litecoin, Ethereum, BSC, Solana, and Tron
- Built-in testnet support for all chains
- Easy transaction signing and broadcasting
- Generates address from existing or new private keys

## 📦 Installation

```bash
deno add jsr:@webtools/procrypt
```

## 🧠 Usage Example

ProCrypt provides a unified API to interact with all supported blockchains. Here is a minimal example using Ethereum
testnet. All other chain classes follow the same interface.

```ts
import * as procrypt from "jsr:@webtools/procrypt";

// Use an existing private key or leave empty to auto-generate one
const wallet = new procrypt.Chains.EthereumSepolia("0xb14e0a4c18767...");

console.log(wallet.getPrivateKey()); // => prints your private key
console.log(wallet.getAddress()); // => prints your wallet address

console.log(procrypt.Chains.EthereumSepolia.isValidAddress(wallet.getAddress())); // => boolean

const transactions = [
	{ to: "0xRecipientAddress", amount: 0.001 },
];

// Estimate transaction fees
const estimatedFees = await wallet.estimateTransactionsFees(transactions);
console.log(estimatedFees); // => array of estimated fees for each transaction

// Sign transactions
const signedTransactions = await wallet.signTransactions(transactions);
console.log(signedTransactions); // => array of signed raw transactions

// Broadcast transactions
const txIds = await wallet.sendTransactions(signedTransactions);
console.log(txIds); // => array of transaction IDs
```

## 🏗️ Available Classes

You can import and use any of the following wallet classes:

### UTXO-based:

- `Bitcoin`
- `BitcoinTest4`
- `Litecoin`
- `LitecoinTest`

### EVM-based:

- `Ethereum`
- `EthereumSepolia`
- `Bsc`
- `BscTest`
- `Solana`
- `SolanaTest`
- `Tron`
- `TronShasta`

## 📚 API Overview

### `interface Transaction`

```ts
interface Transaction {
	readonly to: string;
	readonly amount: number;
}
```

### `interface Chain`

All blockchain classes implement the `Chain` interface:

```ts
interface ChainConstructor {
	new (privateKey?: string): Chain;
	isValidAddress(address: string): boolean;
}

interface Chain {
	getPrivateKey(): string;
	getAddress(): string;
	estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>>;
	signTransactions(transactions: Array<Transaction>): Promise<Array<string>>;
	sendTransactions(transactions: Array<string>): Promise<Array<string>>;
}
```

## ✅ Supported Networks

| Blockchain          | Mainnet | Testnet |
| ------------------- | ------- | ------- |
| Bitcoin             | ✅      | ✅      |
| Litecoin            | ✅      | ✅      |
| Ethereum            | ✅      | ✅      |
| Binance Smart Chain | ✅      | ✅      |
| Solana              | ✅      | ✅      |
| Tron                | ✅      | ✅      |

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
