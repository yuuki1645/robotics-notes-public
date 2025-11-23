from adafruit_pca9685 import PCA9685
from board import SCL, SDA
import busio
import time

# I2Cを初期化
i2c = busio.I2C(SCL, SDA)

# PCA9685オブジェクト作成
pca = PCA9685(i2c)
print(pca)
pca.frequency = 333  # PWM周波数（例: 1kHz）

pca.channels[1].duty_cycle = 30000

# CH0のデューティ比を50%に設定
# pca.channels[0].duty_cycle = 0x7FFF  # 0xFFFF の半分 ≒ 50%

print("PWM 50% 出力中...")
time.sleep(300)

# 停止
pca.channels[0].duty_cycle = 0
print("停止")
