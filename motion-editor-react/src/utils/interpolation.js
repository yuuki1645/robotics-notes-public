/**
 * 線形補間
 * @param {number} start - 開始値
 * @param {number} end - 終了値
 * @param {number} t - 補間係数 (0-1)
 * @returns {number} 補間された値
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * 2つのキーフレーム間の補間値を計算
 * @param {Object} keyframe1 - 開始キーフレーム { time, angles }
 * @param {Object} keyframe2 - 終了キーフレーム { time, angles }
 * @param {number} currentTime - 現在の時間（ミリ秒）
 * @returns {Object} 補間された角度 { [ch]: angle }
 */
export function interpolateKeyframes(keyframe1, keyframe2, currentTime) {
  const timeDiff = keyframe2.time - keyframe1.time;
  if (timeDiff <= 0) {
    return { ...keyframe2.angles };
  }
  
  const t = (currentTime - keyframe1.time) / timeDiff;
  const clampedT = Math.max(0, Math.min(1, t));
  
  const interpolatedAngles = {};
  const allChannels = new Set([
    ...Object.keys(keyframe1.angles),
    ...Object.keys(keyframe2.angles)
  ]);
  
  for (const ch of allChannels) {
    const startAngle = keyframe1.angles[ch] ?? keyframe2.angles[ch] ?? 90;
    const endAngle = keyframe2.angles[ch] ?? keyframe1.angles[ch] ?? 90;
    interpolatedAngles[ch] = lerp(startAngle, endAngle, clampedT);
  }
  
  return interpolatedAngles;
}

/**
 * 指定時間以前で、指定チャンネルの角度が定義されている最後のキーフレームを探す
 * @param {Array} keyframes - キーフレーム配列（時間順にソート済み）
 * @param {number} time - 現在の時間（ミリ秒）
 * @param {number} channel - サーボチャンネル番号
 * @returns {Object|null} キーフレームまたはnull
 */
function findPreviousKeyframeWithAngle(keyframes, time, channel) {
  for (let i = keyframes.length - 1; i >= 0; i--) {
    const kf = keyframes[i];
    if (kf.time <= time && kf.angles[channel] !== undefined) {
      return kf;
    }
  }
  return null;
}

/**
 * 指定時間以降で、指定チャンネルの角度が定義されている最初のキーフレームを探す
 * @param {Array} keyframes - キーフレーム配列（時間順にソート済み）
 * @param {number} time - 現在の時間（ミリ秒）
 * @param {number} channel - サーボチャンネル番号
 * @returns {Object|null} キーフレームまたはnull
 */
function findNextKeyframeWithAngle(keyframes, time, channel) {
  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    if (kf.time >= time && kf.angles[channel] !== undefined) {
      return kf;
    }
  }
  return null;
}

/**
 * 指定時間の角度を計算（キーフレーム配列から）
 * 角度が指定されていないサーボは、前方補間（forward interpolation）を使用
 * 
 * @param {Array} keyframes - キーフレーム配列（時間順にソート済み）
 * @param {number} time - 現在の時間（ミリ秒）
 * @param {Array} allChannels - すべてのサーボチャンネル番号の配列（オプション）
 * @returns {Object} 補間された角度 { [ch]: angle }
 */
export function getAngleAtTime(keyframes, time, allChannels = null) {
  if (keyframes.length === 0) {
    return {};
  }
  
  if (keyframes.length === 1) {
    return { ...keyframes[0].angles };
  }
  
  // すべてのチャンネルを取得（指定されていない場合は、すべてのキーフレームから収集）
  const channels = allChannels || (() => {
    const channelSet = new Set();
    keyframes.forEach(kf => {
      Object.keys(kf.angles).forEach(ch => channelSet.add(parseInt(ch)));
    });
    return Array.from(channelSet);
  })();
  
  const result = {};
  
  // 各チャンネルごとに角度を計算
  for (const channel of channels) {
    // 現在時間以前で最後に角度が定義されているキーフレームを探す
    const prevKf = findPreviousKeyframeWithAngle(keyframes, time, channel);
    
    // 現在時間以降で最初に角度が定義されているキーフレームを探す
    const nextKf = findNextKeyframeWithAngle(keyframes, time, channel);
    
    if (prevKf && nextKf) {
      // 両方見つかった場合：線形補間
      if (prevKf.time === nextKf.time) {
        // 同じキーフレームの場合は、その角度を使用
        result[channel] = prevKf.angles[channel];
      } else {
        // 異なるキーフレーム間で補間
        const timeDiff = nextKf.time - prevKf.time;
        const t = (time - prevKf.time) / timeDiff;
        const clampedT = Math.max(0, Math.min(1, t));
        result[channel] = lerp(
          prevKf.angles[channel],
          nextKf.angles[channel],
          clampedT
        );
      }
    } else if (prevKf) {
      // 前方のみ見つかった場合：その角度を使用（最後の角度指定を維持）
      result[channel] = prevKf.angles[channel];
    } else if (nextKf) {
      // 後方のみ見つかった場合：その角度を使用（前方補間）
      result[channel] = nextKf.angles[channel];
    } else {
      // どちらも見つからない場合：デフォルト角度
      result[channel] = 90;
    }
  }
  
  return result;
}