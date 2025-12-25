import {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from 'react';
import {
  useTransition,
  useSpringValue,
  animated,
  config,
} from '@react-spring/web';
import { cn } from 'shared/lib';

// ============================================================================
// Types
// ============================================================================

export interface Tab {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

type TransitionType = 'slide' | 'fade' | 'scale' | 'flip';

export interface AnimatedTabsProps {
  tabs: Tab[];
  /** Default active tab id */
  defaultTab?: string;
  /** Controlled active tab */
  activeTab?: string;
  /** Callback on tab change */
  onTabChange?: (tabId: string) => void;
  /** Transition animation type */
  transition?: TransitionType;
  /** Tab list className */
  tabListClass?: string;
  /** Tab button className */
  tabClass?: string;
  /** Active tab className */
  activeTabClass?: string;
  /** Content area className */
  contentClass?: string;
  /** Root className */
  className?: string;
}

export interface AnimatedTabsRef {
  /** Switch to specific tab */
  switchTo: (tabId: string) => void;
  /** Get current tab id */
  getCurrentTab: () => string;
  /** Go to next tab */
  next: () => void;
  /** Go to previous tab */
  prev: () => void;
}

// ============================================================================
// Transition configs
// ============================================================================

interface TransitionSpringValues {
  opacity: number;
  x?: number;
  scale?: number;
  rotateY?: number;
}

const transitions: Record<TransitionType, {
  from: TransitionSpringValues;
  enter: TransitionSpringValues;
  leave: TransitionSpringValues;
}> = {
  slide: {
    from: { opacity: 0, x: 50 },
    enter: { opacity: 1, x: 0 },
    leave: { opacity: 0, x: -50 },
  },
  fade: {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  },
  scale: {
    from: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 1.1 },
  },
  flip: {
    from: { opacity: 0, rotateY: 90 },
    enter: { opacity: 1, rotateY: 0 },
    leave: { opacity: 0, rotateY: -90 },
  },
};

// ============================================================================
// Component - Imperative useTransition + useSpringValue
// ============================================================================

export const AnimatedTabs = forwardRef<AnimatedTabsRef, AnimatedTabsProps>(
  (
    {
      tabs,
      defaultTab,
      activeTab: controlledTab,
      onTabChange,
      transition = 'slide',
      tabListClass,
      tabClass,
      activeTabClass,
      contentClass,
      className,
    },
    ref
  ) => {
    const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id || '');
    const activeId = controlledTab ?? internalTab;
    const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // 🎯 Imperative indicator position
    const indicatorX = useSpringValue(0, { config: config.stiff });
    const indicatorWidth = useSpringValue(0, { config: config.stiff });

    // 🎨 Content transition with useTransition
    const transitionConfig = transitions[transition];
    const contentTransition = useTransition(activeId, {
      from: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.from },
      enter: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.enter },
      leave: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.leave },
      config: { ...config.gentle, duration: 200 },
      exitBeforeEnter: true,
    });

    // 🎯 Update indicator position imperatively
    const updateIndicator = useCallback((tabId: string) => {
      const button = tabRefs.current.get(tabId);
      if (!button) return;

      const container = button.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      indicatorX.start(buttonRect.left - containerRect.left);
      indicatorWidth.start(buttonRect.width);
    }, [indicatorX, indicatorWidth]);

    // 🔄 Switch tab handler
    const switchTo = useCallback(
      (tabId: string) => {
        const tab = tabs.find((t) => t.id === tabId);
        if (!tab || tab.disabled) return;

        if (!controlledTab) {
          setInternalTab(tabId);
        }
        onTabChange?.(tabId);
        updateIndicator(tabId);
      },
      [tabs, controlledTab, onTabChange, updateIndicator]
    );

    // ➡️ Next tab
    const next = useCallback(() => {
      const currentIndex = tabs.findIndex((t) => t.id === activeId);
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab && !nextTab.disabled) {
        switchTo(nextTab.id);
      }
    }, [tabs, activeId, switchTo]);

    // ⬅️ Previous tab
    const prev = useCallback(() => {
      const currentIndex = tabs.findIndex((t) => t.id === activeId);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (prevTab && !prevTab.disabled) {
        switchTo(prevTab.id);
      }
    }, [tabs, activeId, switchTo]);

    // 🎭 Expose imperative methods
    useImperativeHandle(ref, () => ({
      switchTo,
      getCurrentTab: () => activeId,
      next,
      prev,
    }));

    // Initialize indicator on mount
    const initRef = useCallback(
      (node: HTMLButtonElement | null, tabId: string) => {
        if (node) {
          tabRefs.current.set(tabId, node);
          if (tabId === activeId) {
            // Delay to ensure layout is ready
            requestAnimationFrame(() => updateIndicator(tabId));
          }
        }
      },
      [activeId, updateIndicator]
    );

    return (
      <div className={cn('w-full', className)}>
        {/* Tab list */}
        <div
          className={cn(
            'relative flex border-b border-zinc-800',
            tabListClass
          )}
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(node) => initRef(node, tab.id)}
              role="tab"
              aria-selected={activeId === tab.id}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => switchTo(tab.id)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium transition-colors',
                'text-zinc-400 hover:text-zinc-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                activeId === tab.id && 'text-white',
                tabClass,
                activeId === tab.id && activeTabClass
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* Animated indicator */}
          <animated.div
            className="absolute bottom-0 h-0.5 bg-blue-500 rounded-full"
            style={{
              left: indicatorX,
              width: indicatorWidth,
            }}
          />
        </div>

        {/* Tab content with transition */}
        <div className={cn('relative overflow-hidden', contentClass)}>
          {contentTransition((style, item) => {
            const tab = tabs.find((t) => t.id === item);
            if (!tab) return null;

            return (
              <animated.div
                role="tabpanel"
                aria-labelledby={tab.id}
                className="w-full"
                style={{
                  opacity: style.opacity,
                  transform:
                    style.x != null
                      ? style.x.to((x) => `translateX(${x}px)`)
                      : style.scale != null
                        ? style.scale.to((s) => `scale(${s})`)
                        : style.rotateY != null
                          ? style.rotateY.to((r) => `perspective(600px) rotateY(${r}deg)`)
                          : undefined,
                }}
              >
                {tab.content}
              </animated.div>
            );
          })}
        </div>
      </div>
    );
  }
);

AnimatedTabs.displayName = 'AnimatedTabs';
