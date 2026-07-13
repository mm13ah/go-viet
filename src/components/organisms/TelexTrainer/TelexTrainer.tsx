import { useEffect, useRef } from 'react';

import { useTelexTrainer, useTheme } from '../../../hooks';
import { getAudioPath } from '../../../lib';
import { Button, TextInput } from '../../atoms';
import { HintPanel, PromptCard } from '../../molecules';

export function TelexTrainer() {
  const {
    actions,
    currentWord,
    inputValue,
    isHintOpen,
    liveMessage,
    revealedAnswer,
  } = useTelexTrainer();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWord]);

  if (!currentWord) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-(--gv-gold)">
            Gõ Việt
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-(--gv-heading)">
            Vietnamese Telex trainer
          </h1>
        </header>
        <section className="rounded-[28px] border border-(--gv-border-soft) bg-[linear-gradient(180deg,var(--gv-card-top),var(--gv-card-bottom))] p-6 text-(--gv-copy)">
          Loading words...
        </section>
      </div>
    );
  }

  const currentAudioPath = getAudioPath(currentWord);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div
              aria-label="Vietnamese flag"
              className="relative h-7 w-10 overflow-hidden rounded-md border border-[rgba(255,216,77,0.26)] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              role="img"
            >
              <div className="absolute inset-0 bg-(--gv-red)" />
              <svg
                aria-hidden="true"
                className="absolute inset-0 m-auto h-3.5 w-3.5 text-(--gv-gold)"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="m12 2.8 2.33 6.2 6.61.24-5.21 4.08 1.87 6.35L12 15.98l-5.6 3.7 1.87-6.35-5.2-4.08 6.6-.24L12 2.8Z" />
              </svg>
            </div>
            <p className="text-xs uppercase tracking-[0.34em] text-(--gv-gold)">
              Gõ Việt
            </p>
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-(--gv-heading) sm:text-[2.55rem]">
            Vietnamese Telex trainer
          </h1>
        </div>
        <Button
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="h-13 w-13 rounded-full p-0"
          onClick={toggleTheme}
          variant="secondary"
        >
          {theme === 'dark' ? (
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3v2.25M12 18.75V21M5.64 5.64l1.59 1.59M16.77 16.77l1.59 1.59M3 12h2.25M18.75 12H21M5.64 18.36l1.59-1.59M16.77 7.23l1.59-1.59M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
          )}
        </Button>
      </header>

      <section className="space-y-6 rounded-[30px] border border-(--gv-border-soft) bg-[linear-gradient(180deg,var(--gv-panel-top),var(--gv-panel-bottom))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
        <PromptCard audioPath={currentAudioPath} word={currentWord} />

        <div className="space-y-4">
          <TextInput
            key={currentWord}
            ref={inputRef}
            hint="Examples: khoer or khỏe"
            label="Your answer"
            onChange={(event) => actions.handleInputChange(event.target.value)}
            placeholder="Type your answer"
            value={inputValue}
          />

          {revealedAnswer ? (
            <div className="space-y-1 text-sm text-(--gv-copy-soft)">
              <p>
                Valid answer:{' '}
                <span className="font-medium text-(--gv-heading)">
                  {revealedAnswer.telex}
                </span>
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={actions.handleSkip} variant="secondary">
              Skip
              <span className="text-xs text-(--gv-label)">→</span>
            </Button>
            <Button onClick={actions.handleShowAnswer} variant="ghost">
              Show answer
            </Button>
          </div>
        </div>

        <HintPanel isOpen={isHintOpen} onToggle={actions.toggleHint} />
      </section>

      <p className="text-center text-sm text-(--gv-copy-subtle)">
        Gõ Việt · Learn Telex
      </p>

      <p aria-live="polite" className="sr-only" role="status">
        {liveMessage}
      </p>
    </div>
  );
}
