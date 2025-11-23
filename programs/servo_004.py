from adafruit_pca9685 import PCA9685
from board import SCL, SDA
import busio
import time
import sys

def calc_duty_cycle(deg: float):
    print(f"deg = {deg}")

    assert 0.0 <= deg <= 270.0

    deg_0_pulse = 500
    deg_270_pulse = 2500
    hz = 333

    goal_pulse = 500.0 + (2500 - 500) * deg / 270
    print(f"goal_pulse: {goal_pulse}")

    second = 1_000_000 / hz
    duty_cycle = goal_pulse / second
    print(f"duty_cycle: {duty_cycle}")

    normalized = int(duty_cycle * 0xFFFF)
    return normalized

# duty_cycle = calc_duty_cycle(float(sys.argv[1]))
# print(f"duty_cycle = {duty_cycle}")
# exit()

# I2Cを初期化
i2c = busio.I2C(SCL, SDA)

# PCA9685オブジェクト作成
pca = PCA9685(i2c)
print(pca)
pca.frequency = 333  # PWM周波数（例: 1kHz）


hiza_min_deg = 70 # 股間側
hiza_max_deg = 200 # 真下
kakato_min_deg = 0
kakato_max_deg = 135 # 真下
 

pca.channels[1].duty_cycle = calc_duty_cycle(float(sys.argv[1]))

# CH0のデューティ比を50%に設定
# pca.channels[0].duty_cycle = 0x7FFF  # 0xFFFF の半分 ≒ 50%

print("PWM 50% 出力中...")
time.sleep(300)

# 停止
# pca.channels[0].duty_cycle = 0
print("停止")
200 - hiza_angle - 180