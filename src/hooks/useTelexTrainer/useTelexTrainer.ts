import { useEffect, useRef, useState } from 'react';

import { loadTrainerWords } from '../../data/words';
import {
  convertTelex,
  convertVietnameseToTelex,
  matchesVietnameseTarget,
} from '../../lib/telex';

const ADVANCE_DELAY_MS = 650;

type RevealedAnswer = {
  telex: string;
  word: string;
};

function pickNextWord(
  words: string[],
  currentWord: string | null,
): string | null {
  const candidates = words.filter((word) => word !== currentWord);

  if (candidates.length === 0) {
    return currentWord;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);

  return candidates[randomIndex] ?? currentWord;
}

export function useTelexTrainer() {
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [isHintOpen, setIsHintOpen] = useState(true);
  const [revealedAnswer, setRevealedAnswer] = useState<RevealedAnswer | null>(
    null,
  );

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isActive = true;

    void loadTrainerWords()
      .then((loadedWords) => {
        if (!isActive || loadedWords.length === 0) {
          return;
        }

        setWords(loadedWords);
        setCurrentWord(
          (existingWord) => existingWord ?? pickNextWord(loadedWords, null),
        );
      })
      .catch(() => {
        if (!isActive) {
          return;
        }
        setLiveMessage('Word list unavailable.');
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function moveToNextWord() {
    const nextWord = pickNextWord(words, currentWord);

    if (!nextWord) {
      return;
    }

    setCurrentWord(nextWord);
    setInputValue('');
    setRevealedAnswer(null);
  }

  function scheduleAdvance() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      moveToNextWord();
      timeoutRef.current = null;
    }, ADVANCE_DELAY_MS);
  }

  function handleCorrect() {
    if (!currentWord) {
      return;
    }

    setLiveMessage(`Correct: ${currentWord}`);
    scheduleAdvance();
  }

  function registerNonCorrect(status: 'skipped' | 'revealed') {
    if (!currentWord) {
      return;
    }

    if (status === 'revealed') {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setRevealedAnswer({
        telex: convertVietnameseToTelex(currentWord),
        word: currentWord,
      });
      setLiveMessage(`Answer: ${currentWord}`);
    } else {
      setLiveMessage(`Skipped: ${currentWord}`);
      scheduleAdvance();
    }
  }

  function handleInputChange(nextValue: string) {
    if (!currentWord) {
      return;
    }

    const convertedValue = convertTelex(nextValue);

    setInputValue(convertedValue);

    if (matchesVietnameseTarget(convertedValue, currentWord)) {
      handleCorrect();
    }
  }

  function handleSkip() {
    registerNonCorrect('skipped');
  }

  function handleShowAnswer() {
    if (!currentWord) {
      return;
    }

    registerNonCorrect('revealed');
  }

  return {
    currentWord,
    inputValue,
    isHintOpen,
    liveMessage,
    revealedAnswer,
    actions: {
      handleInputChange,
      handleShowAnswer,
      handleSkip,
      toggleHint: () => setIsHintOpen((currentValue) => !currentValue),
    },
  };
}
