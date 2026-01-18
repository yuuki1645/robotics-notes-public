import { SERVO_DAEMON_URL } from '../constants';
import { clamp } from '../utils';

/**
 * サーボ情報を取得
 */
export async function fetchServos() {
  const response = await fetch(`${SERVO_DAEMON_URL}/servos`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch servos');
  }
  
  const data = await response.json();
  const servosData = data.servos || [];
  
  // サーボデータを整形
  const formattedServos = servosData.map(servo => {
    const lastLogical = clamp(
      parseFloat(servo.last_logical ?? servo.default_logical ?? 0),
      servo.logical_lo,
      servo.logical_hi
    );
    
    return {
      name: servo.name,
      ch: servo.ch,
      logical_lo: servo.logical_lo,
      logical_hi: servo.logical_hi,
      physical_min: servo.physical_min,
      physical_max: servo.physical_max,
      last_logical: lastLogical,
    };
  });
  
  return formattedServos;
}

/**
 * サーボを動かす
 */
export async function moveServo(ch, mode, angle) {
  const response = await fetch(`${SERVO_DAEMON_URL}/set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ch: ch,
      mode: mode,
      angle: parseFloat(angle),
    }),
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error: ${text}`);
  }
  
  return response.json();
}

/**
 * 複数のサーボを同時に動かす
 */
export async function moveServos(servoAngles, mode = 'logical') {
  const promises = Object.entries(servoAngles).map(([ch, angle]) => 
    moveServo(parseInt(ch), mode, angle)
  );
  
  try {
    await Promise.all(promises);
    return { status: 'ok' };
  } catch (error) {
    throw new Error(`Failed to move servos: ${error.message}`);
  }
}