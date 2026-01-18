import { GUIDE_MAP } from '../constants';
import { partKeyFromServoName } from '../utils';
import './GuideImage.css';

export default function GuideImage({ servoName }) {
  const getGuideImage = () => {
    if (!servoName) return GUIDE_MAP["KNEE"];
    const key = partKeyFromServoName(servoName);
    return GUIDE_MAP[key] || GUIDE_MAP["KNEE"];
  };

  const getGuideTitle = () => {
    if (!servoName) return "ガイド";
    const key = partKeyFromServoName(servoName);
    return `ガイド: ${key}`;
  };

  return (
    <div className="guide">
      <div className="guide-title">{getGuideTitle()}</div>
      <img
        className="guide-img"
        src={getGuideImage()}
        alt="guide"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}