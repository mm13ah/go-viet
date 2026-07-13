import { telexCheatSheet } from '../../../data/telexCheatSheet';
import { Button } from '../../atoms';

type HintPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function HintPanel({ isOpen, onToggle }: HintPanelProps) {
  return (
    <section className="rounded-[26px] border border-(--gv-border-soft) bg-[linear-gradient(180deg,var(--gv-card-subtle-top),var(--gv-card-subtle-bottom))] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-(--gv-label-soft)">
            Telex cheat sheet
          </p>
        </div>
        <Button
          aria-expanded={isOpen}
          aria-controls="hint-panel"
          onClick={onToggle}
          variant="secondary"
        >
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>
      {isOpen ? (
        <div className="mt-4 space-y-4" id="hint-panel">
          <div className="grid gap-3 lg:grid-cols-3">
            {telexCheatSheet.map((group) => (
              <section
                className="rounded-2xl border border-(--gv-border-faint) bg-(--gv-surface) p-4"
                key={group.title}
              >
                <h3 className="text-xs uppercase tracking-[0.2em] text-(--gv-gold)">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-(--gv-copy)">
                  {group.items.map((item) => (
                    <li className="leading-6" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="rounded-2xl border border-(--gv-border-faint) bg-(--gv-surface-alt) px-4 py-3 text-sm text-(--gv-tip)">
            Tip: If a word looks wrong halfway through, keep typing. The tone
            may move once the full syllable is complete.
          </div>
        </div>
      ) : null}
    </section>
  );
}
