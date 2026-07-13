import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PromptCard } from './PromptCard';

describe('PromptCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('hides the speaker button when no audio is available', () => {
    render(<PromptCard audioPath={null} word="khỏe" />);

    expect(
      screen.queryByRole('button', { name: /play pronunciation/i }),
    ).toBeNull();
  });

  it('plays audio on demand when a static file exists', () => {
    render(<PromptCard audioPath="/audio/kh%E1%BB%8Fe.mp3" word="khỏe" />);

    fireEvent.click(
      screen.getByRole('button', { name: /play pronunciation for khỏe/i }),
    );

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it('restores the autoplay preference from local storage', () => {
    window.localStorage.setItem('go-viet-audio-autoplay', 'true');

    render(<PromptCard audioPath="/audio/kh%E1%BB%8Fe.mp3" word="khỏe" />);

    expect(
      screen.getByRole('button', { name: /toggle pronunciation autoplay/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('attempts to autoplay the first loaded word when enabled', () => {
    window.localStorage.setItem('go-viet-audio-autoplay', 'true');

    render(<PromptCard audioPath="/audio/kh%E1%BB%8Fe.mp3" word="khỏe" />);

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it('retries autoplay after interaction when the first refresh attempt is blocked', async () => {
    window.localStorage.setItem('go-viet-audio-autoplay', 'true');
    vi.mocked(HTMLMediaElement.prototype.play)
      .mockRejectedValueOnce(new Error('blocked'))
      .mockResolvedValue(undefined);

    render(<PromptCard audioPath="/audio/kh%E1%BB%8Fe.mp3" word="khỏe" />);

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /toggle pronunciation autoplay/i }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    fireEvent.keyDown(window, { key: 'a' });

    await waitFor(() => {
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    });
  });

  it('can autoplay when a new word appears', () => {
    const { rerender } = render(
      <PromptCard audioPath="/audio/kh%E1%BB%8Fe.mp3" word="khỏe" />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /toggle pronunciation autoplay/i }),
    );

    expect(
      screen.getByRole('button', { name: /toggle pronunciation autoplay/i }),
    ).toHaveAttribute('aria-pressed', 'true');

    vi.mocked(HTMLMediaElement.prototype.play).mockClear();

    rerender(
      <PromptCard audioPath="/audio/c%E1%BA%A3m-%C6%A1n.mp3" word="cảm ơn" />,
    );

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });
});
