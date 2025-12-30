import { useRef, useState, useCallback } from 'react';
import { useTrail, animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { AnimatedInput, AnimatedInputController, RippleButton } from 'shared/ui';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { AMOUNT_INPUT_PROPS, ADDRESS_INPUT_PROPS } from '../config';
import { walletStore } from '../model/wallet.store';

// ============================================================================
// Types
// ============================================================================

interface TransactionFormProps {
  onSend?: (amount: string, address: string) => Promise<string>;
  /** Trigger entrance animation */
  isActive?: boolean;
  className?: string;
}

// ============================================================================
// Quick Amount Buttons
// ============================================================================

const QUICK_AMOUNTS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: 'MAX', value: 1 },
];

// ============================================================================
// Component
// ============================================================================

export const TransactionForm = observer(function TransactionForm({
  onSend,
  isActive = true,
  className,
}: TransactionFormProps) {
  // Controllers for imperative input control
  const amountCtrlRef = useRef<AnimatedInputController | null>(null);
  if (!amountCtrlRef.current) {
    amountCtrlRef.current = new AnimatedInputController({
      ...AMOUNT_INPUT_PROPS,
    });
  }
  const amountCtrl = amountCtrlRef.current;

  const addressCtrlRef = useRef<AnimatedInputController | null>(null);
  if (!addressCtrlRef.current) {
    addressCtrlRef.current = new AnimatedInputController({
      ...ADDRESS_INPUT_PROPS,
    });
  }
  const addressCtrl = addressCtrlRef.current;

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Get balance from store
  const balance = walletStore.currentTokenBalance;
  const balanceStr = balance?.balance
    ? parseFloat(balance.balance).toFixed(6)
    : '0.000000';
  const balanceNum = parseFloat(balanceStr) || 0;

  const canSend =
    amount.length > 0 &&
    address.length > 0 &&
    !isSending &&
    parseFloat(amount) > 0 &&
    parseFloat(amount) <= balanceNum;

  // ─────────────────────────────────────────────────────────────────────────
  // Trail animation for form elements
  // ─────────────────────────────────────────────────────────────────────────

  const trail = useTrail(5, {
    from: { opacity: 0, y: 24 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 24,
    },
    config: themeStore.springConfig,
    delay: 80,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleQuickAmount = useCallback((percentage: number) => {
    const quickAmount = (balanceNum * percentage).toFixed(6);
    setAmount(quickAmount);
    setError(null);
  }, [balanceNum]);

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    setError(null);

    // Validate amount
    const num = parseFloat(value);
    if (value && (isNaN(num) || num <= 0)) {
      setError('Invalid amount');
    } else if (num > balanceNum) {
      setError('Insufficient balance');
    }
  }, [balanceNum]);

  const handleSend = async () => {
    if (!canSend || !onSend) return;

    setIsSending(true);
    setError(null);
    setTxHash(null);

    try {
      // Send transaction and wait for result
      const hash = await onSend(amount, address);

      setTxHash(hash);
      setAmount('');
      setAddress('');

      // Clear input controllers
      amountCtrl.setValue('', true);
      addressCtrl.setValue('', false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={cn('w-full flex flex-col gap-6', className)}>
      {/* Balance Card */}
      {/*<animated.div*/}
      {/*  style={{*/}
      {/*    opacity: trail[0]?.opacity,*/}
      {/*    transform: trail[0]?.y.to(y => `translateY(${y}px)`),*/}
      {/*  }}*/}
      {/*  className={cn(*/}
      {/*    'p-6 rounded-3xl',*/}
      {/*    'bg-zinc-900/60 backdrop-blur-md',*/}
      {/*    'border border-zinc-800/50'*/}
      {/*  )}*/}
      {/*>*/}
      {/*  <animated.p*/}
      {/*    style={themeStore.grayStyle}*/}
      {/*    className="text-sm mb-2"*/}
      {/*  >*/}
      {/*    Available Balance*/}
      {/*  </animated.p>*/}
      {/*  <div className="flex items-baseline gap-2">*/}
      {/*    <animated.span*/}
      {/*      style={themeStore.accentStyle}*/}
      {/*      className="text-3xl font-bold tabular-nums"*/}
      {/*    >*/}
      {/*      {balance?.isLoading ? '...' : balanceStr}*/}
      {/*    </animated.span>*/}
      {/*    <animated.span*/}
      {/*      style={themeStore.colorStyle}*/}
      {/*      className="text-xl font-medium"*/}
      {/*    >*/}
      {/*      {walletStore.currentSymbol}*/}
      {/*    </animated.span>*/}
      {/*  </div>*/}
      {/*</animated.div>*/}

      {/* Amount Input */}
      <animated.div
        style={{
          opacity: trail[1]?.opacity,
          transform: trail[1]?.y.to(y => `translateY(${y}px)`),
        }}
        className="space-y-3"
      >
        <animated.label
          style={themeStore.grayStyle}
          className="block text-sm ml-1"
        >
          Amount
        </animated.label>
        <AnimatedInput
          controller={amountCtrl}
          type="number"
          onChange={handleAmountChange}
          showSubmitButton={false}
          className="text-xl"
        />

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleQuickAmount(value)}
              disabled={balanceNum <= 0}
              className={cn(
                'flex-1 py-2.5 rounded-xl',
                'text-sm font-medium',
                'bg-zinc-800/60 text-zinc-400',
                'hover:bg-zinc-700/60 hover:text-zinc-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-all duration-200',
                'border border-zinc-700/30'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </animated.div>

      {/* Address Input */}
      <animated.div
        style={{
          opacity: trail[2]?.opacity,
          transform: trail[2]?.y.to(y => `translateY(${y}px)`),
        }}
        className="space-y-3"
      >
        <animated.label
          style={themeStore.grayStyle}
          className="block text-sm ml-1"
        >
          Recipient Address
        </animated.label>
        <AnimatedInput
          controller={addressCtrl}
          onChange={setAddress}
          showSubmitButton={false}
        />
      </animated.div>

      {/* Error Display */}
      {error && (
        <animated.div
          style={{
            opacity: trail[3]?.opacity,
            transform: trail[3]?.y.to(y => `translateY(${y}px)`),
          }}
          className={cn(
            'p-4 rounded-2xl',
            'bg-red-500/10 border border-red-500/20',
            'text-red-400 text-sm text-center'
          )}
        >
          {error}
        </animated.div>
      )}

      {/* Success Display */}
      {txHash && (
        <animated.div
          style={{
            opacity: trail[3]?.opacity,
            transform: trail[3]?.y.to(y => `translateY(${y}px)`),
          }}
          className={cn(
            'p-4 rounded-2xl',
            'bg-green-500/10 border border-green-500/20'
          )}
        >
          <p className="text-green-400 text-sm text-center mb-2">
            Транзакция отправлена!
          </p>
          <p className="text-zinc-400 text-xs text-center break-all font-mono">
            {txHash.length > 20 ? `${txHash.slice(0, 20)}...${txHash.slice(-10)}` : txHash}
          </p>
          <button
            onClick={() => setTxHash(null)}
            className="mt-2 w-full text-green-400 hover:text-green-300 text-xs"
          >
            Закрыть
          </button>
        </animated.div>
      )}

      {/* Send Button */}
      <animated.div
        style={{
          opacity: trail[4]?.opacity,
          transform: trail[4]?.y.to(y => `translateY(${y}px)`),
        }}
        className="pt-2"
      >
        <RippleButton
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'w-full py-5 rounded-2xl text-lg font-semibold',
            'bg-violet-600 hover:bg-violet-500',
            'disabled:bg-zinc-700 disabled:text-zinc-500'
          )}
        >
          <div className="flex items-center justify-center gap-3">
            {isSending ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Send {walletStore.currentSymbol}</span>
              </>
            )}
          </div>
        </RippleButton>
      </animated.div>

      {/* Fee Estimate */}
      <animated.div
        style={{
          opacity: trail[4]?.opacity,
          transform: trail[4]?.y.to(y => `translateY(${y}px)`),
        }}
        className="text-center"
      >
        <animated.p style={themeStore.grayStyle} className="text-xs">
          Network fee will be calculated at send time
        </animated.p>
      </animated.div>
    </div>
  );
});
