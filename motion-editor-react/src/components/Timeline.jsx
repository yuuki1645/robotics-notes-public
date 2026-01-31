import { useRef, useState, useMemo, useCallback } from 'react';
import { SERVO_CHANNELS } from '../constants';
import { useTimelineCoordinates } from '../hooks/useTimelineCoordinates';
import { useTimelineDrag } from '../hooks/useTimelineDrag';
import TimelineContext from '../contexts/TimelineContext';
import TimelineLabels from './TimelineLabels';
import TimelineRuler from './TimelineRuler';
import TimelineTrack from './TimelineTrack';
import './Timeline.css';

export default function Timeline({
  keyframes,
  currentTime,
  onTimeClick,
  onKeyframeClick,
  onKeyframeDrag,
  selectedKeyframeIndex,
  selectedChannel,
  onPlayheadDrag,
}) {
  const timelineRef = useRef(null);
  const scrollableRef = useRef(null);
  const [isPlayheadDragging, setIsPlayheadDragging] = useState(false);

  const { timeToX, xToTime, TIMELINE_WIDTH, DISPLAY_DURATION } = useTimelineCoordinates();
  const { isDragging, handleKeyframeStart, getClientX } = useTimelineDrag(
    scrollableRef,
    keyframes,
    onKeyframeDrag
  );

  const handleKeyframeClick = useCallback(
    (index, channel) => {
      if (!isDragging && !isPlayheadDragging) {
        onKeyframeClick(index, channel);
      }
    },
    [isDragging, isPlayheadDragging, onKeyframeClick]
  );

  const handlePlayheadDrag = useCallback(
    (time) => {
      setIsPlayheadDragging(true);
      onPlayheadDrag(time);
    },
    [onPlayheadDrag]
  );

  const handlePlayheadDragEnd = useCallback(() => {
    setIsPlayheadDragging(false);
  }, []);

  const onKeyframeStartDrag = useCallback(
    (e, index, ch) => {
      handleKeyframeStart(e, index, ch, timeToX, xToTime, TIMELINE_WIDTH, DISPLAY_DURATION);
    },
    [handleKeyframeStart, timeToX, xToTime, TIMELINE_WIDTH, DISPLAY_DURATION]
  );

  const contextValue = useMemo(
    () => ({
      keyframes,
      currentTime,
      timeToX,
      xToTime,
      TIMELINE_WIDTH,
      DISPLAY_DURATION,
      scrollableRef,
      getClientX,
      isDragging,
      isPlayheadDragging,
      selectedKeyframeIndex,
      selectedChannel,
      onTimeClick,
      onKeyframeClick: handleKeyframeClick,
      onKeyframeStartDrag,
      onPlayheadDrag: handlePlayheadDrag,
      onPlayheadDragEnd: handlePlayheadDragEnd,
    }),
    [
      keyframes,
      currentTime,
      timeToX,
      xToTime,
      TIMELINE_WIDTH,
      DISPLAY_DURATION,
      scrollableRef,
      getClientX,
      isDragging,
      isPlayheadDragging,
      selectedKeyframeIndex,
      selectedChannel,
      onTimeClick,
      handleKeyframeClick,
      onKeyframeStartDrag,
      handlePlayheadDrag,
      handlePlayheadDragEnd,
    ]
  );

  return (
    <TimelineContext.Provider value={contextValue}>
      <div className="timeline-container" ref={timelineRef}>
        <TimelineLabels keyframes={keyframes} currentTime={currentTime} />
        <div className="timeline-scrollable" ref={scrollableRef}>
          <div>
            <TimelineRuler />
          </div>
          <div className="timeline-tracks">
            {SERVO_CHANNELS.map((channel) => (
              <TimelineTrack key={channel} channel={channel} />
            ))}
          </div>
          <div className="timeline-playhead-handle-container">
            <div
              className={`timeline-playhead-handle ${isPlayheadDragging ? 'dragging' : ''}`}
              style={{ left: `${timeToX(currentTime)}px` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!scrollableRef.current) return;
                const rect = scrollableRef.current.getBoundingClientRect();

                const handleMove = (e) => {
                  e.preventDefault();
                  const clientX = getClientX(e);
                  const x = clientX - rect.left;
                  const HANDLE_CENTER_OFFSET_PX = 20;
                  const playheadLeft = x - HANDLE_CENTER_OFFSET_PX;
                  const newTime = xToTime(Math.max(0, playheadLeft));
                  handlePlayheadDrag(newTime);
                };

                const handleEnd = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleEnd);
                  document.removeEventListener('touchmove', handleMove);
                  document.removeEventListener('touchend', handleEnd);
                  handlePlayheadDragEnd();
                };

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
                document.addEventListener('touchmove', handleMove, { passive: false });
                document.addEventListener('touchend', handleEnd);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!scrollableRef.current) return;
                const rect = scrollableRef.current.getBoundingClientRect();

                const handleMove = (e) => {
                  e.preventDefault();
                  const clientX = getClientX(e);
                  const x = clientX - rect.left;
                  const HANDLE_CENTER_OFFSET_PX = 20;
                  const playheadLeft = x - HANDLE_CENTER_OFFSET_PX;
                  const newTime = xToTime(Math.max(0, playheadLeft));
                  handlePlayheadDrag(newTime);
                };

                const handleEnd = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleEnd);
                  document.removeEventListener('touchmove', handleMove);
                  document.removeEventListener('touchend', handleEnd);
                  handlePlayheadDragEnd();
                };

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
                document.addEventListener('touchmove', handleMove, { passive: false });
                document.addEventListener('touchend', handleEnd);
              }}
            />
          </div>
        </div>
      </div>
    </TimelineContext.Provider>
  );
}