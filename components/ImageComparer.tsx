import React, { useState, useRef, useEffect } from 'react';
import { ImageComparerProps } from '../types';

export const ImageComparer: React.FC<ImageComparerProps> = ({ beforeImage, afterImage }) => {
  // After画像がない場合はBefore画像のみを表示
  if (!afterImage) {
    return (
      <div 
        className="image-comparer"
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          overflow: 'hidden'
        }}
      >
        <img
          src={beforeImage}
          alt="Before"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px'
          }}
        >
          BEFORE
        </div>
      </div>
    );
  }
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeImageRef = useRef<HTMLImageElement>(null);
  const afterImageRef = useRef<HTMLImageElement>(null);

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateSliderPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="image-comparer"
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
    >
      {/* アフター画像（背景） */}
      <img
        ref={afterImageRef}
        src={afterImage}
        alt="After"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />
      
      {/* ビフォー画像（クリップされる） */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <img
          ref={beforeImageRef}
          src={beforeImage}
          alt="Before"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {/* スライダー */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${sliderPosition}%`,
          width: '4px',
          height: '100%',
          backgroundColor: '#fff',
          transform: 'translateX(-50%)',
          cursor: 'ew-resize',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* スライダーハンドル */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            backgroundColor: '#fff',
            border: '2px solid #007bff',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            cursor: 'ew-resize'
          }}
        />
      </div>
      
      {/* ラベル */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '3px',
          fontSize: '12px',
          pointerEvents: 'none'
        }}
      >
        BEFORE
      </div>
      
      {afterImage && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '3px',
            fontSize: '12px',
            pointerEvents: 'none'
          }}
        >
          AFTER
        </div>
      )}
    </div>
  );
};