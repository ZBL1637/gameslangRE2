import React, { useState, useEffect, useRef } from 'react';
import './PixelDialogBox.scss';

interface PixelDialogBoxProps {
  text: string;
  speaker?: string;
  avatar?: string;
  onComplete?: () => void;
  onNext?: () => void;
  speed?: number; // ms per char
}

export const PixelDialogBox: React.FC<PixelDialogBoxProps> = ({ 
  text, 
  speaker,
  // avatar,
  onComplete,
  onNext,
  speed = 30 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      index++;
      setDisplayedText(text.substring(0, index));
      
      if (index >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, onComplete]);

  const handleInteract = () => {
    if (isTyping) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsTyping(false);
      if (onComplete) onComplete();
    } else {
      if (onNext) onNext();
    }
  };

  return (
    <div className={`pixel-dialog-box`} onClick={handleInteract}>
      <div className="pixel-dialog-border">
        <div className="pixel-dialog-content">
          <div className="pixel-dialog-body">
            {speaker && (
              <div className="pixel-dialog-speaker">
                <span className="speaker-bracket">[</span>
                <span className="speaker-name">{speaker}</span>
                <span className="speaker-bracket">]</span>
              </div>
            )}
            <div className="pixel-dialog-text">
              {displayedText}
              <span className={`cursor-block ${!isTyping ? 'blink' : ''}`}>_</span>
            </div>
          </div>
          {!isTyping && (
            <div className="pixel-dialog-arrow">▼</div>
          )}
        </div>
      </div>
    </div>
  );
};
