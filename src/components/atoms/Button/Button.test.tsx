import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
  it('renders its label and handles clicks', async () => {
    const onClick = vi.fn<() => void>();
    render(<Button onClick={onClick}>Continue</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('defaults to a non-submitting button', () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
