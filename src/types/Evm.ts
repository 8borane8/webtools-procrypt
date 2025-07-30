import * as ethers from "ethers";

import type { TokenTransaction } from "../interfaces/TokenTransaction.ts";
import type { Transaction } from "../interfaces/Transaction.ts";
import type { TokenChain } from "../interfaces/TokenChain.ts";

const erc20abi = [
	"function decimals() view returns (uint8)",
	"function transfer(address to, uint256 amount) returns (bool)",
];

export abstract class Evm implements TokenChain {
	public static readonly type: number;

	private readonly provider: ethers.Provider;
	private readonly wallet: ethers.Wallet;

	constructor(rpcUrl: string, private readonly chainId: number, privateKey?: string) {
		this.provider = new ethers.JsonRpcProvider(rpcUrl);
		this.wallet = new ethers.Wallet(privateKey || ethers.Wallet.createRandom().privateKey, this.provider);
	}

	public getPrivateKey(): string {
		return this.wallet.privateKey;
	}

	public getAddress(): string {
		return this.wallet.address;
	}

	public async estimateTransactionsFees(transactions: Array<Transaction>): Promise<Array<number>> {
		const fees = await this.provider.getFeeData();
		const gasLimit = BigInt(21000);

		const fee = Number(ethers.formatEther(gasLimit * fees.gasPrice!));
		return new Array(transactions.length).fill(fee);
	}

	public async signTransactions(transactions: Array<Transaction>): Promise<Array<string>> {
		const fees = await this.provider.getFeeData();
		const nonce = await this.wallet.getNonce();
		const gasLimit = BigInt(21000);

		return Promise.all(transactions.map(async (tx, i) =>
			await this.wallet.signTransaction({
				to: tx.to,
				value: ethers.parseEther(tx.amount.toString()),
				gasLimit,
				gasPrice: fees.gasPrice!,
				nonce: nonce + i,
				chainId: this.chainId,
			})
		));
	}

	public async estimateTokenTransactionsFees(transactions: TokenTransaction[]): Promise<number[]> {
		const fees = await this.provider.getFeeData();

		const decimalsCache = new Map<string, number>();

		return Promise.all(transactions.map(async (tx) => {
			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const contract = new ethers.Contract(tx.tokenAddress, erc20abi, this.provider);
				decimals = (await contract.decimals()) as number;

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const data = new ethers.Interface(erc20abi).encodeFunctionData("transfer", [
				tx.to,
				ethers.parseUnits(tx.amount.toString(), decimals),
			]);

			const gasLimit = await this.provider.estimateGas({
				to: tx.tokenAddress,
				from: this.wallet.address,
				data,
				value: 0,
			});

			return Number(ethers.formatEther(gasLimit * fees.gasPrice!));
		}));
	}

	public async signTokenTransactions(transactions: TokenTransaction[]): Promise<string[]> {
		const fees = await this.provider.getFeeData();
		const nonce = await this.wallet.getNonce();

		const decimalsCache = new Map<string, number>();

		return Promise.all(transactions.map(async (tx, i) => {
			let decimals = decimalsCache.get(tx.tokenAddress);
			if (decimals == undefined) {
				const contract = new ethers.Contract(tx.tokenAddress, erc20abi, this.provider);
				decimals = (await contract.decimals()) as number;

				decimalsCache.set(tx.tokenAddress, decimals);
			}

			const data = new ethers.Interface(erc20abi).encodeFunctionData("transfer", [
				tx.to,
				ethers.parseUnits(tx.amount.toString(), decimals),
			]);

			const gasLimit = await this.provider.estimateGas({
				to: tx.tokenAddress,
				from: this.wallet.address,
				data,
				value: 0,
			});

			return await this.wallet.signTransaction({
				to: tx.tokenAddress,
				value: 0,
				gasLimit,
				gasPrice: fees.gasPrice!,
				nonce: nonce + i,
				chainId: this.chainId,
				data,
			});
		}));
	}

	public sendTransactions(transactions: Array<string>): Promise<Array<string>> {
		return Promise.all(transactions.map(async (tx) => {
			const response = await this.provider.broadcastTransaction(tx);
			return response.hash;
		}));
	}

	public static isValidAddress(address: string): boolean {
		return ethers.isAddress(address);
	}

	public static privateKeyBytesToString(bytes: Uint8Array): string {
		return ethers.hexlify(bytes);
	}
}
