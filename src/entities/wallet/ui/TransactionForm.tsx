import { useTrail, animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { AnimatedInput, RippleButton } from 'shared/ui';
import { themeStore } from 'shared/model';
import { cn } from 'shared/lib';
import { walletStore } from '../model/wallet.store';
import { transactionFormStore, QUICK_AMOUNTS } from '../model/TransactionFormStore';

// Types

interface TransactionFormProps {
  onSend?: (amount: string, address: string) => Promise<string>;
  /** Trigger entrance animation */
  isActive?: boolean;
  className?: string;
}

// Component

export const TransactionForm = observer(function TransactionForm({
  onSend,
  isActive = true,
  className,
}: TransactionFormProps) {
  const store = transactionFormStore;

  // Trail animation for form elements

  const trail = useTrail(5, {
    from: { opacity: 0, y: 24 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 24,
    },
    config: themeStore.springConfig,
    delay: 80,
  });

  // Render

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
          style={themeStore.colorStyle}
          className="block text-sm ml-1"
        >
          Amount
        </animated.label>
        <AnimatedInput
          controller={store.amountCtrl}
          type="number"
          onChange={store.setAmount}
          showSubmitButton={false}
          className="text-xl"
        />

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => store.setQuickAmount(value)}
              disabled={store.balanceNum <= 0}
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
          style={themeStore.colorStyle}
          className="block text-sm ml-1"
        >
          Recipient Address
        </animated.label>
        <AnimatedInput
          controller={store.addressCtrl}
          onChange={store.setAddress}
          showSubmitButton={false}
        />
        {/* Address validation error */}
        {store.addressError && (
          <p className="text-red-400 text-xs ml-1 -mt-1">
            {store.addressError}
          </p>
        )}
        {/* Valid address indicator */}
        {store.address && store.isAddressValid && (
          <p className="text-emerald-400 text-xs ml-1 -mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Адреса валідна
          </p>
        )}
      </animated.div>

      {/* Error Display */}
      {store.error && (
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
          {store.error}
        </animated.div>
      )}

      {/* Success Display */}
      {store.txHash && (
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
            {store.txHash.length > 20 ? `${store.txHash.slice(0, 20)}...${store.txHash.slice(-10)}` : store.txHash}
          </p>
          <button
            onClick={store.clearTxHash}
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
          onClick={() => store.send(onSend)}
          disabled={!store.canSend}
          className={cn(
            'w-full py-5 rounded-2xl text-lg font-semibold',
            'bg-violet-600 hover:bg-violet-500',
            'disabled:bg-zinc-700 disabled:text-zinc-500'
          )}
        >
          <div className="flex items-center justify-center gap-3">
            {store.isSending ? (
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

    </div>
  );
});
