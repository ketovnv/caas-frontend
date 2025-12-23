import { TronWeb } from 'tronweb';
import type { IProvider } from '@web3auth/modal';

const TRON_RPC_URL = 'https://api.shasta.trongrid.io';

async function getPrivateKey(provider: IProvider): Promise<string> {
  const privateKey = await provider.request<never, string>({
    method: 'private_key',
  });
  return privateKey || '';
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

export { getPrivateKey };
