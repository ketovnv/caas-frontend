import { ReactNode } from 'react';
import { cn } from '@/shared';

// ============================================================================
// Types
// ============================================================================

export interface PageLayoutProps {
  /** Контент страницы */
  children: ReactNode;
  /** Дополнительные классы для контейнера */
  className?: string;
  /** Центрировать контент по вертикали */
  centerContent?: boolean;
}

// ============================================================================
// Component
// Header is now in GlobalHeader (App level) - this is just content wrapper
// ============================================================================

export function PageLayout({
  children,
  className,
  centerContent = false,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center w-full max-w-2xl mx-auto',
        centerContent && 'flex-1 justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}
