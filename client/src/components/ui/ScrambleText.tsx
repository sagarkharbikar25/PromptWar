import React, { useEffect, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  className?: string;
}

const CHARS = '0123456789ABCDEF!@#$%&*';

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  duration = 600,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    const stepIncrement = text.length / totalSteps;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += stepIncrement;
    }, intervalTime);

    return () => clearInterval(interval);
  }, [text, duration]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
};

