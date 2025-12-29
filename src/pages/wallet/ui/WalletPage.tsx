import { useState, useMemo, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { TransactionForm, NotesSection, StatsSection } from 'features/wallet';
import { PageLayout, MorphingText, AnimatedTabs, Card, CardContent, CardHeader, type Tab } from 'shared/ui';
import {themeStore} from "@/shared";

export function WalletPage() {
  const [activeTab, setActiveTab] = useState('send');
  const [transactions, setTransactions] = useState<Array<{ amount: string; address: string; time: Date }>>([]);

  // Ref для измерения высоты контента
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // ResizeObserver для отслеживания реальной высоты
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height > 0) {
          setContentHeight(height);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Плавная анимация высоты
  const heightSpring = useSpring({
    height: contentHeight ?? 300,
    config: {
      tension: 170,
      friction: 26,
      clamp: true,
    },
  });

  const handleSend = (amount: string, address: string) => {
    console.log('Sending:', amount, 'TRX to', address);
    setTransactions((prev) => [
      { amount, address, time: new Date() },
      ...prev,
    ].slice(0, 5));
  };

  const tabs: Tab[] = useMemo(() => [
    {
      id: 'send',
      label: 'Отправить',
      content: (
        <TransactionForm
          balance="1,234.56"
          onSend={handleSend}
          isActive={activeTab === 'send'}
        />
      ),
    },
    {
      id: 'notes',
      label: 'Заметки',
      content: <NotesSection maxNotes={10} isActive={activeTab === 'notes'} />,
    },
    {
      id: 'stats',
      label: 'Статистика',
      content: <StatsSection isActive={activeTab === 'stats'} />,
    },
  ], [activeTab]);

  const TAB_TITLES: Record<string, string> = {
    send: 'Отправить TRX',
    notes: 'Мои заметки',
    stats: 'Обзор',
  };
  const activeTitle = TAB_TITLES[activeTab] ?? 'Wallet';

  return (
    <PageLayout className="gap-6 p-4 sm:p-8">
      {/* Tabs outside the card */}
      <AnimatedTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        transition="fade"
        className="w-full"
        tabListClass="justify-center border-0"
        contentClass="hidden"
      />

      {/* Card with content only */}
      <Card style={themeStore.backgroundStyle} className="w-full border-0">
        <CardHeader>
          <MorphingText
            text={activeTitle}
            morphTime={0.8}
            coolDownTime={0.2}
            className="h-7 sm:h-8 text-lg sm:text-xl"
          />
        </CardHeader>
        <CardContent>
          {/* Animated height container */}
          <animated.div style={{ height: heightSpring.height, overflow: 'hidden' }}>
            {/* Content measurement wrapper */}
            <div ref={contentRef}>
              <AnimatedTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                transition="fade"
                className="w-full"
                tabListClass="hidden"
              />
            </div>
          </animated.div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="w-full bg-zinc-900/30 border-zinc-800/50">
          <CardHeader>
            <p className="text-zinc-400 text-sm font-medium">Последние транзакции</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="size-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-zinc-200 text-sm font-medium">-{tx.amount} TRX</p>
                    <p className="text-zinc-500 text-xs truncate max-w-[150px]">{tx.address}</p>
                  </div>
                </div>
                <p className="text-zinc-600 text-xs">
                  {tx.time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
