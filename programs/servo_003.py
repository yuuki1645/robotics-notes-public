import Adafruit_PCA9685
import time
 
pwm = Adafruit_PCA9685.PCA9685()
pwm.set_pwm_freq(50)
 
while 1:
        pwm.set_pwm(0,0,150)
        time.sleep(1)
        pwm.set_pwm(0,0,450)
        time.sleep(1)