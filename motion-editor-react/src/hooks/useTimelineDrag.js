import { useRef, useState } from 'react';
import { MAX_MOTION_DURATION } from '../constants';

const DRAG_THRESHOLD_PX = 5;

export function useTimelineDrag(scrollableRef, keyframes, onKeyframeDrag) {
  const dragStateRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const onKeyframeDragRef = useRef(onKeyframeDrag);
  onKeyframeDragRef.current = onKeyframeDrag;

  const getClientX = (e) => {
    if (e.touches && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      return e.changedTouches[0].clientX;
    }
    return e.clientX;
  };

  const handleKeyframeStart = (e, keyframeId, channel, timeToX, xToTime, timelineWidth, displayDuration) => {
    e.stopPropagation();
    e.preventDefault();

    if (!scrollableRef.current) return;
    const kf = keyframes.find((k) => k.id === keyframeId);
    if (!kf) return;

    const rect = scrollableRef.current.getBoundingClientRect();
    const clientX = getClientX(e);
    const startX = clientX - rect.left;
    const startTime = kf.time;

    dragStateRef.current = {
      keyframeId,
      channel,
      startX,
      startTime,
      rectLeft: rect.left,
      dragCommitted: false,
    };

    const handleMove = (e) => {
      if (!dragStateRef.current || !scrollableRef.current) return;

      e.preventDefault();

      const currentClientX = getClientX(e);
      const rect = scrollableRef.current.getBoundingClientRect();
      const currentX = currentClientX - rect.left;
      const deltaX = currentX - dragStateRef.current.startX;

      if (!dragStateRef.current.dragCommitted) {
        if (Math.abs(deltaX) >= DRAG_THRESHOLD_PX) {
          dragStateRef.current.dragCommitted = true;
          setIsDragging(true);
        } else {
          return;
        }
      }

      const deltaTime = (deltaX / timelineWidth) * displayDuration;
      const newTime = Math.max(0, Math.min(MAX_MOTION_DURATION, dragStateRef.current.startTime + deltaTime));

      onKeyframeDragRef.current(dragStateRef.current.keyframeId, newTime);
    };

    const handleEnd = () => {
      dragStateRef.current = null;
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  };

  return {
    isDragging,
    handleKeyframeStart,
    getClientX,
  };
}