import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TelexTrainer } from './TelexTrainer';

const mocks = vi.hoisted(() => ({
  handleInputChange: vi.fn<(value: string) => void>(),
  handleShowAnswer: vi.fn<() => void>(),
  handleSkip: vi.fn<() => void>(),
  toggleHint: vi.fn<() => void>(),
  toggleTheme: vi.fn<() => void>(),
}));

vi.mock('../../../hooks', () => ({
  useTelexTrainer: () => ({
    actions: {
      handleInputChange: mocks.handleInputChange,
      handleShowAnswer: mocks.handleShowAnswer,
      handleSkip: mocks.handleSkip,
      toggleHint: mocks.toggleHint,
    },
    currentWord: 'khỏe',
    inputValue: '',
    isHintOpen: false,
    liveMessage: '',
    revealedAnswer: null,
  }),
  useTheme: () => ({ theme: 'dark', toggleTheme: mocks.toggleTheme }),
}));

vi.mock('../../../lib', () => ({
  getAudioPath: () => null,
}));

describe('TelexTrainer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the current prompt and delegates trainer actions', async () => {
    render(<TelexTrainer />);

    expect(screen.getByRole('heading', { name: 'khỏe' })).toBeVisible();
    expect(screen.getByLabelText('Your answer')).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(mocks.handleSkip).toHaveBeenCalledOnce();
  });

  it('delegates theme changes', async () => {
    render(<TelexTrainer />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    );
    expect(mocks.toggleTheme).toHaveBeenCalledOnce();
  });
});
