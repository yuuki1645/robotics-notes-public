import { createContext, useContext } from 'react';

const TimelineContext = createContext(null);

export function useTimelineContext() {
  const ctx = useContext(TimelineContext);
  if (ctx == null) {
    throw new Error('useTimelineContext must be used within Timeline');
  }
  return ctx;
}

export default TimelineContext;