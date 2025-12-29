import { useSpring, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';
import type { ReactNode } from 'react';
import {themeStore} from "@/shared";

// ============================================================================
// Types
// ============================================================================

export interface MorphingTab<T extends string = string> {
  id: T;
  label: ReactNode;
}

export interface MorphingTabsProps<T extends string = string> {
  tabs: MorphingTab<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  /** Margin around active tab for goo effect */
  margin?: number;
  /** SVG filter blur intensity */
  blurStdDeviation?: number;
  /** Container className */
  className?: string;
  /** Tab button className */
  tabClassName?: string;
  /** Active tab className */
  activeTabClassName?: string;
}

// ============================================================================
// Tab Button Component
// ============================================================================

interface TabButtonProps<T extends string> {
  tab: MorphingTab<T>;
  isActive: boolean;
  margin: number;
  onClick: () => void;
  className?: string;
  activeClassName?: string;
}

function TabButton<T extends string>({
  tab,
  isActive,
  margin,
  onClick,
  className,
  activeClassName,
}: TabButtonProps<T>) {
  const spring = useSpring({
    marginLeft: isActive ? margin : 0,
    marginRight: isActive ? margin : 0,
    config: config.wobbly,
  });

  return (
    <animated.button
      onClick={onClick}
      style={{
        ...themeStore.buttonGradientStyle,
        marginLeft: spring.marginLeft,
        marginRight: spring.marginRight,
      }}
      className={cn(
        'px-4 py-2 rounded-lg cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
        'group',
        className,
        isActive && activeClassName
      )}
    >
      {/* Invisible bold text to reserve space */}
      <span className="relative inline-flex justify-center">
        <span className="invisible font-bold">{tab.label}</span>
        <animated.span
            style={themeStore.colorStyle}
            className={cn(
          'absolute inset-0 flex items-center justify-center',
          'group-hover:font-bold',
          isActive && 'font-bold'
        )}>
          {tab.label}
        </animated.span>
      </span>
    </animated.button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MorphingTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  margin = 20,
  blurStdDeviation = 6,
  className,
  tabClassName,
  activeTabClassName,
}: MorphingTabsProps<T>) {
  if (!tabs.length) return null;

  return (
    <div
      className={cn('relative flex items-center', className)}
      style={{ filter: 'url(#morphingTabsGoo)' }}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          margin={margin}
          onClick={() => onTabChange(tab.id)}
          className={tabClassName}
          activeClassName={activeTabClassName}
        />
      ))}

      {/* SVG Goo Filter */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        className="absolute w-0 h-0 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="morphingTabsGoo"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={blurStdDeviation}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 36 -12
              "
              result="goo"
            />
            <feComposite
              in="SourceGraphic"
              in2="goo"
              operator="atop"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
