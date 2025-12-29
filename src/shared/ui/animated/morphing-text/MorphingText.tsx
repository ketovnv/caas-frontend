import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { cn } from 'shared/lib';
import { themeStore } from 'shared/model';
import { MorphingTextController } from './MorphingTextController';
import { DEFAULT_MORPH_TIME, DEFAULT_COOLDOWN_TIME } from './morphing-text.config';

// ============================================================================
// Types
// ============================================================================

interface MorphingTextBaseProps {
  /** Время морфинга в секундах */
  morphTime?: number;
  /** Время паузы между морфингами в секундах */
  coolDownTime?: number;
  className?: string;
  /** Стиль текста (по умолчанию goldStyle) */
  textStyle?: React.CSSProperties;
}

interface SingleTextProps extends MorphingTextBaseProps {
  /** Одиночный текст - морфинг при изменении */
  text: string;
  texts?: never;
}

interface CyclingTextProps extends MorphingTextBaseProps {
  /** Массив текстов для циклического морфинга */
  texts: string[];
  text?: never;
}

export type MorphingTextProps = SingleTextProps | CyclingTextProps;

// ============================================================================
// Constants
// ============================================================================

const TEXT_CLASSES = 'absolute inset-x-0 top-0 m-auto inline-block w-full';

/** Default style for headings - gold color from theme */
const getDefaultStyle = () => themeStore.goldStyle;

// ============================================================================
// Component
// ============================================================================

export const MorphingText = observer(function MorphingText({
  text,
  texts,
  morphTime = DEFAULT_MORPH_TIME,
  coolDownTime = DEFAULT_COOLDOWN_TIME,
  className,
  textStyle,
}: MorphingTextProps) {
  // Default to gold style for headings
  const style = textStyle ?? getDefaultStyle();
  // ─────────────────────────────────────────────────────────────────────────
  // Controller (single instance)
  // ─────────────────────────────────────────────────────────────────────────

  const ctrlRef = useRef<MorphingTextController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new MorphingTextController(
      text ?? texts?.[0] ?? '',
      morphTime,
      coolDownTime
    );
  }
  const ctrl = ctrlRef.current;

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    ctrl.startAnimation();

    // Start cycling if texts array provided
    if (texts && texts.length > 0) {
      ctrl.startCycling(texts);
    }

    return () => ctrl.dispose();
  }, [ctrl, texts]);

  // ─────────────────────────────────────────────────────────────────────────
  // React to text prop changes
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (text !== undefined) {
      ctrl.setText(text);
    }
  }, [ctrl, text]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <animated.div
      className={cn(
        'relative w-full font-bold leading-none',
        className
      )}
      style={{ filter: ctrl.filterStyle }}
    >
      <animated.span
        ref={(el) => { ctrl.text1Element = el; }}
        className={TEXT_CLASSES}
        style={style}
      />
      <animated.span
        ref={(el) => { ctrl.text2Element = el; }}
        className={TEXT_CLASSES}
        style={style}
      />

      {/* SVG Filter for threshold effect */}
      <svg
        id="morphing-filters"
        className="fixed size-0"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="morphing-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </animated.div>
  );
});
