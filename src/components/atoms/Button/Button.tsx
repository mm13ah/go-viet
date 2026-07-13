import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'border border-(--gv-border-strong) bg-[linear-gradient(180deg,rgba(255,216,77,0.32),rgba(214,31,44,0.32))] text-(--gv-heading) hover:border-[color:rgba(255,227,140,0.6)] hover:bg-[linear-gradient(180deg,rgba(255,220,97,0.42),rgba(214,31,44,0.42))]',
  secondary:
    'border border-(--gv-border) bg-(--gv-surface-button) text-(--gv-copy) hover:border-[color:rgba(255,216,77,0.3)] hover:bg-(--gv-surface-button-hover)',
  ghost:
    'border border-[color:rgba(255,191,63,0.28)] bg-(--gv-surface-ghost) text-(--gv-gold) hover:bg-(--gv-surface-ghost-hover)',
};

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors motion-reduce:transition-none focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-(--gv-gold) focus-visible:ring-offset-2',
        'focus-visible:ring-offset-(--gv-ring-offset) disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_STYLES[variant],
        className,
      ].join(' ')}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
