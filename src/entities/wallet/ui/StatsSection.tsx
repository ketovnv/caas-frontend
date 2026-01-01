import { useTrail, animated, useSpring } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { themeStore } from 'shared/model';

// Types

interface StatItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

interface StatsSectionProps {
  /** Trigger animation on mount/tab change */
  isActive?: boolean;
}

// ============================================================================
// Data
// ============================================================================

const STATS: StatItem[] = [
  { label: 'Баланс', value: '1,234.56 TRX', change: '+12.5%', isPositive: true },
  { label: 'За месяц', value: '523.00 TRX', change: '-8.2%', isPositive: false },
  { label: 'Транзакций', value: '47', change: '+5', isPositive: true },
  { label: 'Контактов', value: '12' },
];

const RECENT_ACTIVITY = [
  { type: 'in', amount: '+150.00', from: '@dmitry', time: '2 мин' },
  { type: 'out', amount: '-50.00', to: '@anna', time: '1 час' },
  { type: 'in', amount: '+300.00', from: 'Faucet', time: '3 часа' },
];

// Component

export const StatsSection = observer(function StatsSection({
  isActive = true
}: StatsSectionProps) {
  // Trail animation for stats cards (staggered vertical entry)

  const statsTrail = useTrail(STATS.length, {
    from: { opacity: 0, y: 20 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 20
    },
    config: themeStore.springConfig,
    delay: 100,
  });


  // Trail animation for activity items (delayed stagger)


  const activityTrail = useTrail(RECENT_ACTIVITY.length, {
    from: { opacity: 0, y: 15, scale: 0.95 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 15,
      scale: isActive ? 1 : 0.95,
    },
    config: themeStore.springConfig,
    delay: 250, // Start after stats
  });


  // Section header animation


  const headerSpring = useSpring({
    from: { opacity: 0, y: 10 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 10
    },
    config: themeStore.springConfig,
    delay: 200,
  });

  return (
    <div className="w-full space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsTrail.map((spring, i) => {
          const stat = STATS[i]!;
          return (
            <animated.div
              key={stat.label}
              style={{
                opacity: spring.opacity,
                transform: spring.y.to(y => `translateY(${y}px)`),
              }}
              className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50"
            >
              <p className="text-zinc-500 text-xs mb-1">{stat.label}</p>
              <animated.p
                style={themeStore.goldStyle}
                className="text-lg font-bold"
              >
                {stat.value}
              </animated.p>
              {stat.change && (
                <p className={`text-xs mt-1 ${
                  stat.isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </p>
              )}
            </animated.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div>
        <animated.h3
          style={{
            opacity: headerSpring.opacity,
            transform: headerSpring.y.to(y => `translateY(${y}px)`),
            ...themeStore.goldStyle,
          }}
          className="text-sm font-medium mb-3"
        >
          Последняя активность
        </animated.h3>
        <div className="space-y-2">
          {activityTrail.map((spring, i) => {
            const activity = RECENT_ACTIVITY[i]!;
            const isIncoming = activity.type === 'in';

            return (
              <animated.div
                key={i}
                style={{
                  opacity: spring.opacity,
                  transform: spring.y.to((y) =>
                    `translateY(${y}px) scale(${spring.scale.get()})`
                  ),
                }}
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/30"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`size-8 rounded-full flex items-center justify-center ${
                    isIncoming ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                    <svg
                      className={`size-4 ${isIncoming ? 'text-emerald-400' : 'text-red-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isIncoming
                          ? "M19 14l-7 7m0 0l-7-7m7 7V3"
                          : "M5 10l7-7m0 0l7 7m-7-7v18"
                        }
                      />
                    </svg>
                  </div>

                  {/* Details */}
                  <div>
                    <p className={`text-sm font-medium ${
                      isIncoming ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {activity.amount} TRX
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {isIncoming ? `от ${activity.from}` : `для ${activity.to}`}
                    </p>
                  </div>
                </div>

                <p className="text-zinc-600 text-xs">{activity.time}</p>
              </animated.div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
