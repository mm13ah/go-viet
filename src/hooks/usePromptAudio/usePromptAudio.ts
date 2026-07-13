import { useEffect, useRef, useState } from 'react';

const AUDIO_AUTOPLAY_STORAGE_KEY = 'go-viet-audio-autoplay';

type UsePromptAudioOptions = {
  audioPath: string | null;
  word: string;
};

type UsePromptAudioResult = {
  isAutoPlayEnabled: boolean;
  playAudio: () => void;
  toggleAutoPlay: () => void;
};

function createAudio(
  currentAudio: HTMLAudioElement | null,
  audioPath: string,
): HTMLAudioElement {
  const nextAudioUrl = new URL(audioPath, window.location.href).href;

  if (currentAudio?.src === nextAudioUrl) {
    return currentAudio;
  }

  return new Audio(audioPath);
}

function playAudioFile(
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  audioPath: string,
): Promise<boolean> {
  const audio = createAudio(audioRef.current, audioPath);

  audio.currentTime = 0;
  audioRef.current = audio;

  return audio
    .play()
    .then(() => true)
    .catch(() => false);
}

function clearRetryListeners(retryAutoPlay: () => void) {
  window.removeEventListener('focus', retryAutoPlay);
  window.removeEventListener('keydown', retryAutoPlay);
  window.removeEventListener('pointerdown', retryAutoPlay);
  document.removeEventListener('visibilitychange', retryAutoPlay);
}

export function usePromptAudio({
  audioPath,
  word,
}: UsePromptAudioOptions): UsePromptAudioResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousWordRef = useRef<string | null>(null);
  const [pendingAutoPlayWord, setPendingAutoPlayWord] = useState<string | null>(
    null,
  );
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.localStorage.getItem(AUDIO_AUTOPLAY_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPendingAutoPlayWord(null);
  }, [audioPath]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(
        AUDIO_AUTOPLAY_STORAGE_KEY,
        String(isAutoPlayEnabled),
      );
    } catch {
      // Ignore storage failures and keep the toggle usable.
    }
  }, [isAutoPlayEnabled]);

  useEffect(() => {
    const previousWord = previousWordRef.current;
    previousWordRef.current = word;

    if (!audioPath || !isAutoPlayEnabled) {
      setPendingAutoPlayWord(null);
      return;
    }

    if (previousWord !== word) {
      setPendingAutoPlayWord(word);
    }
  }, [audioPath, isAutoPlayEnabled, word]);

  useEffect(() => {
    if (!audioPath || !isAutoPlayEnabled || pendingAutoPlayWord !== word) {
      return;
    }

    const currentAudioPath = audioPath;
    let isDisposed = false;

    function retryAutoPlay() {
      if (document.visibilityState === 'hidden') {
        return;
      }

      void playAudioFile(audioRef, currentAudioPath).then((didPlay) => {
        if (isDisposed) {
          return;
        }

        if (didPlay) {
          clearRetryListeners(retryAutoPlay);
        }

        setPendingAutoPlayWord(didPlay ? null : word);
      });
    }

    window.addEventListener('focus', retryAutoPlay);
    window.addEventListener('keydown', retryAutoPlay);
    window.addEventListener('pointerdown', retryAutoPlay);
    document.addEventListener('visibilitychange', retryAutoPlay);
    retryAutoPlay();

    return () => {
      isDisposed = true;
      clearRetryListeners(retryAutoPlay);
    };
  }, [audioPath, isAutoPlayEnabled, pendingAutoPlayWord, word]);

  return {
    isAutoPlayEnabled,
    playAudio: () => {
      if (!audioPath) {
        return;
      }

      void playAudioFile(audioRef, audioPath);
    },
    toggleAutoPlay: () => {
      const nextValue = !isAutoPlayEnabled;

      setIsAutoPlayEnabled(nextValue);

      if (!nextValue || !audioPath) {
        setPendingAutoPlayWord(null);
        return;
      }

      setPendingAutoPlayWord(word);
    },
  };
}
