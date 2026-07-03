import React, { useEffect, useState, useRef } from 'react';

// --- Constants ---
export const SPRITE_SIZE = 32;
export const SCALE = 2; // Pixel scale for map sprites.
export const FRAMES_PER_ROW = 6;
export const IDLE_FRAME = 0;
export const ANIMATION_SPEED = 100;

export enum Direction {
  DOWN = 0,
  RIGHT = 1,
  LEFT = 2,
  UP = 3,
}

export const DIRECTION_ROW_MAP: Record<Direction, number> = {
  [Direction.DOWN]: 0,
  [Direction.RIGHT]: 1,
  [Direction.LEFT]: 2,
  [Direction.UP]: 3,
};

// --- Helper: Generate Placeholder Sprite ---
export const generatePlaceholderSpriteSheet = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE * FRAMES_PER_ROW;
  canvas.height = SPRITE_SIZE * 4;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };

  for (let row = 0; row < 4; row++) {
    for (let frame = 0; frame < FRAMES_PER_ROW; frame++) {
      const x = frame * SPRITE_SIZE;
      const y = row * SPRITE_SIZE;

      const cx = x + SPRITE_SIZE / 2;
      const cy = y + SPRITE_SIZE / 2 + 1;

      ctx.clearRect(x, y, SPRITE_SIZE, SPRITE_SIZE);

      const step = frame % 3;
      const bob = frame % 2 === 0 ? 0 : 1;
      const leftStep = step === 1 ? -1 : step === 2 ? 1 : 0;
      const rightStep = step === 1 ? 1 : step === 2 ? -1 : 0;

      const outline = '#1f1f2e';
      const hair = '#3b2b20';
      const skin = '#f3b982';
      const skinShadow = '#d4875f';
      const scarf = '#f6c75e';
      const coat = '#19686c';
      const coatDark = '#0f3f4b';
      const cloak = '#3b2f5f';
      const pants = '#243447';
      const boot = '#171820';

      const drawFrontBackBody = (isBack = false) => {
        drawPixel(cx - 8, cy - 14 + bob, 16, 7, outline);
        drawPixel(cx - 7, cy - 15 + bob, 14, 4, hair);
        drawPixel(cx - 6, cy - 11 + bob, 12, 8, outline);
        drawPixel(cx - 5, cy - 10 + bob, 10, 7, isBack ? hair : skin);
        if (!isBack) {
          drawPixel(cx - 4, cy - 7 + bob, 2, 2, outline);
          drawPixel(cx + 2, cy - 7 + bob, 2, 2, outline);
          drawPixel(cx - 2, cy - 3 + bob, 4, 1, skinShadow);
        }

        drawPixel(cx - 8, cy - 2 + bob, 16, 13, outline);
        drawPixel(cx - 6, cy - 1 + bob, 12, 11, coat);
        drawPixel(cx - 5, cy + 1 + bob, 10, 2, scarf);
        drawPixel(cx - 1, cy + 2 + bob, 2, 8, coatDark);
        drawPixel(cx - 10, cy + bob, 4, 10, outline);
        drawPixel(cx + 6, cy + bob, 4, 10, outline);
        drawPixel(cx - 9, cy + 1 + bob, 3, 8, cloak);
        drawPixel(cx + 6, cy + 1 + bob, 3, 8, cloak);

        drawPixel(cx - 6, cy + 10 + bob, 5, 7 + rightStep, outline);
        drawPixel(cx + 1, cy + 10 + bob, 5, 7 + leftStep, outline);
        drawPixel(cx - 5, cy + 10 + bob, 3, 6 + rightStep, pants);
        drawPixel(cx + 2, cy + 10 + bob, 3, 6 + leftStep, pants);
        drawPixel(cx - 6, cy + 16 + bob + rightStep, 5, 3, boot);
        drawPixel(cx + 1, cy + 16 + bob + leftStep, 5, 3, boot);
      };

      const drawSideBody = (facingRight: boolean) => {
        const dir = facingRight ? 1 : -1;
        drawPixel(cx - 7, cy - 14 + bob, 14, 7, outline);
        drawPixel(cx - 6, cy - 15 + bob, 12, 4, hair);
        drawPixel(cx - 6, cy - 10 + bob, 12, 8, outline);
        drawPixel(cx - 5, cy - 9 + bob, 10, 7, skin);
        drawPixel(cx + dir * 3, cy - 7 + bob, 2, 2, outline);
        drawPixel(cx + dir * 5, cy - 6 + bob, 2, 2, skinShadow);

        drawPixel(cx - 8, cy - 2 + bob, 16, 13, outline);
        drawPixel(cx - 6, cy - 1 + bob, 12, 11, coat);
        drawPixel(cx - 4, cy + 1 + bob, 8, 2, scarf);
        drawPixel(cx - dir * 8, cy + bob, 5, 11, cloak);
        drawPixel(cx + dir * 5, cy + 1 + bob, 4, 9, outline);
        drawPixel(cx + dir * 5, cy + 2 + bob, 3, 7, coatDark);

        drawPixel(cx - 5, cy + 10 + bob, 5, 7 + leftStep, outline);
        drawPixel(cx + 1, cy + 10 + bob, 5, 7 + rightStep, outline);
        drawPixel(cx - 4, cy + 10 + bob, 3, 6 + leftStep, pants);
        drawPixel(cx + 2, cy + 10 + bob, 3, 6 + rightStep, pants);
        drawPixel(cx - 5, cy + 16 + bob + leftStep, 5, 3, boot);
        drawPixel(cx + 1, cy + 16 + bob + rightStep, 5, 3, boot);
      };

      if (row === Direction.DOWN) drawFrontBackBody(false);
      if (row === Direction.RIGHT) drawSideBody(true);
      if (row === Direction.LEFT) drawSideBody(false);
      if (row === Direction.UP) drawFrontBackBody(true);
    }
  }

  return canvas.toDataURL();
};

interface SpriteCharProps {
  image: string;
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
}

export const SpriteCharacter: React.FC<SpriteCharProps> = ({
  image,
  x,
  y,
  direction,
  isMoving,
}) => {
  const [frame, setFrame] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      
      if (isMoving) {
        const currentFrame = Math.floor((now / ANIMATION_SPEED) % FRAMES_PER_ROW);
        setFrame(currentFrame);
      } else {
        setFrame(IDLE_FRAME);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isMoving]);

  const row = DIRECTION_ROW_MAP[direction];
  const bgPosX = -(frame * SPRITE_SIZE);
  const bgPosY = -(row * SPRITE_SIZE);

  return (
    <div
      className="sprite-character"
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: `${SPRITE_SIZE * SCALE}px`, 
        height: `${SPRITE_SIZE * SCALE}px`, 
        transform: `translate3d(${x}px, ${y}px, 0)`, 
        zIndex: 1080,
        transition: 'transform 0.1s linear', 
      }} 
    >
      {/* Shadow */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 4, 
          left: '25%', 
          width: '50%', 
          height: '15%', 
          backgroundColor: 'rgba(0,0,0,0.4)', 
          borderRadius: '50%', 
          filter: 'blur(2px)', 
          zIndex: 0,
        }} 
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${image})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${bgPosX * SCALE}px ${bgPosY * SCALE}px`,
          backgroundSize: `${SPRITE_SIZE * FRAMES_PER_ROW * SCALE}px ${SPRITE_SIZE * 4 * SCALE}px`,
          imageRendering: 'pixelated',
          zIndex: 1,
        }}
      />
    </div>
  );
};
