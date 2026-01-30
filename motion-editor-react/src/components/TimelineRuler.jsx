import { MAX_MOTION_DURATION } from '../constants';
import './Timeline.css';

export default function TimelineRuler({
  timeToX,
  currentTime,
  xToTime,
  scrollableRef,
  getClientX,
  onPlayheadDrag,
  onPlayheadDragEnd,
  isPlayheadDragging,
}) {
  const displayDuration = MAX_MOTION_DURATION;
  const markerCount = 20;
  
  const timeMarkers = [];
  for (let i = 0; i <= markerCount; i++) {
    const time = (displayDuration / markerCount) * i;
    timeMarkers.push(time);
  }
  
  const playheadLeft = Math.max(0, timeToX(currentTime));
  
  return (
    <div className="timeline-header">
      <div className="timeline-ruler">
        {timeMarkers.map((time, i) => (
          <div 
            key={i} 
            className="timeline-marker"
            style={{ left: `${timeToX(time)}px` }}
          >
            <div className="timeline-marker-line" />
            <div className="timeline-marker-label">
              {(time / 1000).toFixed(1)}s
            </div>
          </div>
        ))}
        {/* ルーラー上のシークバー（縦線のみ・ドラッグは下側のハンドルで行う） */}
        <div
          className={`timeline-ruler-playhead ${isPlayheadDragging ? 'dragging' : ''}`}
          style={{ left: `${playheadLeft}px` }}
        />
      </div>
    </div>
  );
}