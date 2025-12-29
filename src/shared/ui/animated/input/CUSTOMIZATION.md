# AnimatedInput Customization Guide

Руководство по кастомизации AnimatedInput для разных сценариев использования.

## Архитектура

```
AnimatedInputController (MobX + React Spring)
├── animated-input.config.ts  — состояния, пружины, константы
├── AnimatedInputController.ts — логика и анимации
└── AnimatedInput.tsx — React компонент
```

---

## 1. Простая кастомизация — через пропсы

Для базовых изменений (цвета, тексты) используй пропсы компонента:

```tsx
import { AnimatedInput } from 'shared/ui';

// Поисковый инпут
<AnimatedInput
  placeholders={['Поиск...', 'Найти товар...', 'Что ищете?']}
  spotlightColor="rgba(59, 130, 246, 0.5)"
  spotlightRadius={100}
  onSubmit={handleSearch}
/>

// Чат инпут
<AnimatedInput
  placeholder="Напишите сообщение..."
  spotlightColor="rgba(16, 185, 129, 0.5)"
  particleColor="#10b981"
  showSubmitButton={true}
  onSubmit={sendMessage}
/>
```

---

## 2. Пресеты — конфиги для типовых сценариев

Создай файл с настройками для повторного использования:

```typescript
// features/search/config/search-input.config.ts

import type { AnimatedInputController } from 'shared/ui';

/** Опции для поискового инпута */
export const SEARCH_INPUT_OPTIONS = {
  placeholders: [
    'Поиск...',
    'Найти товар...',
    'Что ищете?',
  ],
  spotlightColor: 'rgba(59, 130, 246, 0.5)',
  spotlightRadius: 100,
} as const;

/** Фабрика для создания контроллера */
export const createSearchInputController = () =>
  new AnimatedInputController(SEARCH_INPUT_OPTIONS);
```

Использование:

```tsx
// features/search/ui/SearchInput.tsx

import { AnimatedInput, type AnimatedInputRef } from 'shared/ui';
import { SEARCH_INPUT_OPTIONS } from '../config/search-input.config';

export const SearchInput = ({ onSearch }: { onSearch: (q: string) => void }) => {
  const ref = useRef<AnimatedInputRef>(null);

  return (
    <AnimatedInput
      ref={ref}
      {...SEARCH_INPUT_OPTIONS}
      onSubmit={onSearch}
    />
  );
};
```

---

## 3. Наследование — для изменения поведения

Когда нужна дополнительная логика, наследуй контроллер:

```typescript
// features/chat/model/ChatInputController.ts

import { makeObservable, observable, action } from 'mobx';
import { AnimatedInputController } from 'shared/ui';

export class ChatInputController extends AnimatedInputController {
  // ─────────────────────────────────────────────────────────────────────────
  // Дополнительное состояние
  // ─────────────────────────────────────────────────────────────────────────

  isTyping = false;
  mentionSuggestions: string[] = [];

  constructor() {
    super({
      placeholders: ['Напишите сообщение...'],
      spotlightColor: 'rgba(16, 185, 129, 0.5)',
      particleColor: '#10b981',
    });

    makeObservable(this, {
      isTyping: observable,
      mentionSuggestions: observable,
      setTyping: action,
      checkMentions: action,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Переопределение методов
  // ─────────────────────────────────────────────────────────────────────────

  override setValue(value: string) {
    super.setValue(value);
    this.checkMentions(value);
    this.setTyping(value.length > 0);
  }

  override async submit(onSubmit?: (value: string) => void) {
    this.setTyping(false);
    await super.submit(onSubmit);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Новые методы
  // ─────────────────────────────────────────────────────────────────────────

  setTyping(typing: boolean) {
    this.isTyping = typing;
  }

  checkMentions(value: string) {
    const match = value.match(/@(\w*)$/);
    if (match) {
      // Загрузить suggestions...
      this.mentionSuggestions = ['@user1', '@user2'];
    } else {
      this.mentionSuggestions = [];
    }
  }
}
```

Использование в компоненте:

```tsx
// features/chat/ui/ChatInput.tsx

import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { animated } from '@react-spring/web';
import { ChatInputController } from '../model/ChatInputController';

export const ChatInput = observer(({ onSend }: { onSend: (msg: string) => void }) => {
  const ctrlRef = useRef<ChatInputController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new ChatInputController();
  }
  const ctrl = ctrlRef.current;

  useEffect(() => {
    ctrl.startPlaceholderRotation();
    return () => ctrl.dispose();
  }, [ctrl]);

  return (
    <div className="relative">
      {/* Typing indicator */}
      {ctrl.isTyping && (
        <div className="absolute -top-6 left-4 text-xs text-zinc-500">
          Печатает...
        </div>
      )}

      {/* Mention suggestions */}
      {ctrl.mentionSuggestions.length > 0 && (
        <div className="absolute -top-20 left-0 bg-zinc-800 rounded-lg p-2">
          {ctrl.mentionSuggestions.map((s) => (
            <div key={s} className="px-2 py-1 hover:bg-zinc-700 cursor-pointer">
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); ctrl.submit(onSend); }}>
        <animated.div
          ref={(el) => { ctrl.containerElement = el; }}
          className="relative h-12 rounded-full overflow-hidden p-[2px]"
          style={{ background: ctrl.spotlightBackground }}
          onMouseEnter={ctrl.onMouseEnter}
          onMouseLeave={ctrl.onMouseLeave}
          onMouseMove={(e) => ctrl.onMouseMove(e.clientX, e.clientY)}
        >
          <animated.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: ctrl.focusBoxShadow }}
          />

          <div className="relative size-full rounded-full bg-zinc-900 border border-zinc-800">
            <input
              ref={(el) => { ctrl.inputElement = el; }}
              value={ctrl.value}
              onChange={(e) => ctrl.setValue(e.target.value)}
              onFocus={() => ctrl.onFocus()}
              onBlur={() => ctrl.onBlur()}
              className="size-full rounded-full bg-transparent px-6 text-zinc-100 focus:outline-none"
            />
          </div>
        </animated.div>
      </form>
    </div>
  );
});
```

---

## 4. Кастомный конфиг — для изменения анимаций

Для глубокой кастомизации анимаций создай свой конфиг:

```typescript
// features/premium/config/premium-input.config.ts

import type { SpringConfig } from '@react-spring/web';
import {
  INPUT_IDLE,
  INPUT_FOCUSED,
  INPUT_BLURRED,
  type AnimatedInputState,
} from 'shared/ui/animated/input/animated-input.config';

// ============================================================================
// Кастомные пружины
// ============================================================================

/** Более упругая пружина для premium эффекта */
export const premiumSpring: SpringConfig = {
  tension: 200,
  friction: 18,
};

/** Мягкая пружина для свечения */
export const premiumGlowSpring: SpringConfig = {
  tension: 120,
  friction: 14,
};

// ============================================================================
// Кастомные состояния
// ============================================================================

export const PREMIUM_IDLE: AnimatedInputState = {
  ...INPUT_IDLE,
  borderOpacity: 0.5,      // Ярче бордер в покое
};

export const PREMIUM_FOCUSED: Partial<AnimatedInputState> = {
  ...INPUT_FOCUSED,
  shadowSpread: 16,        // Больше свечение
  borderOpacity: 1,
};

export const PREMIUM_BLURRED: Partial<AnimatedInputState> = {
  ...INPUT_BLURRED,
  borderOpacity: 0.5,
};

// ============================================================================
// Кастомные цвета
// ============================================================================

export const PREMIUM_SPOTLIGHT_COLOR = 'rgba(168, 85, 247, 0.5)';  // Фиолетовый
export const PREMIUM_SHADOW_COLOR = 'rgba(168, 85, 247, 0.4)';
export const PREMIUM_PARTICLE_COLOR = '#a855f7';
```

Контроллер с кастомным конфигом:

```typescript
// features/premium/model/PremiumInputController.ts

import { to } from '@react-spring/core';
import { AnimatedInputController } from 'shared/ui';
import {
  premiumSpring,
  premiumGlowSpring,
  PREMIUM_IDLE,
  PREMIUM_FOCUSED,
  PREMIUM_BLURRED,
  PREMIUM_SPOTLIGHT_COLOR,
  PREMIUM_SHADOW_COLOR,
  PREMIUM_PARTICLE_COLOR,
} from '../config/premium-input.config';

export class PremiumInputController extends AnimatedInputController {
  constructor(options: { placeholders?: string[] } = {}) {
    super({
      ...options,
      spotlightColor: PREMIUM_SPOTLIGHT_COLOR,
      particleColor: PREMIUM_PARTICLE_COLOR,
    });

    // Переинициализируем с кастомным idle состоянием
    this.ctrl.set(PREMIUM_IDLE);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Переопределяем анимации фокуса
  // ─────────────────────────────────────────────────────────────────────────

  override onFocus() {
    this.isFocused = true;
    this.ctrl.start({
      ...PREMIUM_FOCUSED,
      config: premiumSpring,
    });
  }

  override onBlur() {
    this.isFocused = false;
    this.ctrl.start({
      ...PREMIUM_BLURRED,
      config: premiumGlowSpring,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Кастомный box-shadow с другим цветом
  // ─────────────────────────────────────────────────────────────────────────

  override get focusBoxShadow() {
    return to(
      [this.ctrl.springs.shadowSpread, this.ctrl.springs.borderOpacity],
      (spread, opacity) =>
        `0 0 ${spread}px ${spread / 2}px ${PREMIUM_SHADOW_COLOR.replace('0.4', String(opacity * 0.4))}`
    );
  }
}
```

---

## Структура файлов

```
src/
├── shared/
│   └── ui/
│       └── animated/
│           └── input/
│               ├── animated-input.config.ts     # Базовый конфиг
│               ├── AnimatedInputController.ts   # Базовый контроллер
│               ├── AnimatedInput.tsx            # Компонент
│               └── CUSTOMIZATION.md             # Эта документация
│
└── features/
    ├── search/
    │   ├── config/
    │   │   └── search-input.config.ts           # Пресет настроек
    │   └── ui/
    │       └── SearchInput.tsx                  # Компонент-обёртка
    │
    ├── chat/
    │   ├── config/
    │   │   └── chat-input.config.ts
    │   └── model/
    │       └── ChatInputController.ts           # Наследник с typing
    │
    └── premium/
        ├── config/
        │   └── premium-input.config.ts          # Кастомные анимации
        └── model/
            └── PremiumInputController.ts        # Кастомный контроллер
```

---

## Когда что использовать

| Сценарий | Подход |
|----------|--------|
| Изменить цвета, тексты | Пропсы компонента |
| Типовые настройки для фичи | Пресет (config file) |
| Добавить логику (typing, mentions) | Наследование контроллера |
| Изменить анимации, пружины | Кастомный конфиг + контроллер |

---

## Пример: SearchInput

Полный пример поискового инпута:

```typescript
// features/search/config/search-input.config.ts

export const SEARCH_PLACEHOLDERS = [
  'Поиск...',
  'Найти товар...',
  'Что ищете?',
];

export const SEARCH_INPUT_PROPS = {
  placeholders: SEARCH_PLACEHOLDERS,
  spotlightColor: 'rgba(59, 130, 246, 0.5)',
  spotlightRadius: 100,
  showSubmitButton: true,
} as const;
```

```tsx
// features/search/ui/SearchInput.tsx

import { forwardRef } from 'react';
import { AnimatedInput, type AnimatedInputRef, type AnimatedInputProps } from 'shared/ui';
import { SEARCH_INPUT_PROPS } from '../config/search-input.config';

interface SearchInputProps extends Omit<AnimatedInputProps, keyof typeof SEARCH_INPUT_PROPS> {
  onSearch: (query: string) => void;
}

export const SearchInput = forwardRef<AnimatedInputRef, SearchInputProps>(
  ({ onSearch, ...props }, ref) => (
    <AnimatedInput
      ref={ref}
      {...SEARCH_INPUT_PROPS}
      {...props}
      onSubmit={onSearch}
    />
  )
);

SearchInput.displayName = 'SearchInput';
```

```tsx
// Использование
import { SearchInput } from 'features/search';

<SearchInput onSearch={(q) => console.log('Search:', q)} />
```
