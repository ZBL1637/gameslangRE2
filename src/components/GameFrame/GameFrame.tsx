import React from 'react';
import './GameFrame.scss';

interface GameFrameProps {
  children: React.ReactNode;
}

export const GameFrame: React.FC<GameFrameProps> = ({ children }) => {
  return (
    <div className="game-frame-container">
      <div className="game-frame-screen">
        {/* 屏幕内容 */}
        <div className="screen-content">
          {children}
        </div>
      </div>
    </div>
  );
};
