import React, { useState, useEffect } from 'react';

interface AnimatedTypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export const AnimatedTypewriter: React.FC<AnimatedTypewriterProps> = ({
  words,
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 2200,
  className = '',
  cursorClassName = 'bg-[#F7A914] dark:bg-[#F7A914]',
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset text index if words change (e.g. language toggle)
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentText('');
    setIsDeleting(false);
  }, [JSON.stringify(words)]);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const targetWord = words[currentWordIndex] || '';

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // Writing mode
          if (currentText.length < targetWord.length) {
            setCurrentText(targetWord.slice(0, currentText.length + 1));
          } else {
            // Reached full word, pause before deleting
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting mode
          if (currentText.length > 0) {
            setCurrentText(targetWord.slice(0, currentText.length - 1));
          } else {
            // Reached empty, advance to next word
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span
        className={`inline-block w-[3px] h-[1.15em] ml-1 rounded-full animate-blink-cursor align-middle shadow-xs ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
};
