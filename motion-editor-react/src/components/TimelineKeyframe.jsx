import { useRef, useEffect } from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import './Timeline.css';

export default function TimelineKeyframe({
  keyframe,
  keyframeIndex,
  channel,
  x,
  isSelected,
  angle,
}) {
  const { onKeyframeClick, onKeyframeStartDrag } = useTimelineContext();
  const keyframeRef = useRef(null);

  useEffect(() => {
    const el = keyframeRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      onKeyframeStartDrag(e, keyframeIndex, channel);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
    };
  }, [onKeyframeStartDrag, keyframeIndex, channel]);

  const handleClick = (e) => {
    e.stopPropagation();
    onKeyframeClick(keyframeIndex, channel);
  };

  return (
    <div
      ref={keyframeRef}
      className={`timeline-keyframe ${isSelected ? 'selected' : ''}`}
      style={{ left: `${x}px` }}
      onClick={handleClick}
      onTouchEnd={handleClick}
      onMouseDown={(e) => onKeyframeStartDrag(e, keyframeIndex, channel)}
      title={`時間: ${(keyframe.time / 1000).toFixed(2)}s, 角度: ${angle.toFixed(1)}°`}
    >
      <div className="timeline-keyframe-handle" />
    </div>
  );
}