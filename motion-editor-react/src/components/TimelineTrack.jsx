import TimelineKeyframe from './TimelineKeyframe';
import './Timeline.css';

export default function TimelineTrack({
  channel,
  keyframes,
  currentTime,
  selectedKeyframeIndex,
  selectedChannel,
  timeToX,
  onTimeClick,
  onKeyframeClick,
  onKeyframeStartDrag,
  getClientX,
  xToTime,
  scrollableRef,
  isDragging,
  isPlayheadDragging,
}) {
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
        {/* 再生位置インジケーター（表示専用・ドラッグはルーラーで行う） */}
        <div 
          className={`timeline-playhead ${isPlayheadDragging ? 'dragging' : ''}`}
          style={{ left: `${timeToX(currentTime)}px` }}
        />
        {keyframes.map((keyframe, index) => {
          if (keyframe.angles[channel] === undefined) {
            return null;
          }
          const x = timeToX(keyframe.time);
          const isSelected = selectedKeyframeIndex === index && selectedChannel === channel;
          const angle = keyframe.angles[channel] ?? 90;
          return (
            <TimelineKeyframe
              key={`${channel}-${index}`}
              keyframe={keyframe}
              keyframeIndex={index}
              channel={channel}
              x={x}
              isSelected={isSelected}
              angle={angle}
              onClick={onKeyframeClick}
              onStartDrag={onKeyframeStartDrag}
            />
          );
        })}
      </div>
    </div>
  );
}