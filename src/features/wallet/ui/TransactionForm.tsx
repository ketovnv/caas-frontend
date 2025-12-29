import { useRef, useState } from 'react';
import { useTrail, animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { AnimatedInput, type AnimatedInputRef, ShimmerButton } from 'shared/ui';
import { themeStore } from 'shared/model';
import { AMOUNT_INPUT_PROPS, ADDRESS_INPUT_PROPS } from '../config';

// ============================================================================
// Types
// ============================================================================

interface TransactionFormProps {
  onSend?: (amount: string, address: string) => void;
  balance?: string;
  /** Trigger entrance animation */
  isActive?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TransactionForm = observer(({
  onSend,
  balance = '0.00',
  isActive = true,
}: TransactionFormProps) => {
  const amountRef = useRef<AnimatedInputRef>(null);
  const addressRef = useRef<AnimatedInputRef>(null);

  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isSending, setIsSending] = useState(false);

  const canSend = amount.length > 0 && address.length > 0 && !isSending;

  // ─────────────────────────────────────────────────────────────────────────
  // Trail animation for form elements (4 items: balance, amount, address, button)
  // ─────────────────────────────────────────────────────────────────────────

  const trail = useTrail(4, {
    from: { opacity: 0, y: 20 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 20,
    },
    config: themeStore.springConfig,
    delay: 50,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);

    // Vanish effect на обоих инпутах
    await Promise.all([
      amountRef.current?.submit(),
      addressRef.current?.submit(),
    ]);

    onSend?.(amount, address);

    setAmount('');
    setAddress('');
    setIsSending(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">
      {/* Balance */}
      <animated.div
        style={{
          opacity: trail[0]?.opacity,
          transform: trail[0]?.y.to(y => `translateY(${y}px)`),
        }}
        className="text-center mb-6"
      >
        <animated.p style={themeStore.grayStyle} className="text-sm">Доступно</animated.p>
        <p className="text-2xl font-bold">
          <animated.span style={themeStore.accentStyle}>{balance}</animated.span>
          {' '}<animated.span style={themeStore.colorStyle}>TRX</animated.span>
        </p>
      </animated.div>

      {/* Amount Input */}
      <animated.div
        style={{
          opacity: trail[1]?.opacity,
          transform: trail[1]?.y.to(y => `translateY(${y}px)`),
        }}
      >
        <animated.label style={themeStore.grayStyle} className="block text-sm mb-2 ml-4">Сумма</animated.label>
        <AnimatedInput
          ref={amountRef}
          {...AMOUNT_INPUT_PROPS}
          type="number"
          onSubmit={setAmount}
        />
      </animated.div>

      {/* Address Input */}
      <animated.div
        style={{
          opacity: trail[2]?.opacity,
          transform: trail[2]?.y.to(y => `translateY(${y}px)`),
        }}
      >
        <label className="block text-zinc-400 text-sm mb-2 ml-4">Получатель</label>
        <AnimatedInput
          ref={addressRef}
          {...ADDRESS_INPUT_PROPS}
          onSubmit={setAddress}
        />
      </animated.div>

      {/* Send Button */}
      <animated.div
        style={{
          opacity: trail[3]?.opacity,
          transform: trail[3]?.y.to(y => `translateY(${y}px)`),
        }}
        className="pt-4 flex justify-end"
      >

        <ShimmerButton
          onClick={handleSend}
          disabled={!canSend}
          shimmerColor="#ffffff"
          shimmerDuration={2.5}
          shimmerSpread={90}
          shimmerSize="0.15em"
          shimmerBlur={4}
        >
          {isSending ? 'Отправка...' : 'Отправить TRX'}
        </ShimmerButton>
      </animated.div>
    </div>
  );
});

TransactionForm.displayName = 'TransactionForm';
