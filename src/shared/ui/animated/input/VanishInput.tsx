import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { VanishInputController } from './VanishInputController';

// ============================================================================
// Types
// ============================================================================

export interface VanishInputProps {
  /** Rotating placeholder texts */
  placeholders?: string[];
  /** Callback on submit */
  onSubmit?: (value: string) => void;
  /** Container className */
  containerClass?: string;
  /** Input className */
  className?: string;
  /** Particle color (overrides text extraction) */
  particleColor?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder */
  placeholder?: string;
}

export interface VanishInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  submit: () => void;
  /** Access to controller for external state management */
  controller: VanishInputController;
}

// ============================================================================
// Component
// ============================================================================

export const VanishInput = observer(
  forwardRef<VanishInputRef, VanishInputProps>(
    (
      {
        className,
        containerClass,
        placeholders = ['Type something...', 'Enter your text...', "What's on your mind?"],
        onSubmit,
        particleColor,
        disabled,
      },
      ref
    ) => {
      // ─────────────────────────────────────────────────────────────────────────
      // Controller (single instance)
      // ─────────────────────────────────────────────────────────────────────────

      const ctrlRef = useRef<VanishInputController | null>(null);
      if (!ctrlRef.current) {
        ctrlRef.current = new VanishInputController(placeholders);
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
        submit: () => ctrl.submit(onSubmit, particleColor),
        controller: ctrl,
      }));

      // ─────────────────────────────────────────────────────────────────────────
      // Event Handlers
      // ─────────────────────────────────────────────────────────────────────────

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        ctrl.submit(onSubmit, particleColor);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && ctrl.canSubmit) {
          ctrl.submit(onSubmit, particleColor);
        }
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        ctrl.setValue(e.target.value);
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Render
      // ─────────────────────────────────────────────────────────────────────────

      return (
        <form
          className={cn(
            'relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full',
            'bg-zinc-900 shadow-lg border border-zinc-800',
            'transition-colors duration-200',
            ctrl.hasValue && 'bg-zinc-800/80',
            containerClass
          )}
          onSubmit={handleSubmit}
        >
          {/* Canvas for particle effect */}
          <animated.canvas
            ref={(el) => { ctrl.canvasElement = el; }}
            className="pointer-events-none absolute left-2 top-[20%] origin-top-left scale-50 sm:left-4"
            style={{ opacity: ctrl.canvasOpacity }}
          />

          {/* Input */}
          <input
            ref={(el) => { ctrl.inputElement = el; }}
            value={ctrl.value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || ctrl.animating}
            type="text"
            className={cn(
              'relative z-10 size-full rounded-full border-none',
              'bg-transparent pl-4 pr-14 text-sm text-zinc-100 sm:pl-6 sm:text-base',
              'placeholder:text-transparent',
              'focus:outline-none focus:ring-0',
              ctrl.animating && 'text-transparent',
              className
            )}
          />

          {/* Submit button */}
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

          {/* Animated placeholder */}
          <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
            <animated.span
              className="w-[calc(100%-4rem)] truncate pl-4 text-sm text-zinc-500 sm:pl-6 sm:text-base"
              style={{
                opacity: ctrl.placeholderOpacity,
                transform: ctrl.placeholderTransform,
              }}
            >
              {ctrl.currentPlaceholderText}
            </animated.span>
          </div>
        </form>
      );
    }
  )
);

VanishInput.displayName = 'VanishInput';
