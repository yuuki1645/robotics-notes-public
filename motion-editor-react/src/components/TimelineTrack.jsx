import { useTimelineContext } from '../contexts/TimelineContext';
import TimelineKeyframe from './TimelineKeyframe';
import './Timeline.css';

export default function TimelineTrack({ channel }) {
  const {
    keyframes,
    currentTime,
    timeToX,
    xToTime,
    scrollableRef,
    getClientX,
    isDragging,
    isPlayheadDragging,
    selectedKeyframeId,
    onTimeClick,
    onKeyframeClick,
  } = useTimelineContext();

  const handleTrackClick = (e) => {
    if (isDragging || isPlayheadDragging) return;
    if (
      e.target.closest('.timeline-keyframe') ||
      e.target.closest('.timeline-track-label') ||
      e.target.closest('.timeline-playhead')
    ) {
      return;
    }
    const trackContent = e.target.closest('.timeline-track-content');
    if (trackContent) {
      if (!scrollableRef.current) return;
      const rect = scrollableRef.current.getBoundingClientRect();
      const clientX = getClientX(e);
      const x = clientX - rect.left;
      const time = xToTime(x);
      onTimeClick(time, channel);
    }
  };

  return (
    <div
      className="timeline-track"
      data-channel={channel}
      onClick={handleTrackClick}
      onTouchEnd={handleTrackClick}
    >
      <div
        className="timeline-track-content"
        onClick={handleTrackClick}
        onTouchEnd={handleTrackClick}
      >
        <div
          className={`timeline-playhead ${isPlayheadDragging ? 'dragging' : ''}`}
          style={{ left: `${timeToX(currentTime)}px` }}
        />
        {keyframes.map((kf) => {
          if (kf.channel !== channel) return null;
          const x = timeToX(kf.time);
          const isSelected = selectedKeyframeId === kf.id;
          return (
            <TimelineKeyframe
              key={kf.id}
              keyframe={kf}
              keyframeId={kf.id}
              channel={channel}
              x={x}
              isSelected={isSelected}
              angle={kf.angle ?? 90}
            />
          );
        })}
      </div>
    </div>
  );
}