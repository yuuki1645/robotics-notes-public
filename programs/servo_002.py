import Adafruit_PCA9685
import time

# PCA9685初期設定
pwm = Adafruit_PCA9685.PCA9685()
pwm.set_pwm_freq(60)


def main():
    while True:
        pwm.set_pwm(0, 0, 150)
        time.sleep(1)
        pwm.set_pwm(0, 0, 650)
        time.sleep(1)


if __name__ == '__main__':
    main()