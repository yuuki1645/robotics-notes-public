import { useCallback } from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import './Timeline.css';

const HANDLE_CENTER_OFFSET_PX = 20;

export default function TimelinePlayheadHandle() {
  const { 
    currentTime, 
    timeToX, 
    xToTime, 
    getClientX, 
    scrollableRef, 
    isPlayheadDragging, 
    onPlayheadDrag,
    onPlayheadDragEnd, 
    endKeyframeDrag 
  } = useTimelineContext();
  
  const setupDrag = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      endKeyframeDrag?.();
      onPlayheadDrag(currentTime);
      if (!scrollableRef?.current) return;
      const rect = scrollableRef.current.getBoundingClientRect();

      const handleMove = (e) => {
        e.preventDefault();
        const clientX = getClientX(e);
        const x = clientX - rect.left;
        const playheadLeft = x - HANDLE_CENTER_OFFSET_PX;
        const newTime = xToTime(Math.max(0, playheadLeft));
        onPlayheadDrag(newTime);
      };

      const handleEnd = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        document.removeEventListener('touchcancel', handleEnd);
        onPlayheadDragEnd?.();
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
    },
    [
      currentTime,
      scrollableRef,
      getClientX,
      xToTime,
      onPlayheadDrag,
      onPlayheadDragEnd,
      endKeyframeDrag,
    ]
  );

  return (
    <div className="timeline-playhead-handle-container">
      <div
        className={`timeline-playhead-handle ${isPlayheadDragging ? 'dragging' : ''}`}
        style={{ left: `${timeToX(currentTime)}px` }}
        onMouseDown={setupDrag}
        onTouchStart={setupDrag}
      />
    </div>
  );
}