import { createRef } from 'react';

import { render, screen } from '@testing-library/react';

import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('associates its label and hint with the input', () => {
    render(<TextInput hint="Use raw Telex" label="Your answer" />);

    const input = screen.getByLabelText('Your answer');
    const hint = screen.getByText('Use raw Telex');
    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput ref={ref} label="Your answer" />);

    expect(ref.current).toBe(screen.getByLabelText('Your answer'));
  });
});
