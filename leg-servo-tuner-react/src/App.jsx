import { useState, useEffect } from 'react'
import './App.css'
import { useServos } from './hooks/useServos'
import { moveServo } from './api'
import { SERVO_NAME_TO_CH } from './constants'
import ModeSelector from './components/ModeSelector'
import ServoSelector from './components/ServoSelector'
import GuideImage from './components/GuideImage'
import AngleSlider from './components/AngleSlider'

function App() {
  const { servos, loading, error } = useServos();
  const [selectedServo, setSelectedServo] = useState("");
  const [mode, setMode] = useState("logical");
  const [angle, setAngle] = useState(0);

  // サーボが読み込まれたら最初のサーボを選択
  useEffect(() => {
    if (servos.length > 0 && !selectedServo) {
      setSelectedServo(servos[0].name);
      setMode("logical");
    }
  }, [servos, selectedServo]);

  // 選択されたサーボが変更されたとき、またはモードが変更されたときに角度を更新
  useEffect(() => {
    if (servos.length === 0 || !selectedServo) return;
    
    const servo = servos.find(s => s.name === selectedServo);
    if (!servo) return;
    
    const newAngle = mode === "physical" 
      ? servo.last_physical 
      : servo.last_logical;
    
    setAngle(Math.round(newAngle));
  }, [selectedServo, mode, servos]);

  // サーボを動かす
  const handleAngleChange = async (newAngle) => {
    setAngle(newAngle);
    
    if (!selectedServo) return;
    
    // サーボ名からチャンネル番号を取得
    const ch = SERVO_NAME_TO_CH[selectedServo];
    if (ch === undefined) {
      alert(`Unknown servo: ${selectedServo}`);
      return;
    }
    
    try {
      await moveServo(ch, mode, newAngle);
    } catch (err) {
      alert(`Network error:\n${err.message}`);
    }
  };

  const currentServo = servos.find(s => s.name === selectedServo);

  if (loading) {
    return (
      <div className="app">
        <h1>Leg Servo Tuner</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <h1>Leg Servo Tuner</h1>
        <p style={{ color: '#ff6b6b' }}>エラー: {error}</p>
        <p style={{ fontSize: '14px', color: '#a8b0d6' }}>
          servo_daemon（http://localhost:5000）が起動しているか確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Leg Servo Tuner</h1>

      <div className="panel">
        <ModeSelector mode={mode} onChange={setMode} />
        
        <ServoSelector 
          servos={servos}
          selectedServo={selectedServo}
          onChange={setSelectedServo}
        />

        <GuideImage servoName={selectedServo} />

        <AngleSlider
          angle={angle}
          mode={mode}
          servo={currentServo}
          onChange={handleAngleChange}
        />
      </div>
    </div>
  );
}

export default App