import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { AnimatedInputController } from './AnimatedInputController';

// ============================================================================
// Types
// ============================================================================

export interface AnimatedInputProps {
  /** Rotating placeholder texts */
  placeholders?: string[];
  /** Callback on submit (Enter key or button click) */
  onSubmit?: (value: string) => void;
  /** Container className */
  containerClass?: string;
  /** Input className */
  className?: string;
  /** Spotlight color */
  spotlightColor?: string;
  /** Spotlight radius in pixels */
  spotlightRadius?: number;
  /** Particle color (for vanish effect) */
  particleColor?: string;
  /** Show submit button */
  showSubmitButton?: boolean;
  /** Placeholder text (single, overrides placeholders array) */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Input type */
  type?: string;
  /** Step value for numeric stepper (only for type="number") */
  step?: number;
  /** Min value for numeric input */
  min?: number;
  /** Max value for numeric input */
  max?: number;
  /** Quick-add amounts for numeric input (e.g., [10, 100]) */
  quickAmounts?: readonly number[];
}

export interface AnimatedInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  submit: () => void;
  /** Access to controller for external state management */
  controller: AnimatedInputController;
}

// ============================================================================
// Component
// ============================================================================

export const AnimatedInput = observer(
  forwardRef<AnimatedInputRef, AnimatedInputProps>(
    (
      {
        className,
        containerClass,
        placeholders = ['Type something...', 'Enter your text...', "What's on your mind?"],
        placeholder,
        onSubmit,
        spotlightColor,
        spotlightRadius,
        particleColor,
        showSubmitButton = true,
        disabled,
        type = 'text',
        step = 1,
        min,
        max,
        quickAmounts,
      },
      ref
    ) => {
      const isNumeric = type === 'number';

      // ─────────────────────────────────────────────────────────────────────────
      // Controller (single instance)
      // ─────────────────────────────────────────────────────────────────────────

      const ctrlRef = useRef<AnimatedInputController | null>(null);
      if (!ctrlRef.current) {
        ctrlRef.current = new AnimatedInputController({
          placeholders: placeholder ? [placeholder] : placeholders,
          spotlightRadius,
          spotlightColor,
          particleColor,
          step,
          min,
          max,
        });
      }
      const ctrl = ctrlRef.current;

      // ─────────────────────────────────────────────────────────────────────────
      // Lifecycle
      // ─────────────────────────────────────────────────────────────────────────

      useEffect(() => {
        ctrl.startPlaceholderRotation();
        return () => ctrl.dispose();
      }, [ctrl]);

      // ─────────────────────────────────────────────────────────────────────────
      // Imperative Handle
      // ─────────────────────────────────────────────────────────────────────────

      useImperativeHandle(ref, () => ({
        focus: () => ctrl.focus(),
        blur: () => ctrl.blur(),
        clear: () => ctrl.clear(),
        submit: () => ctrl.submit(onSubmit),
        controller: ctrl,
      }));

      // ─────────────────────────────────────────────────────────────────────────
      // Event Handlers
      // ─────────────────────────────────────────────────────────────────────────

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ctrl.submit(onSubmit);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && ctrl.canSubmit) {
          ctrl.submit(onSubmit);
        }
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        ctrl.setValue(e.target.value, isNumeric);
      };

      const handleMouseMove = (e: React.MouseEvent) => {
        ctrl.onMouseMove(e.clientX, e.clientY);
      };

      const handleFocus = () => {
        ctrl.onFocus();
      };

      const handleBlur = () => {
        ctrl.onBlur();
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Render
      // ─────────────────────────────────────────────────────────────────────────

      return (
        <form onSubmit={handleSubmit} className="w-full">
          <animated.div
            ref={(el) => { ctrl.containerElement = el; }}
            className={cn(
              'group/input relative mx-auto h-12 w-full max-w-xl',
              'overflow-hidden rounded-full p-[2px]',
              containerClass
            )}
            style={{
              background: ctrl.spotlightBackground,
            }}
            onMouseEnter={ctrl.onMouseEnter}
            onMouseLeave={ctrl.onMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {/* Focus glow ring */}
            <animated.div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: ctrl.focusBoxShadow }}
            />

            {/* Inner container */}
            <div
              className={cn(
                'relative h-full w-full rounded-full',
                'bg-zinc-900 shadow-lg border border-zinc-800',
                'transition-colors duration-200',
                ctrl.hasValue && 'bg-zinc-800/80'
              )}
            >
              {/* Canvas for particle effect */}
              <animated.canvas
                ref={(el) => { ctrl.canvasElement = el; }}
                className="pointer-events-none absolute left-2 top-[20%] origin-top-left scale-50 sm:left-4"
                style={{ opacity: ctrl.canvasOpacity }}
              />

              {/* Left side: decrement buttons (-, -10, -100) */}
              {isNumeric && (
                <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={ctrl.decrement}
                    disabled={disabled || ctrl.animating}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full',
                      'bg-zinc-700/80 text-zinc-300 transition-all duration-150',
                      'hover:bg-zinc-600 hover:text-white active:scale-90',
                      'disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  {quickAmounts?.map((amount) => (
                    <button
                      key={`dec-${amount}`}
                      type="button"
                      onClick={() => ctrl.add(-amount)}
                      disabled={disabled || ctrl.animating}
                      className={cn(
                        'flex h-7 items-center justify-center rounded-full px-1.5',
                        'bg-zinc-700/80 text-xs font-medium text-zinc-300',
                        'transition-all duration-150',
                        'hover:bg-zinc-600 hover:text-white active:scale-95',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                    >
                      −{amount}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <input
                ref={(el) => { ctrl.inputElement = el; }}
                value={ctrl.value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled || ctrl.animating}
                type={isNumeric ? 'text' : type}
                inputMode={isNumeric ? 'decimal' : undefined}
                className={cn(
                  'relative z-10 size-full rounded-full border-none',
                  'bg-transparent text-sm text-zinc-100 sm:text-base',
                  isNumeric ? 'px-28 text-center caret-zinc-100' : showSubmitButton ? 'pl-4 pr-14 sm:pl-6' : 'px-4 sm:px-6',
                  'placeholder:text-transparent',
                  'focus:outline-none focus:ring-0',
                  // Hide input text only when NOT focused (show animated value)
                  isNumeric && ctrl.hasValue && !ctrl.isFocused && 'text-transparent',
                  ctrl.animating && 'text-transparent',
                  className
                )}
              />

              {/* Animated number display for numeric input (only when not focused) */}
              {isNumeric && ctrl.hasValue && !ctrl.isFocused && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-sm text-zinc-100 sm:text-base tabular-nums">
                  <animated.span>{ctrl.animatedIntegerValue}</animated.span>
                  {ctrl.staticDecimalPart && <span>{ctrl.staticDecimalPart}</span>}
                </div>
              )}

              {/* Submit button */}
              {showSubmitButton && (
                <button
                  type="submit"
                  disabled={!ctrl.canSubmit || disabled}
                  className={cn(
                    'absolute right-2 top-1/2 z-20 -translate-y-1/2',
                    'flex size-8 items-center justify-center rounded-full',
                    'bg-blue-600 text-white transition-all duration-200',
                    'hover:bg-blue-500 active:scale-95',
                    'disabled:bg-zinc-700 disabled:cursor-not-allowed'
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animated.path
                      d="M5 12h14"
                      style={{
                        strokeDasharray: 14,
                        strokeDashoffset: ctrl.arrowDashoffset,
                      }}
                    />
                    <path d="M13 18l6-6" />
                    <path d="M13 6l6 6" />
                  </svg>
                </button>
              )}

              {/* Right side: increment buttons (+10, +100, +) */}
              {isNumeric && (
                <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex gap-1">
                  {quickAmounts?.map((amount) => (
                    <button
                      key={`inc-${amount}`}
                      type="button"
                      onClick={() => ctrl.add(amount)}
                      disabled={disabled || ctrl.animating}
                      className={cn(
                        'flex h-7 items-center justify-center rounded-full px-1.5',
                        'bg-zinc-700/80 text-xs font-medium text-zinc-300',
                        'transition-all duration-150',
                        'hover:bg-zinc-600 hover:text-white active:scale-95',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                    >
                      +{amount}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={ctrl.increment}
                    disabled={disabled || ctrl.animating}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full',
                      'bg-zinc-700/80 text-zinc-300 transition-all duration-150',
                      'hover:bg-zinc-600 hover:text-white active:scale-90',
                      'disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Animated placeholder */}
              <div className={cn(
                'pointer-events-none absolute inset-0 flex items-center rounded-full',
                isNumeric && 'justify-center'
              )}>
                <animated.span
                  className={cn(
                    'truncate text-sm text-zinc-500 sm:text-base',
                    isNumeric ? 'text-center' : 'pl-4 sm:pl-6',
                    isNumeric ? 'w-full' : showSubmitButton ? 'w-[calc(100%-4rem)]' : 'w-full'
                  )}
                  style={{
                    opacity: ctrl.placeholderOpacity,
                    transform: ctrl.placeholderTransform,
                  }}
                >
                  {ctrl.currentPlaceholderText}
                </animated.span>
              </div>
            </div>
          </animated.div>
        </form>
      );
    }
  )
);

AnimatedInput.displayName = 'AnimatedInput';
