import { useState } from 'react';
import { useTrail, animated } from '@react-spring/web';
import { observer } from 'mobx-react-lite';
import { AnimatedInput, AnimatedInputController, AnimatedList } from 'shared/ui';
import { themeStore } from 'shared/model';
import { MESSAGE_INPUT_PROPS } from '../config';

// ============================================================================
// Controller (module-level singleton)
// ============================================================================

const noteInputCtrl = new AnimatedInputController(MESSAGE_INPUT_PROPS);

// ============================================================================
// Types
// ============================================================================

interface Note {
  id: string;
  text: string;
  timestamp: Date;
}

interface NotesSectionProps {
  maxNotes?: number;
  /** Trigger entrance animation */
  isActive?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const NotesSection = observer(({
  maxNotes = 5,
  isActive = true,
}: NotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'Оплата за подписку', timestamp: new Date(Date.now() - 3600000) },
    { id: '2', text: 'Перевод от @alex', timestamp: new Date(Date.now() - 7200000) },
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // Trail animation for section elements (2 items: list, input)
  // ─────────────────────────────────────────────────────────────────────────

  const trail = useTrail(2, {
    from: { opacity: 0, y: 20 },
    to: {
      opacity: isActive ? 1 : 0,
      y: isActive ? 0 : 20,
    },
    config: themeStore.springConfig,
    delay: 50,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddNote = (text: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text,
      timestamp: new Date(),
    };

    setNotes((prev) => [newNote, ...prev].slice(0, maxNotes));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">
      {/* Notes List */}
      <animated.div
        style={{
          opacity: trail[0]?.opacity,
          transform: trail[0]?.y.to(y => `translateY(${y}px)`),
        }}
        className="bg-zinc-900/50 rounded-2xl p-4 min-h-[120px]"
      >
        {notes.length === 0 ? (
          <p className="text-zinc-600 text-center py-4">Нет заметок</p>
        ) : (
          <AnimatedList
            items={notes}
            keyExtractor={(note) => note.id}
            staggerDelay={80}
            animation="slideUp"
            renderItem={(note) => (
              <div className="flex items-start gap-3 py-2 border-b border-zinc-800 last:border-0">
                <div className="size-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm truncate">{note.text}</p>
                  <p className="text-zinc-600 text-xs">{formatTime(note.timestamp)}</p>
                </div>
              </div>
            )}
          />
        )}
      </animated.div>

      {/* Add Note Input */}
      <animated.div
        style={{
          opacity: trail[1]?.opacity,
          transform: trail[1]?.y.to(y => `translateY(${y}px)`),
        }}
      >
        <AnimatedInput
          controller={noteInputCtrl}
          onSubmit={handleAddNote}
        />
      </animated.div>
    </div>
  );
});

NotesSection.displayName = 'NotesSection';
