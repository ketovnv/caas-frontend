import { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { SpotlightController } from './SpotlightController';

// ============================================================================
// Types
// ============================================================================

export interface SpotlightInputProps {
  /** Container className */
  containerClass?: string;
  /** Input className */
  className?: string;
  /** Spotlight color (CSS color) */
  spotlightColor?: string;
  /** Spotlight radius in pixels */
  spotlightRadius?: number;
  /** Enable pulse effect on focus */
  pulse?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Input type */
  type?: string;
  /** OnFocus callback */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** OnBlur callback */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** OnChange callback */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Value */
  value?: string;
  /** Default value */
  defaultValue?: string;
}

export interface SpotlightInputRef {
  focus: () => void;
  blur: () => void;
  /** Access to controller for external state management */
  controller: SpotlightController;
}

// ============================================================================
// Component
// ============================================================================

export const SpotlightInput = observer(
  forwardRef<SpotlightInputRef, SpotlightInputProps>(
    (
      {
        className,
        containerClass,
        spotlightColor = 'rgba(59, 130, 246, 0.5)',
        spotlightRadius = 120,
        pulse = true,
        onFocus,
        onBlur,
        ...props
      },
      ref
    ) => {
      // ─────────────────────────────────────────────────────────────────────────
      // Controller (single instance)
      // ─────────────────────────────────────────────────────────────────────────

      const ctrlRef = useRef<SpotlightController | null>(null);
      if (!ctrlRef.current) {
        ctrlRef.current = new SpotlightController(spotlightRadius, spotlightColor);
      }
      const ctrl = ctrlRef.current;

      // Cleanup
      useEffect(() => () => ctrl.dispose(), [ctrl]);

      // ─────────────────────────────────────────────────────────────────────────
      // Imperative Handle
      // ─────────────────────────────────────────────────────────────────────────

      useImperativeHandle(ref, () => ({
        focus: () => ctrl.focus(),
        blur: () => ctrl.blur(),
        controller: ctrl,
      }));

      // ─────────────────────────────────────────────────────────────────────────
      // Event Handlers
      // ─────────────────────────────────────────────────────────────────────────

      const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        ctrl.onMouseMove(e.clientX, e.clientY);
      };

      const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        ctrl.onFocus(pulse);
        onFocus?.(e);
      };

      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        ctrl.onBlur();
        onBlur?.(e);
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Render
      // ─────────────────────────────────────────────────────────────────────────

      return (
        <animated.div
          ref={(el) => { ctrl.containerElement = el; }}
          className={cn('group/input relative rounded-lg p-[2px]', containerClass)}
          style={{
            background: ctrl.background,
            transform: ctrl.transform,
          }}
          onMouseEnter={ctrl.onMouseEnter}
          onMouseLeave={ctrl.onMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {/* Focus glow ring */}
          <animated.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ boxShadow: ctrl.boxShadow }}
          />

          <input
            ref={(el) => { ctrl.inputElement = el; }}
            className={cn(
              'flex h-11 w-full rounded-md px-3 py-2 text-sm',
              'border-none bg-zinc-900 text-zinc-100',
              'placeholder:text-zinc-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-shadow duration-200',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </animated.div>
      );
    }
  )
);

SpotlightInput.displayName = 'SpotlightInput';
