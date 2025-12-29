import { useRef, useEffect, forwardRef, useImperativeHandle, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useTransition, animated, config } from '@react-spring/web';
import { cn } from 'shared/lib';
import { TabIndicatorController } from './TabIndicatorController';
import {themeStore} from "@/shared";

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
  /** Access to controller */
  controller: TabIndicatorController;
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
// Component
// ============================================================================

export const AnimatedTabs = observer(
  forwardRef<AnimatedTabsRef, AnimatedTabsProps>(
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
      // ─────────────────────────────────────────────────────────────────────────
      // Controller (single instance)
      // ─────────────────────────────────────────────────────────────────────────

      const ctrlRef = useRef<TabIndicatorController | null>(null);
      if (!ctrlRef.current) {
        ctrlRef.current = new TabIndicatorController(
          tabs.map(t => ({ id: t.id, disabled: t.disabled })),
          defaultTab
        );
      }
      const ctrl = ctrlRef.current;

      // Sync controlled tab
      const activeId = controlledTab ?? ctrl.activeTabId;

      // Update tabs when they change
      useEffect(() => {
        ctrl.setTabs(tabs.map(t => ({ id: t.id, disabled: t.disabled })));
      }, [tabs, ctrl]);

      // Sync controlled activeTab
      useEffect(() => {
        if (controlledTab && controlledTab !== ctrl.activeTabId) {
          ctrl.switchTo(controlledTab);
        }
      }, [controlledTab, ctrl]);

      // Cleanup
      useEffect(() => () => ctrl.dispose(), [ctrl]);

      // ─────────────────────────────────────────────────────────────────────────
      // Content transition (useTransition is allowed)
      // ─────────────────────────────────────────────────────────────────────────

      const transitionConfig = transitions[transition];
      const contentTransition = useTransition(activeId, {
        from: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.from },
        enter: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.enter },
        leave: { x: 0, scale: 1, rotateY: 0, ...transitionConfig.leave },
        config: { ...config.gentle, duration: 200 },
        exitBeforeEnter: true,
      });

      // ─────────────────────────────────────────────────────────────────────────
      // Navigation handlers
      // ─────────────────────────────────────────────────────────────────────────

      const handleTabClick = (tabId: string) => {
        if (ctrl.switchTo(tabId)) {
          onTabChange?.(tabId);
        }
      };

      // ─────────────────────────────────────────────────────────────────────────
      // Imperative Handle
      // ─────────────────────────────────────────────────────────────────────────

      useImperativeHandle(ref, () => ({
        switchTo: (tabId: string) => {
          if (ctrl.switchTo(tabId)) {
            onTabChange?.(tabId);
          }
        },
        getCurrentTab: () => ctrl.activeTabId,
        next: () => {
          if (ctrl.next()) {
            onTabChange?.(ctrl.activeTabId);
          }
        },
        prev: () => {
          if (ctrl.prev()) {
            onTabChange?.(ctrl.activeTabId);
          }
        },
        controller: ctrl,
      }));

      // ─────────────────────────────────────────────────────────────────────────
      // Render
      // ─────────────────────────────────────────────────────────────────────────

      return (
        <div className={cn('w-full', className)}>
          {/* Tab list */}
          <div
            ref={(el) => ctrl.setContainer(el)}
            className={cn(
              'relative flex',
              tabListClass
            )}
            role="tablist"
          >
            {tabs.map((tab) => (
              <animated.button
                key={tab.id}
                ref={(el) => ctrl.registerTab(tab.id, el)}
                role="tab"
                aria-selected={activeId === tab.id}
                aria-disabled={tab.disabled}
                disabled={tab.disabled}
                onClick={() => handleTabClick(tab.id)}
                style={activeId === tab.id ?themeStore.goldStyle: themeStore.colorStyle}
                className={cn(
                  'cursor-pointer relative px-4 py-3 text-sm font-medium transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  tabClass,
                  activeId === tab.id && activeTabClass
                )}
              >
                {tab.label}
              </animated.button>
            ))}

            {/* Animated indicator */}
            <animated.div
              className="absolute bottom-1 h-0.75 rounded-full"
              style={{
                ...themeStore.navBackgroundStyle,
                left: ctrl.x,
                width: ctrl.width,
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
  )
);

AnimatedTabs.displayName = 'AnimatedTabs';
