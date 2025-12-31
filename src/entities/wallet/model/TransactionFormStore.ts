import { makeAutoObservable, runInAction } from 'mobx';
import { AnimatedInputController } from 'shared/ui';
import { AMOUNT_INPUT_PROPS, ADDRESS_INPUT_PROPS } from '../config';
import { walletStore } from './wallet.store';

// ============================================================================
// TRON Address Validation
// ============================================================================

/** Base58 alphabet (no 0, O, I, l) */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const BASE58_REGEX = new RegExp(`^[${BASE58_ALPHABET}]+$`);

/**
 * Validate TRON address format
 * - Must start with 'T'
 * - Must be exactly 34 characters
 * - Must contain only Base58 characters
 */
export function isValidTronAddress(address: string): boolean {
  if (!address || address.length !== 34) return false;
  if (!address.startsWith('T')) return false;
  if (!BASE58_REGEX.test(address)) return false;
  return true;
}

/**
 * Get address validation error message
 */
export function getAddressError(address: string): string | null {
  if (!address) return null; // Empty is not an error (just incomplete)
  if (!address.startsWith('T')) return 'Адреса повинна починатись з T';
  if (address.length < 34) return `Адреса занадто коротка (${address.length}/34)`;
  if (address.length > 34) return `Адреса занадто довга (${address.length}/34)`;
  if (!BASE58_REGEX.test(address)) return 'Адреса містить недопустимі символи';
  return null;
}

// ============================================================================
// Quick Amount Config
// ============================================================================

export const QUICK_AMOUNTS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: 'MAX', value: 1 },
] as const;

// ============================================================================
// Transaction Form Store
// ============================================================================

class TransactionFormStore {
  // Controllers
  amountCtrl = new AnimatedInputController(AMOUNT_INPUT_PROPS);
  addressCtrl = new AnimatedInputController(ADDRESS_INPUT_PROPS);

  // State
  amount = '';
  address = '';
  isSending = false;
  error: string | null = null;
  addressError: string | null = null;
  txHash: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      amountCtrl: false,
      addressCtrl: false,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Computed - derived from walletStore
  // ─────────────────────────────────────────────────────────────────────────

  get balanceNum(): number {
    const balance = walletStore.currentTokenBalance;
    const balanceStr = balance?.balance
      ? parseFloat(balance.balance).toFixed(6)
      : '0.000000';
    return parseFloat(balanceStr) || 0;
  }

  get canSend(): boolean {
    return (
      this.amount.length > 0 &&
      isValidTronAddress(this.address) &&
      !this.isSending &&
      !this.error &&
      !this.addressError &&
      parseFloat(this.amount) > 0 &&
      parseFloat(this.amount) <= this.balanceNum
    );
  }

  /** Check if address is valid */
  get isAddressValid(): boolean {
    return isValidTronAddress(this.address);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────

  setAmount = (value: string) => {
    this.amount = value;
    this.error = null;

    // Validate
    const num = parseFloat(value);
    if (value && (isNaN(num) || num <= 0)) {
      this.error = 'Invalid amount';
    } else if (num > this.balanceNum) {
      this.error = 'Insufficient balance';
    }
  };

  setAddress = (value: string) => {
    this.address = value;
    this.addressError = getAddressError(value);
  };

  setQuickAmount = (percentage: number) => {
    const quickAmount = this.balanceNum * percentage;
    this.amount = quickAmount.toFixed(6);
    this.amountCtrl.animateTo(quickAmount);
    this.error = null;
  };

  clearTxHash = () => {
    this.txHash = null;
  };

  clearError = () => {
    this.error = null;
  };

  send = async (onSend?: (amount: string, address: string) => Promise<string>) => {
    if (!this.canSend || !onSend) return;

    runInAction(() => {
      this.isSending = true;
      this.error = null;
      this.txHash = null;
    });

    try {
      const hash = await onSend(this.amount, this.address);

      runInAction(() => {
        this.txHash = hash;
        this.amount = '';
        this.address = '';
        this.isSending = false;
      });

      // Clear input controllers
      this.amountCtrl.setValue('', true);
      this.addressCtrl.setValue('', false);
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Transaction failed';
        this.isSending = false;
      });
    }
  };

  reset = () => {
    this.amount = '';
    this.address = '';
    this.isSending = false;
    this.error = null;
    this.addressError = null;
    this.txHash = null;
    this.amountCtrl.setValue('', true);
    this.addressCtrl.setValue('', false);
  };
}

// ============================================================================
// Singleton
// ============================================================================

export const transactionFormStore = new TransactionFormStore();
