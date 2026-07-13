import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

vi.mock('../data/words', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/words')>();

  return {
    ...actual,
    loadTrainerWords: vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValue(['khỏe', 'cảm ơn', 'đẹp']),
  };
});

function setup() {
  const user = userEvent.setup();

  render(<App />);

  return {
    input: screen.findByLabelText(/your answer/i),
    user,
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts raw telex input', async () => {
    const { input, user } = setup();

    await user.type(await input, 'khoer');

    expect(await input).toHaveValue('khỏe');
    expect(
      await screen.findByRole('heading', { name: 'cảm ơn' }),
    ).toBeVisible();
  });

  it('composes ngoary as ngoảy in the input', async () => {
    const { input, user } = setup();

    await user.type(await input, 'ngoary');

    expect(await input).toHaveValue('ngoảy');
  });

  it('picks a random first word on load', async () => {
    vi.mocked(Math.random).mockReturnValue(0.8);

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'đẹp' })).toBeVisible();
  });

  it('accepts composed Vietnamese input', async () => {
    const { input, user } = setup();

    await user.type(await input, 'khỏe');

    expect(
      await screen.findByRole('heading', { name: 'cảm ơn' }),
    ).toBeVisible();
  });

  it('does not advance on incorrect input', async () => {
    const { input, user } = setup();

    await user.type(await input, 'sai');

    expect(screen.getByRole('heading', { name: 'khỏe' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'cảm ơn' }),
    ).not.toBeInTheDocument();
  });

  it('advances to the next word after a correct answer', async () => {
    const { input, user } = setup();

    await user.type(await input, 'khoer');

    expect(
      await screen.findByRole('heading', { name: 'cảm ơn' }),
    ).toBeVisible();
  });

  it('recreates the input element when moving to the next word', async () => {
    const { input, user } = setup();
    const initialInput = await input;

    await user.type(initialInput, 'khoer');

    expect(
      await screen.findByRole('heading', { name: 'cảm ơn' }),
    ).toBeVisible();

    const nextInput = await screen.findByLabelText(/your answer/i);

    expect(nextInput).not.toBe(initialInput);
    expect(nextInput).toHaveValue('');
  });

  it('shows the hint panel', async () => {
    const { input } = setup();

    await input;

    expect(screen.getByText('aa → â')).toBeVisible();
  });

  it('shows the answer without advancing to the next word', async () => {
    const { input, user } = setup();

    await input;
    await user.click(screen.getByRole('button', { name: /show answer/i }));

    expect(screen.getByRole('heading', { name: 'khỏe' })).toBeVisible();
    expect(screen.getByText(/valid answer:/i)).toBeVisible();
    expect(screen.getByText('khoer')).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'cảm ơn' }),
    ).not.toBeInTheDocument();
  });
});
