import type { IProvider } from '@web3auth/no-modal';

// ============================================================================
// Ethereum (Sepolia Testnet) RPC Operations
// ============================================================================

const SEPOLIA_RPC_URL = 'https://rpc.sepolia.org';

/**
 * Extract private key from Web3Auth provider
 * Tries multiple method names for compatibility across Web3Auth versions
 */
async function getPrivateKey(provider: IProvider): Promise<string> {
  const methods = ['eth_private_key', 'private_key'];

  for (const method of methods) {
    try {
      const privateKey = await provider.request<never, string>({ method });
      if (privateKey) {
        return privateKey;
      }
    } catch {
      // Try next method
    }
  }

  console.warn('[EvmRpc] getPrivateKey: no supported method found');
  return '';
}

/**
 * Get Ethereum account address from Web3Auth provider
 */
export async function getEvmAccount(provider: IProvider): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) return '';

  // Dynamic import to avoid bundling ethers on initial load
  const { Wallet } = await import('ethers');
  const wallet = new Wallet(privateKey);
  return wallet.address;
}

/**
 * Get ETH balance for the connected account
 * @returns Balance in ETH as string
 */
export async function getEvmBalance(provider: IProvider): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) return '0';

  const { Wallet, JsonRpcProvider, formatEther } = await import('ethers');
  const wallet = new Wallet(privateKey);
  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);

  const balance = await rpcProvider.getBalance(wallet.address);
  return formatEther(balance);
}

/**
 * Sign a message with the connected wallet
 */
export async function signEvmMessage(
  provider: IProvider,
  message: string
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) throw new Error('No private key found');

  const { Wallet } = await import('ethers');
  const wallet = new Wallet(privateKey);
  return wallet.signMessage(message);
}

/**
 * Send ETH transaction
 * @param toAddress - Recipient address (0x...)
 * @param amount - Amount in ETH as string (e.g., "0.01")
 * @returns Transaction hash
 */
export async function sendEvmTransaction(
  provider: IProvider,
  toAddress: string,
  amount: string
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) throw new Error('No private key found');

  const { Wallet, JsonRpcProvider, parseEther } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey, rpcProvider);

  // Validate address
  if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
    throw new Error('Invalid Ethereum address');
  }

  // Send transaction
  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: parseEther(amount),
  });

  // Wait for confirmation
  const receipt = await tx.wait();

  return receipt?.hash || tx.hash;
}

/**
 * Get estimated gas for a transaction
 */
export async function estimateGas(
  provider: IProvider,
  toAddress: string,
  amount: string
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) throw new Error('No private key found');

  const { Wallet, JsonRpcProvider, parseEther, formatEther } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey, rpcProvider);

  const gasEstimate = await rpcProvider.estimateGas({
    from: wallet.address,
    to: toAddress,
    value: parseEther(amount),
  });

  const feeData = await rpcProvider.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;

  const totalFee = gasEstimate * gasPrice;
  return formatEther(totalFee);
}

// ============================================================================
// ERC-20 Token Functions
// ============================================================================

/** Standard ERC-20 ABI for balance and transfer */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

/**
 * Get ERC-20 token balance
 * @param provider Web3Auth provider
 * @param contractAddress ERC-20 contract address
 * @param decimals Token decimals (default 6 for USDT/USDC)
 * @returns Balance in token units as string
 */
export async function getErc20Balance(
  provider: IProvider,
  contractAddress: string,
  decimals: number = 6
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) return '0';

  const { Wallet, JsonRpcProvider, Contract } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey, rpcProvider);

  try {
    const contract = new Contract(contractAddress, ERC20_ABI, rpcProvider);
    // ethers Contract methods are dynamically typed
    const balance = await (contract as any).balanceOf(wallet.address);

    // Convert from smallest unit to token amount
    const balanceNum = Number(balance) / Math.pow(10, decimals);
    return balanceNum.toString();
  } catch (error) {
    console.error('Error getting ERC-20 balance:', error);
    return '0';
  }
}

/**
 * Send ERC-20 tokens
 * @param provider Web3Auth provider
 * @param contractAddress ERC-20 contract address
 * @param toAddress Recipient address
 * @param amount Amount to send (in token units, e.g., 10.5 USDT)
 * @param decimals Token decimals (default 6 for USDT/USDC)
 * @returns Transaction hash
 */
export async function sendErc20(
  provider: IProvider,
  contractAddress: string,
  toAddress: string,
  amount: string,
  decimals: number = 6
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) throw new Error('No private key found');

  const { Wallet, JsonRpcProvider, Contract, parseUnits } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey, rpcProvider);

  // Validate address
  if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
    throw new Error('Invalid Ethereum address');
  }

  try {
    const contract = new Contract(contractAddress, ERC20_ABI, wallet);

    // Convert amount to smallest unit
    const amountInSmallestUnit = parseUnits(amount, decimals);

    // Send transfer transaction (ethers Contract methods are dynamically typed)
    const tx = await (contract as any).transfer(toAddress, amountInSmallestUnit);

    // Wait for confirmation
    const receipt = await tx.wait();

    return receipt?.hash || tx.hash;
  } catch (error) {
    console.error('Error sending ERC-20:', error);
    throw error;
  }
}

/**
 * Get ERC-20 token info (name, symbol, decimals)
 */
export async function getErc20Info(
  provider: IProvider,
  contractAddress: string
): Promise<{ name: string; symbol: string; decimals: number }> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) {
    return { name: 'Unknown', symbol: '???', decimals: 18 };
  }

  const { JsonRpcProvider, Contract } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);

  try {
    // ethers Contract methods are dynamically typed
    const contract = new Contract(contractAddress, ERC20_ABI, rpcProvider) as any;

    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);

    return {
      name: name || 'Unknown',
      symbol: symbol || '???',
      decimals: Number(decimals) || 18,
    };
  } catch (error) {
    console.error('Error getting ERC-20 info:', error);
    return { name: 'Unknown', symbol: '???', decimals: 18 };
  }
}

/**
 * Estimate gas for ERC-20 transfer
 */
export async function estimateErc20Gas(
  provider: IProvider,
  contractAddress: string,
  toAddress: string,
  amount: string,
  decimals: number = 6
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  if (!privateKey) throw new Error('No private key found');

  const { Wallet, JsonRpcProvider, Contract, parseUnits, formatEther } = await import('ethers');

  const rpcProvider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(privateKey, rpcProvider);

  try {
    // ethers Contract methods are dynamically typed
    const contract = new Contract(contractAddress, ERC20_ABI, wallet) as any;
    const amountInSmallestUnit = parseUnits(amount, decimals);

    // Estimate gas for transfer
    const gasEstimate = await contract.transfer.estimateGas(toAddress, amountInSmallestUnit);

    const feeData = await rpcProvider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;

    const totalFee = gasEstimate * gasPrice;
    return formatEther(totalFee);
  } catch (error) {
    console.error('Error estimating ERC-20 gas:', error);
    return '0';
  }
}

export { getPrivateKey };
