import { PHYSICAL_MIN, PHYSICAL_MAX } from '../constants';

function AngleSlider({ 
  angle, 
  mode, 
  servo, 
  onChange 
}) {
  // スライダーの範囲を取得
  const getSliderRange = () => {
    if (!servo) {
      return { min: 0, max: 180 };
    }
    
    if (mode === "physical") {
      return { min: PHYSICAL_MIN, max: PHYSICAL_MAX };
    } else {
      return { min: servo.logical_lo, max: servo.logical_hi };
    }
  };

  // スライダーの目盛りを生成
  const generateTicks = (min, max, divisions = 5) => {
    const ticks = [];
    for (let i = 0; i <= divisions; i++) {
      const value = min + (max - min) * (i / divisions);
      ticks.push(Math.round(value));
    }
    return ticks;
  };

  const range = getSliderRange();
  const ticks = generateTicks(range.min, range.max, 5);

  return (
    <>
      <label>
        角度: <span>{angle}</span>°
        <span className="hint">
          {mode === "physical"
            ? "（物理角：サーボ直指定）"
            : "（論理角：変換してサーボへ）"}
        </span>
      </label>

      <input
        type="range"
        min={range.min}
        max={range.max}
        step={1}
        value={angle}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div className="slider-ticks">
        {ticks.map((tick, index) => (
          <span key={index}>{tick}</span>
        ))}
      </div>
    </>
  );
}

export default AngleSlider;