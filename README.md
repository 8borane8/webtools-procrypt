<h1 align="center">Welcome to ProCrypt !</h1>

<p align="center">
    <em>
        ProCrypt is a small, simple, and ultrafast library for managing multi-chain cryptocurrency wallets, built on Web Standards for Deno.
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

- **Unified Interface**: Single API for managing wallets across multiple blockchains
- **Multi-Chain Support**: Works with both **UTXO** (Bitcoin, Litecoin) and **account-based** (Ethereum, Solana, Tron)
  chains
- **Type Safety**: Fully typed with TypeScript for better developer experience
- **BIP Standards**: Native support for **BIP-39** (mnemonic), **BIP-32** (HD keys), **BIP-44** (derivation paths)
- **Testnet Ready**: Built-in testnet support for all supported blockchains
- **Token Support**: Seamless handling of both native coins and token transactions (ERC-20, SPL, TRC-20)
- **HD Wallets**: Generate and manage hierarchical deterministic wallets from a single mnemonic

---

## 🧩 Core Architecture

ProCrypt is built around a clean, polymorphic architecture that provides a unified interface for different blockchain
types.

### ✅ `Wallet`

The `Wallet` class manages hierarchical deterministic (HD) wallets using BIP-44 standard derivation paths. It allows you
to:

- Generate new mnemonic phrases (12 or 24 words)
- Restore wallets from existing mnemonics
- Derive addresses for multiple blockchains from a single seed
- Validate mnemonic phrases

**Key Features:**

- Uses BIP-39 for mnemonic generation and validation
- Uses BIP-32 for hierarchical key derivation
- Uses BIP-44 for standardized derivation paths (`m/44'/{coin_type}'/0'/0/{index}`)

### ✅ `Chain`

The `Chain` interface is implemented by all supported blockchains (both UTXO and account-based). It provides a unified
API for:

- Getting wallet addresses and private keys
- Estimating transaction fees
- Signing transactions
- Broadcasting signed transactions

**Supported Operations:**

- Native coin transactions only
- Works with UTXO chains (Bitcoin, Litecoin) and account-based chains (Ethereum, BSC, Solana, Tron)

### ✅ `TokenChain` (extends `Chain`)

The `TokenChain` interface extends `Chain` and adds support for token transactions. It's implemented by blockchains that
support token standards:

- **Ethereum/BSC**: ERC-20 tokens
- **Solana**: SPL tokens
- **Tron**: TRC-20 tokens

**Additional Methods:**

- Estimate token transaction fees
- Sign token transactions
- Automatically handles token decimals and contract interactions

---

## 📦 Installation

```bash
deno add jsr:@webtools/procrypt
```

---

## 🧠 Wallet Example

### Creating a New Wallet

```ts
import { Chains, Wallet } from "jsr:@webtools/procrypt";

// Create a new wallet with a 12-word mnemonic (default)
const wallet = new Wallet();

// Or create with a 24-word mnemonic (more secure)
const secureWallet = new Wallet(undefined, true);

// Get the mnemonic phrase (store this securely!)
const mnemonic = wallet.getMnemonic();
console.log(mnemonic); // "abandon abandon abandon ..."
```

### Restoring a Wallet

```ts
// Restore from an existing mnemonic
const restoredWallet = new Wallet(
	"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
);

// Validate a mnemonic before using it
if (Wallet.isValidMnemonic(someMnemonic)) {
	const wallet = new Wallet(someMnemonic);
}
```

### Deriving Multiple Chains

```ts
// Derive addresses for different blockchains from the same wallet
const btc = wallet.derive(Chains.Bitcoin, 0); // Bitcoin at index 0
const eth = wallet.derive(Chains.Ethereum, 0); // Ethereum at index 0
const sol = wallet.derive(Chains.Solana, 0); // Solana at index 0

// Or derive multiple addresses for the same chain
const btc0 = wallet.derive(Chains.Bitcoin, 0);
const btc1 = wallet.derive(Chains.Bitcoin, 1);

console.log(btc.getAddress()); // e.g. "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
console.log(eth.getAddress()); // e.g. "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

---

## 🔗 Chain Example (Native Transaction)

### UTXO Chain (Bitcoin)

```ts
import { Chains } from "jsr:@webtools/procrypt";

// Create a Bitcoin testnet wallet
const btc = new Chains.BitcoinTest4("cUkfbEf9EVQJay9G5VtpZAwZgoJAaaxmb3U2YfTAooHFvMaZc5v3");

// Prepare transactions
const transactions = [
	{ to: "tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", amount: 0.001 },
	{ to: "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx", amount: 0.0005 },
];

// Step 1: Estimate fees (returns array with one fee for all transactions combined)
const fees = await btc.estimateTransactionsFees(transactions);
console.log(`Estimated fee: ${fees[0]} BTC`);

// Step 2: Sign transactions (returns array with one signed transaction)
const signed = await btc.signTransactions(transactions);
console.log(`Signed transaction: ${signed[0]}`);

// Step 3: Broadcast transaction
const hashes = await btc.sendTransactions(signed);
console.log(`Transaction hash: ${hashes[0]}`);
```

### Account-Based Chain (Ethereum)

```ts
// Create an Ethereum wallet (with optional custom RPC URL)
const eth = new Chains.Ethereum(
	"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
	"https://ethereum-rpc.publicnode.com", // Optional, has default
);

// Prepare multiple native ETH transfers
const transactions = [
	{ to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", amount: 0.1 },
	{ to: "0x8ba1f109551bD432803012645Hac136c22C9299", amount: 0.05 },
];

// Estimate fees (returns array with fee for each transaction)
const fees = await eth.estimateTransactionsFees(transactions);
console.log(`Fees: ${fees.join(", ")} ETH`);

// Sign transactions (returns array with one signed transaction per input)
const signed = await eth.signTransactions(transactions);
console.log(`Signed transactions: ${signed.length}`);

// Broadcast all transactions
const hashes = await eth.sendTransactions(signed);
console.log(`Transaction hashes: ${hashes.join(", ")}`);
```

---

## 🪙 TokenChain Example (Token Transaction)

### ERC-20 Token (Ethereum/BSC)

```ts
import { Chains } from "jsr:@webtools/procrypt";

// Create an Ethereum wallet
const eth = new Chains.Ethereum("0xYourPrivateKey");

// Prepare token transactions (USDC example)
const tokenTransactions = [
	{
		to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
		amount: 50, // 50 USDC (decimals are handled automatically)
		tokenAddress: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48", // USDC contract
	},
	{
		to: "0x8ba1f109551bD432803012645Hac136c22C9299",
		amount: 100, // 100 USDC
		tokenAddress: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48",
	},
];

// Step 1: Estimate fees (includes gas for token transfer)
const tokenFees = await eth.estimateTokenTransactionsFees(tokenTransactions);
console.log(`Token fees: ${tokenFees.join(", ")} ETH`);

// Step 2: Sign token transactions
const tokenSigned = await eth.signTokenTransactions(tokenTransactions);
console.log(`Signed token transactions: ${tokenSigned.length}`);

// Step 3: Broadcast transactions
const tokenHashes = await eth.sendTransactions(tokenSigned);
console.log(`Token transaction hashes: ${tokenHashes.join(", ")}`);
```

**Important Notes:**

- Token amounts are specified in human-readable format (e.g., `50` for 50 USDC) - decimals are handled automatically
- Token addresses must be valid contract addresses (ERC-20 for Ethereum/BSC, SPL for Solana, TRC-20 for Tron)
- Fees are always paid in the native coin (ETH, BNB, SOL, TRX)
- Same pattern works for SPL tokens (Solana) and TRC-20 tokens (Tron) - just use the appropriate chain constructor

---

## 📚 API Reference

### Interfaces

#### `Transaction`

Represents a native coin transaction.

```ts
interface Transaction {
	to: string; // Recipient address
	amount: number; // Amount to send (in native coin units, e.g., BTC, ETH, SOL)
}
```

**Example:**

```ts
const tx: Transaction = {
	to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
	amount: 0.1, // 0.1 ETH
};
```

#### `TokenTransaction`

Extends `Transaction` for token transfers.

```ts
interface TokenTransaction extends Transaction {
	tokenAddress: string; // Token contract address (ERC-20, SPL, or TRC-20)
}
```

**Example:**

```ts
const tokenTx: TokenTransaction = {
	to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
	amount: 50, // 50 tokens (decimals handled automatically)
	tokenAddress: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606EB48", // USDC
};
```

### Classes

#### `Wallet`

Manages HD wallets using BIP-44 derivation paths.

```ts
class Wallet {
	/**
	 * Creates a new wallet or restores from mnemonic.
	 * @param mnemonic - Optional 12 or 24-word mnemonic phrase
	 * @param complex - If true, generates 24-word mnemonic (256 bits), else 12-word (128 bits)
	 */
	constructor(mnemonic?: string, complex?: boolean);

	/**
	 * Returns the mnemonic phrase for this wallet.
	 * @returns The mnemonic phrase (12 or 24 words)
	 */
	getMnemonic(): string;

	/**
	 * Derives a chain instance at the specified index.
	 * Uses BIP-44 path: m/44'/{coin_type}'/0'/0/{index}
	 * @param chain - Chain constructor (e.g., Chains.Bitcoin)
	 * @param index - Derivation index (default: 0)
	 * @returns Chain instance for the specified blockchain
	 */
	derive(chain: ChainConstructor, index: number): Chain;

	/**
	 * Validates a mnemonic phrase.
	 * @param mnemonic - The mnemonic phrase to validate
	 * @returns true if valid, false otherwise
	 */
	static isValidMnemonic(mnemonic: string): boolean;
}
```

**Usage:**

```ts
const wallet = new Wallet();
const btc = wallet.derive(Chains.Bitcoin, 0);
const eth = wallet.derive(Chains.Ethereum, 0);
```

#### `Chain`

Base interface for all blockchain implementations.

```ts
interface Chain {
	/**
	 * Creates a chain instance.
	 * @param privateKey - Optional private key (generates new if not provided)
	 */
	constructor(privateKey?: string);

	/**
	 * Returns the private key for this wallet.
	 * @returns Private key in chain-specific format
	 */
	getPrivateKey(): string;

	/**
	 * Returns the wallet address.
	 * @returns Address in chain-specific format
	 */
	getAddress(): string;

	/**
	 * Estimates transaction fees for the given transactions.
	 * @param transactions - Array of transactions to estimate
	 * @returns Promise resolving to array of fee amounts (in native coin)
	 */
	estimateTransactionsFees(transactions: Transaction[]): Promise<number[]>;

	/**
	 * Signs the given transactions.
	 * @param transactions - Array of transactions to sign
	 * @returns Promise resolving to array of signed transaction strings
	 */
	signTransactions(transactions: Transaction[]): Promise<string[]>;

	/**
	 * Broadcasts signed transactions to the network.
	 * @param transactions - Array of signed transaction strings
	 * @returns Promise resolving to array of transaction hashes
	 */
	sendTransactions(transactions: string[]): Promise<string[]>;
}
```

#### `TokenChain` (extends `Chain`)

Extended interface for blockchains supporting token standards.

```ts
interface TokenChain extends Chain {
	/**
	 * Creates a token chain instance.
	 * @param privateKey - Optional private key
	 * @param rpcUrl - RPC endpoint URL (has defaults for each chain)
	 */
	constructor(privateKey?: string, rpcUrl?: string);

	/**
	 * Estimates fees for token transactions.
	 * @param transactions - Array of token transactions
	 * @returns Promise resolving to array of fee amounts (in native coin)
	 */
	estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]>;

	/**
	 * Signs token transactions.
	 * @param transactions - Array of token transactions
	 * @returns Promise resolving to array of signed transaction strings
	 */
	signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]>;
}
```

### Chain Constructors

All chain constructors are available under the `Chains` namespace:

```ts
import { Chains } from "jsr:@webtools/procrypt";

// UTXO Chains (privateKey only)
new Chains.Bitcoin(privateKey?: string);
new Chains.BitcoinTest4(privateKey?: string);
new Chains.Litecoin(privateKey?: string);
new Chains.LitecoinTest(privateKey?: string);

// Account-based Chains (privateKey + optional rpcUrl)
new Chains.Ethereum(privateKey?: string, rpcUrl?: string);
new Chains.EthereumSepolia(privateKey?: string, rpcUrl?: string);
new Chains.Bsc(privateKey?: string, rpcUrl?: string);
new Chains.BscTest(privateKey?: string, rpcUrl?: string);
new Chains.Solana(privateKey?: string, rpcUrl?: string);
new Chains.SolanaDev(privateKey?: string, rpcUrl?: string);
new Chains.Tron(privateKey?: string, rpcUrl?: string);
new Chains.TronShasta(privateKey?: string, rpcUrl?: string);
```

---

## ✅ Supported Networks

| Blockchain          | Mainnet Class     | Testnet Class            | Tokens | Type    | BIP-44 Type |
| ------------------- | ----------------- | ------------------------ | ------ | ------- | ----------- |
| Bitcoin             | `Chains.Bitcoin`  | `Chains.BitcoinTest4`    | ❌     | UTXO    | 0           |
| Litecoin            | `Chains.Litecoin` | `Chains.LitecoinTest`    | ❌     | UTXO    | 2           |
| Ethereum            | `Chains.Ethereum` | `Chains.EthereumSepolia` | ✅     | Account | 60          |
| Binance Smart Chain | `Chains.Bsc`      | `Chains.BscTest`         | ✅     | Account | 60          |
| Solana              | `Chains.Solana`   | `Chains.SolanaDev`       | ✅     | Account | 501         |
| Tron                | `Chains.Tron`     | `Chains.TronShasta`      | ✅     | Account | 195         |

### Network Details

**UTXO Chains (Bitcoin, Litecoin):**

- Use SegWit (Bech32) addresses by default
- Multiple transactions are combined into a single transaction (arrays return one element)
- Fees estimated based on transaction size

**Account-Based Chains (Ethereum, BSC, Solana, Tron):**

- Each transaction processed separately (arrays return one element per transaction)
- Support for native coin and token transactions
- Automatic handling of token decimals
- Custom RPC endpoints supported

### Default RPC Endpoints

If not specified, the following public RPC endpoints are used:

- **Ethereum**: `https://ethereum-rpc.publicnode.com`
- **Ethereum Sepolia**: `https://ethereum-sepolia-rpc.publicnode.com`
- **BSC**: `https://bsc-rpc.publicnode.com`
- **BSC Testnet**: `https://bsc-testnet-rpc.publicnode.com`
- **Solana**: `https://api.mainnet-beta.solana.com`
- **Solana Devnet**: `https://api.devnet.solana.com`
- **Tron**: `https://api.trongrid.io`
- **Tron Shasta**: `https://api.shasta.trongrid.io`

---

## 🔒 Security Considerations

### Private Keys

- **Never commit private keys or mnemonics to version control**
- Store mnemonics securely (hardware wallet, encrypted storage)
- Use environment variables or secure key management systems
- Private keys are returned as strings - handle with care

### Best Practices

1. **Mnemonic Storage**: Always store mnemonics in encrypted form
2. **Testnet First**: Test all operations on testnet before using mainnet
3. **Fee Estimation**: Always estimate fees before signing transactions
4. **Error Handling**: Wrap transaction operations in try-catch blocks
5. **RPC Endpoints**: Use trusted RPC endpoints for production

### Example: Secure Wallet Creation

```ts
import { Wallet } from "jsr:@webtools/procrypt";

// Generate wallet
const wallet = new Wallet();

// Store mnemonic securely (encrypted, hardware wallet, etc.)
const mnemonic = wallet.getMnemonic();
// ... secure storage logic ...

// Later, restore from secure storage
const restoredWallet = new Wallet(encryptedMnemonic);
```

## ⚠️ Error Handling

All async methods can throw errors. Always use try-catch:

```ts
try {
	const fees = await chain.estimateTransactionsFees(transactions);
	const signed = await chain.signTransactions(transactions);
	const hashes = await chain.sendTransactions(signed);
	console.log("Success:", hashes);
} catch (error) {
	console.error("Transaction failed:", error);
	// Handle error appropriately
}
```

**Common Error Scenarios:**

- Insufficient balance for transaction
- Invalid recipient address
- Network/RPC connection issues
- Invalid private key format
- Transaction fee estimation failures

## 🚀 Advanced Usage

### Custom RPC Endpoints and Batch Operations

```ts
// Use custom RPC endpoint
const eth = new Chains.Ethereum("0xYourPrivateKey", "https://your-custom-rpc-endpoint.com");

// Batch token transactions to multiple recipients
const tokenTransactions = [
	{ to: "0xAddress1", amount: 10, tokenAddress: "0xToken..." },
	{ to: "0xAddress2", amount: 20, tokenAddress: "0xToken..." },
];

const fees = await eth.estimateTokenTransactionsFees(tokenTransactions);
const signed = await eth.signTokenTransactions(tokenTransactions);
const hashes = await eth.sendTransactions(signed);
```

## 📝 Important Notes

- **UTXO vs Account-Based**: UTXO chains combine multiple transactions into one (arrays return single element).
  Account-based chains process each separately (one element per transaction).
- **Token Decimals**: Automatically handled - specify amounts in human-readable format (e.g., `50` for 50 USDC).
- **Transaction Fees**: Always paid in native coin, even for token transactions.
- **Nonce Management**: Automatically handled for account-based chains.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🪪 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
