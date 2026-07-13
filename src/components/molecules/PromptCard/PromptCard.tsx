import { usePromptAudio } from '../../../hooks/usePromptAudio';

type PromptCardProps = {
  audioPath: string | null;
  word: string;
};

export function PromptCard({ audioPath, word }: PromptCardProps) {
  const { isAutoPlayEnabled, playAudio, toggleAutoPlay } = usePromptAudio({
    audioPath,
    word,
  });

  return (
    <section className="rounded-[28px] border border-(--gv-border-soft) bg-[linear-gradient(180deg,var(--gv-card-soft-top),var(--gv-card-soft-bottom))] p-6 shadow-[0_18px_80px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.24em] text-(--gv-label)">
        Type this
      </p>
      <div className="mt-5 flex items-center gap-5">
        {audioPath ? (
          <button
            aria-label={`Play pronunciation for ${word}`}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-(--gv-border-audio) bg-(--gv-audio-bg) text-(--gv-copy) transition-colors hover:border-[rgba(255,216,77,0.55)] hover:text-(--gv-heading) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--gv-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--gv-ring-offset) cursor-pointer"
            onClick={playAudio}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 9v6h4l5 4V5l-5 4H5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <path
                d="M17 9.5a4 4 0 0 1 0 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight text-(--gv-heading) sm:text-6xl">
            {word}
          </h1>
          {audioPath ? (
            <button
              aria-label="Toggle pronunciation autoplay"
              aria-pressed={isAutoPlayEnabled}
              className={[
                'rounded-full border px-3 py-2 text-xs uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--gv-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--gv-ring-offset)',
                isAutoPlayEnabled
                  ? 'border-(--gv-border-strong) bg-(--gv-audio-toggle-on) text-(--gv-heading)'
                  : 'border-(--gv-border) bg-(--gv-audio-toggle-off) text-(--gv-label)',
              ].join(' ')}
              onClick={toggleAutoPlay}
              type="button"
            >
              Auto play {isAutoPlayEnabled ? 'on' : 'off'}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
