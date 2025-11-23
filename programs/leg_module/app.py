from flask import Flask, render_template, request, jsonify
from adafruit_pca9685 import PCA9685
from board import SCL, SDA
import busio
import time
import sys


# I2Cを初期化
i2c = busio.I2C(SCL, SDA)

# PCA9685オブジェクト作成
pca = PCA9685(i2c)
pca.frequency = 333 # PWM周波数(Hz)

CH_HIZA = 0
CH_KAKATO = 1
UPDATE_DEG = 10

class ServoHiza:
    def __init__(self):
        self.min_real_deg = 90
        self.max_real_deg = 270

        self.update_deg = UPDATE_DEG

        self.now_real_deg = 180
        self.target_real_deg = 180

    # ひざは大腿と同じ向きが0度
    def set_real_deg(self, real_deg):
        if real_deg < self.min_real_deg: return
        if real_deg > self.max_real_deg: return
        self.target_real_deg = real_deg

    def real_deg_to_servo_deg(self, real_deg):
        return real_deg - 90

    def update(self):
        if self.target_real_deg > self.now_real_deg:
            self.now_real_deg += self.update_deg
            if self.now_real_deg > self.target_real_deg:
                self.now_real_deg = self.target_real_deg
            set_servo_angle(CH_HIZA, self.real_deg_to_servo_deg(self.now_real_deg))
            return

        if self.target_real_deg < self.now_real_deg:
            self.now_real_deg -= self.update_deg
            if self.now_real_deg < self.target_real_deg:
                self.now_real_deg = self.target_real_deg
            set_servo_angle(CH_HIZA, self.real_deg_to_servo_deg(self.now_real_deg))
            return
    
class ServoKakato:
    def __init__(self):
        self.min_real_deg = 25
        self.max_real_deg = 180

        self.update_deg = UPDATE_DEG

        self.now_real_deg = 90
        self.target_real_deg = 90

    # かかとはすねと同じ向きが0度
    def set_real_deg(self, real_deg):
        if real_deg < self.min_real_deg: return
        if real_deg > self.max_real_deg: return
        self.target_real_deg = real_deg

    def real_deg_to_servo_deg(self, real_deg):
        return real_deg - 25

    def update(self):
        if self.target_real_deg > self.now_real_deg:
            self.now_real_deg += self.update_deg
            if self.now_real_deg > self.target_real_deg:
                self.now_real_deg = self.target_real_deg
            set_servo_angle(CH_KAKATO, self.real_deg_to_servo_deg(self.now_real_deg))
            return

        if self.target_real_deg < self.now_real_deg:
            self.now_real_deg -= self.update_deg
            if self.now_real_deg < self.target_real_deg:
                self.now_real_deg = self.target_real_deg
            set_servo_angle(CH_KAKATO, self.real_deg_to_servo_deg(self.now_real_deg))
            return



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


app = Flask(__name__)

servo_hiza = ServoHiza()
servo_kakato = ServoKakato()


def set_servo_angles(kakato_angle=None, hiza_angle=None):
    print(f"[DEBUG] kakato_angle={kakato_angle:.1f}°, hiza_angle={hiza_angle:.1f}°")

    if kakato_angle is not None:
        servo_kakato.set_real_deg(kakato_angle)

    if hiza_angle is not None:
        servo_hiza.set_real_deg(hiza_angle)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/set_angles", methods=["POST"])
def set_angles():
    data = request.get_json()
    
    # デフォルトの踵角度は90° 
    kakato_angle = float(data.get("kakatoAngle", 90))

    # デフォルトの膝角度は180° 
    hiza_angle = float(data.get("hizaAngle", 180))

    set_servo_angles(
        kakato_angle=kakato_angle, 
        hiza_angle=hiza_angle
    )

    return jsonify({"status": "ok"})


import threading
import time

def update_servo():
    global servo_hiza, servo_kakato
    while True:
        servo_hiza.update()
        servo_kakato.update()
        time.sleep(0.1)

if __name__ == "__main__":
    t = threading.Thread(target=update_servo)
    t.start()
    app.run(host="0.0.0.0", port=5000, debug=True)
