import { TronWeb } from 'tronweb';
import type { IProvider } from '@web3auth/base';

const TRON_RPC_URL = 'https://api.shasta.trongrid.io';

async function getPrivateKey(provider: IProvider): Promise<string> {
  // Try different method names (varies by Web3Auth version/adapter)
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

  console.warn('[TronRpc] getPrivateKey: no supported method found');
  return '';
}

function getTronWeb(privateKey: string): TronWeb {
  return new TronWeb({
    fullHost: TRON_RPC_URL,
    privateKey,
  });
}

export async function getTronAccount(provider: IProvider): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const address = tronWeb.address.fromPrivateKey(privateKey);
  return address || '';
}

export async function getTronBalance(provider: IProvider): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const address = tronWeb.address.fromPrivateKey(privateKey);

  if (!address) return '0';

  const balance = await tronWeb.trx.getBalance(address);
  return tronWeb.fromSun(balance).toString();
}

export async function signMessage(
  provider: IProvider,
  message: string
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const signedMessage = await tronWeb.trx.signMessageV2(message, privateKey);
  return signedMessage;
}

export async function sendTransaction(
  provider: IProvider,
  toAddress: string,
  amount: number
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const address = tronWeb.address.fromPrivateKey(privateKey);

  if (!address) throw new Error('No address found');

  const amountInSun = tronWeb.toSun(amount);
  const transaction = await tronWeb.transactionBuilder.sendTrx(
    toAddress,
    Number(amountInSun),
    address
  );

  const signedTransaction = await tronWeb.trx.sign(transaction, privateKey);
  const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

  return JSON.stringify(result);
}

// ============================================================================
// TRC-20 Token Functions
// ============================================================================

/**
 * Get TRC-20 token balance
 * @param provider Web3Auth provider
 * @param contractAddress TRC-20 contract address
 * @param decimals Token decimals (default 6 for USDT/USDC)
 */
export async function getTrc20Balance(
  provider: IProvider,
  contractAddress: string,
  decimals: number = 6
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const address = tronWeb.address.fromPrivateKey(privateKey);

  if (!address) return '0';

  try {
    // Get contract instance
    const contract = await tronWeb.contract().at(contractAddress);

    // Call balanceOf (TronWeb types are incomplete, use any)
    const balance = await (contract as any).methods.balanceOf(address).call();

    // Convert from smallest unit to token amount
    const balanceNum = Number(balance) / Math.pow(10, decimals);
    return balanceNum.toString();
  } catch (error) {
    console.error('Error getting TRC-20 balance:', error);
    return '0';
  }
}

/**
 * Send TRC-20 tokens
 * @param provider Web3Auth provider
 * @param contractAddress TRC-20 contract address
 * @param toAddress Recipient address
 * @param amount Amount to send (in token units, e.g., 10.5 USDT)
 * @param decimals Token decimals (default 6 for USDT/USDC)
 */
export async function sendTrc20(
  provider: IProvider,
  contractAddress: string,
  toAddress: string,
  amount: string,
  decimals: number = 6
): Promise<string> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);
  const address = tronWeb.address.fromPrivateKey(privateKey);

  if (!address) throw new Error('No address found');

  try {
    // Convert amount to smallest unit
    const amountInSmallestUnit = Math.floor(
      parseFloat(amount) * Math.pow(10, decimals)
    );

    // Get contract instance (TronWeb types are incomplete, use any)
    const contract = await tronWeb.contract().at(contractAddress);

    // Build and send transfer transaction
    const result = await (contract as any).methods
      .transfer(toAddress, amountInSmallestUnit)
      .send({
        feeLimit: 100_000_000, // 100 TRX max fee
        callValue: 0,
        from: address,
      });

    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (error) {
    console.error('Error sending TRC-20:', error);
    throw error;
  }
}

/**
 * Get TRC-20 token info (name, symbol, decimals)
 */
export async function getTrc20Info(
  provider: IProvider,
  contractAddress: string
): Promise<{ name: string; symbol: string; decimals: number }> {
  const privateKey = await getPrivateKey(provider);
  const tronWeb = getTronWeb(privateKey);

  try {
    // TronWeb types are incomplete, use any
    const contract = await tronWeb.contract().at(contractAddress) as any;

    const [name, symbol, decimals] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.decimals().call(),
    ]);

    return {
      name: name || 'Unknown',
      symbol: symbol || '???',
      decimals: Number(decimals) || 6,
    };
  } catch (error) {
    console.error('Error getting TRC-20 info:', error);
    return { name: 'Unknown', symbol: '???', decimals: 6 };
  }
}

export { getPrivateKey };
