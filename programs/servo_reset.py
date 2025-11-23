from pprint import pprint
import sys
from adafruit_pca9685 import PCA9685
from board import SCL, SDA
import busio
import time

# I2Cを初期化
i2c = busio.I2C(SCL, SDA)

# PCA9685オブジェクト作成
pca = PCA9685(i2c)
pca.frequency = 333 # PWM周波数(Hz)

# channelは0:膝サーボ、1:踵サーボ
def set_servo_angle(channel: int, deg: float):
    global pca

    print(f"[DEBUG] set_servo_angle({deg})")

    if channel not in [0, 1]:
        return {
            "status": "error",
            "message": f"channel({channel}) not in [0, 1]"
        }
    
    if deg < 0.0:
        return {
            "status": "error",
            "message": f"deg({deg}) < 0.0"
        }
    elif deg > 270.0:
        return {
            "status": "error",
            "message": f"deg({deg}) > 270.0"
        }
    
    # サーボの仕様より
    deg_0_pulse = 500 # us
    deg_270_pulse = 2500 # us
    hz = 333
    
    target_pulse = 500.0 + (deg_270_pulse - deg_0_pulse) * deg / 270.0
    period = 1_000_000 / hz
    duty_ratio = target_pulse / period
    duty_cycle = int(duty_ratio * 0xFFFF)

    pca.channels[channel].duty_cycle = duty_cycle

    return {
        "status": "ok",
        "channel": channel,
        "target_pulse": target_pulse,
        "period": period,
        "duty_ratio": duty_ratio,
        "duty_cycle": duty_cycle
    }

result = set_servo_angle(
    int(sys.argv[1]),   # ch
    float(sys.argv[2])  # deg
)
pprint(result)