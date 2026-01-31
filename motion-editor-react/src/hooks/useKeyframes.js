import { useCallback } from 'react';
import { MAX_MOTION_DURATION, MIN_KEYFRAME_INTERVAL } from '../constants';

export function useKeyframes(motion, updateMotion) {
  // キーフレームを時間順にソート
  const sortedKeyframes = [...(motion?.keyframes || [])].sort((a, b) => a.time - b.time);
  
  // 指定時間のキーフレームを取得（なければnull）
  const getKeyframeAtTime = useCallback((time, keyframes) => {
    const tolerance = MIN_KEYFRAME_INTERVAL / 2; // 許容誤差
    return keyframes.find(kf => Math.abs(kf.time - time) < tolerance) || null;
  }, []);
  
  // 指定時間の角度を補間または取得
  const getAngleAtTime = useCallback((time, channel, keyframes) => {
    if (keyframes.length === 0) {
      return 90; // デフォルト角度
    }
    
    // 同じ時間のキーフレームがあるか確認
    const exactKeyframe = getKeyframeAtTime(time, keyframes);
    if (exactKeyframe && exactKeyframe.angles[channel] !== undefined) {
      return exactKeyframe.angles[channel];
    }
    
    // 最も近いキーフレームから角度を取得
    const closest = keyframes.reduce((prev, curr) => 
      Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev
    );
    
    return closest.angles[channel] ?? 90;
  }, [getKeyframeAtTime]);
  
  // 重複しない時間を見つける
  const findNonOverlappingTime = useCallback((desiredTime, existingKeyframes, excludeIndex = -1) => {
    let adjustedTime = Math.max(0, Math.min(MAX_MOTION_DURATION, desiredTime));
    
    // 既存のキーフレームと重複しない時間を探す
    for (let i = 0; i < existingKeyframes.length; i++) {
      if (i === excludeIndex) continue; // 自分自身は除外
      
      const existingTime = existingKeyframes[i].time;
      const timeDiff = Math.abs(adjustedTime - existingTime);
      
      // 最小間隔より近い場合は時間を調整
      if (timeDiff < MIN_KEYFRAME_INTERVAL) {
        // 既存のキーフレームより後ろに配置
        adjustedTime = existingTime + MIN_KEYFRAME_INTERVAL;
        
        // 最大時間を超えないようにする
        if (adjustedTime > MAX_MOTION_DURATION) {
          // 既存のキーフレームより前に配置を試みる
          adjustedTime = existingTime - MIN_KEYFRAME_INTERVAL;
          if (adjustedTime < 0) {
            // 前に配置できない場合は、次のキーフレームの前を探す
            if (i + 1 < existingKeyframes.length) {
              const nextTime = existingKeyframes[i + 1].time;
              if (nextTime - existingTime > MIN_KEYFRAME_INTERVAL * 2) {
                adjustedTime = existingTime + MIN_KEYFRAME_INTERVAL;
              } else {
                adjustedTime = existingTime + MIN_KEYFRAME_INTERVAL;
              }
            } else {
              adjustedTime = existingTime + MIN_KEYFRAME_INTERVAL;
            }
          }
        }
      }
    }
    
    return Math.max(0, Math.min(MAX_MOTION_DURATION, adjustedTime));
  }, []);
  
  // キーフレームを追加（チャンネル指定必須）
  const addKeyframe = useCallback((time, channel) => {
    if (!motion || channel == null) return;
    
    // 最大時間を制限
    const clampedTime = Math.max(0, Math.min(MAX_MOTION_DURATION, time));
    
    // 同じ時間に既存のキーフレームがあるか確認
    const existingKeyframe = getKeyframeAtTime(clampedTime, sortedKeyframes);
    
    if (existingKeyframe) {
      // 既存のキーフレームの該当チャンネルの角度を更新
      const newKeyframes = sortedKeyframes.map(kf => {
        if (kf === existingKeyframe) {
          return {
            ...kf,
            angles: {
              ...kf.angles,
              [channel]: getAngleAtTime(clampedTime, channel, sortedKeyframes)
            }
          };
        }
        return kf;
      });
      
      updateMotion(motion.id, { keyframes: newKeyframes });
    } else {
      // 新しいキーフレームを作成（指定チャンネルのみ）
      const angles = {};
      angles[channel] = getAngleAtTime(clampedTime, channel, sortedKeyframes);
      
      const newKeyframe = { time: clampedTime, angles };
      const newKeyframes = [...sortedKeyframes, newKeyframe].sort((a, b) => a.time - b.time);
      
      updateMotion(motion.id, { keyframes: newKeyframes });
    }
  }, [motion, sortedKeyframes, updateMotion, getKeyframeAtTime, getAngleAtTime]);
  
  // キーフレームを削除
  const deleteKeyframe = useCallback((index) => {
    if (!motion || sortedKeyframes.length <= 1) return; // 最低1つは残す
    
    const newKeyframes = sortedKeyframes.filter((_, i) => i !== index);
    updateMotion(motion.id, { keyframes: newKeyframes });
  }, [motion, sortedKeyframes, updateMotion]);
  
  // キーフレームの時間を更新
  const updateKeyframeTime = useCallback((index, newTime) => {
    if (!motion) return;
    
    // 最大時間を制限
    const clampedTime = Math.max(0, Math.min(MAX_MOTION_DURATION, newTime));
    
    // 重複しない時間を見つける（自分自身を除外）
    const adjustedTime = findNonOverlappingTime(clampedTime, sortedKeyframes, index);
    
    const newKeyframes = [...sortedKeyframes];
    newKeyframes[index] = { ...newKeyframes[index], time: adjustedTime };
    newKeyframes.sort((a, b) => a.time - b.time);
    
    updateMotion(motion.id, { keyframes: newKeyframes });
  }, [motion, sortedKeyframes, updateMotion, findNonOverlappingTime]);
  
  // キーフレームの角度を更新
  const updateKeyframeAngles = useCallback((index, angles) => {
    if (!motion) return;
    
    const newKeyframes = [...sortedKeyframes];
    newKeyframes[index] = { ...newKeyframes[index], angles: { ...angles } };
    
    updateMotion(motion.id, { keyframes: newKeyframes });
  }, [motion, sortedKeyframes, updateMotion]);
  
  // 特定チャンネルの角度を更新
  const updateKeyframeAngle = useCallback((index, channel, angle) => {
    if (!motion) return;
    
    const newKeyframes = [...sortedKeyframes];
    newKeyframes[index] = {
      ...newKeyframes[index],
      angles: {
        ...newKeyframes[index].angles,
        [channel]: angle
      }
    };
    
    updateMotion(motion.id, { keyframes: newKeyframes });
  }, [motion, sortedKeyframes, updateMotion]);
  
  return {
    keyframes: sortedKeyframes,
    addKeyframe,
    deleteKeyframe,
    updateKeyframeTime,
    updateKeyframeAngles,
    updateKeyframeAngle,
  };
}