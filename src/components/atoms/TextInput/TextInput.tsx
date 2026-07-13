import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hint?: string;
  label: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ hint, id, label, className = '', ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;

    return (
      <div className="space-y-2">
        <label
          className="text-sm font-medium tracking-wide text-(--gv-copy)"
          htmlFor={inputId}
        >
          {label}
        </label>
        <input
          ref={ref}
          aria-describedby={hint ? hintId : undefined}
          autoCapitalize="off"
          autoCorrect="off"
          className={[
            'w-full rounded-3xl border border-(--gv-border-strong) bg-(--gv-input-bg) px-5 py-4 text-lg',
            'text-[#fff2d9] shadow-[0_0_0_1px_rgba(255,216,77,0.08),0_0_0_4px_rgba(255,191,63,0.05)] outline-none',
            'text-(--gv-input-text) placeholder:text-(--gv-input-placeholder)',
            'focus-visible:border-(--gv-gold) focus-visible:ring-2 focus-visible:ring-[rgba(255,212,74,0.7)]',
            className,
          ].join(' ')}
          id={inputId}
          spellCheck={false}
          {...props}
        />
        {hint ? (
          <p className="text-sm text-(--gv-copy-muted)" id={hintId}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
