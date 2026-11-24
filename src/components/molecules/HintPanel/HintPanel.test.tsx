import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HintPanel } from './HintPanel';

describe('HintPanel', () => {
  it('hides the cheat sheet when closed', () => {
    render(<HintPanel isOpen={false} onToggle={vi.fn<() => void>()} />);

    expect(screen.queryByText('aa → â')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('shows the cheat sheet and handles toggling', async () => {
    const onToggle = vi.fn<() => void>();
    render(<HintPanel isOpen onToggle={onToggle} />);

    expect(screen.getByText('aa → â')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
