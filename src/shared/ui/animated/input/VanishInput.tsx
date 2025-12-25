import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  type InputHTMLAttributes,
} from 'react';
import { useSpringValue, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

interface PixelData {
  x: number;
  y: number;
  color: string;
  r: number;
  vx: number;
  vy: number;
}

export interface VanishInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onSubmit'> {
  /** Rotating placeholder texts */
  placeholders?: string[];
  /** Callback on submit */
  onSubmit?: (value: string) => void;
  /** Container className */
  containerClass?: string;
  /** Particle color (overrides text extraction) */
  particleColor?: string;
}

export interface VanishInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  submit: () => void;
}

// ============================================================================
// Component - Full Imperative React Spring
// ============================================================================

export const VanishInput = forwardRef<VanishInputRef, VanishInputProps>(
  (
    {
      className,
      containerClass,
      placeholders = ['Type something...', 'Enter your text...', "What's on your mind?"],
      onSubmit,
      onChange,
      particleColor,
      ...props
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pixelsRef = useRef<PixelData[]>([]);
    const rafRef = useRef<number | undefined>(undefined);

    const [value, setValue] = useState('');
    const [animating, setAnimating] = useState(false);
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

    // 🎯 Imperative SpringValues
    const placeholderOpacity = useSpringValue(1, { config: config.gentle });
    const placeholderY = useSpringValue(0, { config: config.gentle });
    const arrowDashoffset = useSpringValue(50, { config: { tension: 200, friction: 20 } });
    const inputOpacity = useSpringValue(1, { config: { tension: 300, friction: 25 } });
    const canvasOpacity = useSpringValue(0, { config: { tension: 300, friction: 25 } });

    // 🎭 Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        setValue('');
        placeholderOpacity.start(1);
        placeholderY.start(0);
        arrowDashoffset.start(50);
      },
      submit: () => vanishAndSubmit(),
    }));

    // 🔄 Placeholder rotation
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [placeholders.length]);

    // 📝 Update placeholder animation when value changes
    useEffect(() => {
      if (value) {
        placeholderOpacity.start(0);
        placeholderY.start(-16);
        arrowDashoffset.start(0);
      } else {
        placeholderOpacity.start(1);
        placeholderY.start(0);
        arrowDashoffset.start(50);
      }
    }, [value, placeholderOpacity, placeholderY, arrowDashoffset]);

    // 🎨 Extract pixels from canvas text
    const extractPixels = useCallback(() => {
      if (!inputRef.current || !canvasRef.current) return [];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];

      const styles = getComputedStyle(inputRef.current);
      const fontSize = parseFloat(styles.fontSize);

      canvas.width = 800;
      canvas.height = 100;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize * 2}px ${styles.fontFamily}`;
      ctx.fillStyle = particleColor || '#fff';
      ctx.fillText(value, 16, 50);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels: PixelData[] = [];

      for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
          const i = (y * canvas.width + x) * 4;
          const alpha = imageData.data[i + 3] ?? 0;
          if (alpha > 128) {
            const r = imageData.data[i] ?? 0;
            const g = imageData.data[i + 1] ?? 0;
            const b = imageData.data[i + 2] ?? 0;
            pixels.push({
              x: x / 2,
              y: y / 2 + 8,
              r: 1.5,
              color: particleColor || `rgba(${r}, ${g}, ${b}, 1)`,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4 - 2,
            });
          }
        }
      }

      return pixels;
    }, [value, particleColor]);

    // 🚀 Vanish animation with imperative control
    const vanishAndSubmit = useCallback(async () => {
      if (!value || animating) return;

      setAnimating(true);
      pixelsRef.current = extractPixels();

      // Show canvas, hide input text
      await Promise.all([
        canvasOpacity.start(1),
        inputOpacity.start(0),
      ]);

      // Start particle animation
      const startTime = performance.now();
      const duration = 600;
      const maxX = Math.max(...pixelsRef.current.map((p) => p.x), 0);

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const sweepX = maxX * progress;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let hasActivePixels = false;

        for (const pixel of pixelsRef.current) {
          if (pixel.x < sweepX) {
            // Animate away
            pixel.x += pixel.vx;
            pixel.y += pixel.vy;
            pixel.vy += 0.1; // gravity
            pixel.r *= 0.96;

            if (pixel.r > 0.1) {
              hasActivePixels = true;
              ctx.beginPath();
              ctx.arc(pixel.x, pixel.y, pixel.r, 0, Math.PI * 2);
              ctx.fillStyle = pixel.color;
              ctx.fill();
            }
          } else {
            // Not yet swept
            hasActivePixels = true;
            ctx.beginPath();
            ctx.arc(pixel.x, pixel.y, pixel.r, 0, Math.PI * 2);
            ctx.fillStyle = pixel.color;
            ctx.fill();
          }
        }

        if (hasActivePixels && progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Finish: wait for particles to fade
          setTimeout(() => {
            setAnimating(false);
            onSubmit?.(value);
            setValue('');

            // Reset springs
            canvasOpacity.start(0);
            inputOpacity.start(1);
            
            setTimeout(() => inputRef.current?.focus(), 50);
          }, 300);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, [value, animating, extractPixels, canvasOpacity, inputOpacity, onSubmit]);

    // Cleanup RAF
    useEffect(() => {
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      vanishAndSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && value && !animating) {
        vanishAndSubmit();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange?.(e);
    };

    return (
      <form
        className={cn(
          'relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full',
          'bg-zinc-900 shadow-lg border border-zinc-800',
          'transition-colors duration-200',
          value && 'bg-zinc-800/80',
          containerClass
        )}
        onSubmit={handleSubmit}
      >
        {/* Canvas for particle effect */}
        <animated.canvas
          ref={canvasRef}
          className={cn(
            'pointer-events-none absolute left-2 top-1/2 -translate-y-1/2',
            'origin-left scale-50 sm:left-4'
          )}
          style={{ opacity: canvasOpacity }}
          width={800}
          height={100}
        />

        {/* Input */}
        <animated.input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={animating}
          type="text"
          className={cn(
            'relative z-10 size-full rounded-full border-none',
            'bg-transparent pl-4 pr-14 text-sm text-zinc-100 sm:pl-6 sm:text-base',
            'placeholder:text-transparent',
            'focus:outline-none focus:ring-0',
            className
          )}
          style={{ opacity: inputOpacity }}
          {...props}
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!value || animating}
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
                strokeDashoffset: arrowDashoffset.to((v) => (v / 50) * 14),
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
              opacity: placeholderOpacity,
              transform: placeholderY.to((y) => `translateY(${y}px)`),
            }}
          >
            {placeholders[currentPlaceholder]}
          </animated.span>
        </div>
      </form>
    );
  }
);

VanishInput.displayName = 'VanishInput';
