// Mega Kit Pinouts data.
// Board facts: Arduino Mega 2560 Rev3 docs + ATmega2560 datasheet.
// Kit wiring: pin numbers taken from the sketches and text in ELEGOO's
// "The Most Complete Starter Kit for MEGA" download (V1.0.2023.05.05).

const KIT_PDF = 'kit-pdfs/';

const SOURCES = {
  megaDocs:    { label: 'Arduino Mega 2560 Rev3 (official docs)', url: 'https://docs.arduino.cc/hardware/mega-2560' },
  megaPinout:  { label: 'Mega 2560 Rev3 full pinout (PDF)', url: 'https://docs.arduino.cc/resources/pinouts/A000067-full-pinout.pdf' },
  megaSchem:   { label: 'Mega 2560 Rev3 schematics (PDF)', url: 'https://docs.arduino.cc/resources/schematics/A000067-schematics.pdf' },
  megaSheet:   { label: 'Mega 2560 Rev3 datasheet, rev 4, 20 Oct 2026 (PDF)', url: 'https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf' },
  avrSheet:    { label: 'ATmega640/1280/2560 datasheet (Microchip)', url: 'https://ww1.microchip.com/downloads/en/devicedoc/atmel-2549-8-bit-avr-microcontroller-atmega640-1280-1281-2560-2561_datasheet.pdf' },
  attachInt:   { label: 'attachInterrupt() reference', url: 'https://docs.arduino.cc/language-reference/en/functions/external-interrupts/attachInterrupt/' },
  analogWrite: { label: 'analogWrite() reference (PWM pins)', url: 'https://docs.arduino.cc/language-reference/en/functions/analog-io/analogWrite/' },
  analogRead:  { label: 'analogRead() reference', url: 'https://docs.arduino.cc/language-reference/en/functions/analog-io/analogRead/' },
  serial:      { label: 'Serial reference (Serial1–3 on the Mega)', url: 'https://docs.arduino.cc/language-reference/en/functions/communication/serial/' },
  wire:        { label: 'I2C / Wire guide', url: 'https://docs.arduino.cc/learn/communication/wire/' },
  spi:         { label: 'SPI guide', url: 'https://docs.arduino.cc/learn/communication/spi/' },
  shiftOut:    { label: 'shiftOut() reference', url: 'https://docs.arduino.cc/language-reference/en/functions/advanced-io/shiftOut/' },
  tone:        { label: 'tone() reference', url: 'https://docs.arduino.cc/language-reference/en/functions/advanced-io/tone/' },
  elegooPage:  { label: 'ELEGOO kit tutorial and code download page', url: 'https://www.elegoo.com/blogs/arduino-projects/elegoo-mega-2560-the-most-complete-starter-kit-tutorial' },
  elegooTut:   { label: 'ELEGOO kit tutorial PDF (local copy)', url: KIT_PDF + 'elegoo-mega-complete-kit-tutorial.pdf', local: true },
  elegooBoard: { label: 'ELEGOO MEGA 2560 board sheet, 2018, outdated (local copy)', url: KIT_PDF + '2560-board.pdf', local: true },
};

const kit = (file, label) => ({ label: label || 'Kit datasheet (local copy)', url: KIT_PDF + file, local: true });
const ext = (label, url) => ({ label, url });

// Categories shown in the component list, in order.
const CATEGORIES = ['Displays', 'Sensors', 'Input', 'Motors and switching', 'Chips', 'Basic parts', 'Power'];

// pins: physical order [number, name, what it does]
// layout: 'strip' = one row in order, 'dual' = bottom row 1..n/2, top row n..n/2+1 (DIP chip or display seen from the front)
// wiring rows: [part pin, Mega pin ref or plain text, note]. Mega refs: D0–D53, A0–A15, 5V, 3V3, GND, VIN.
const COMPONENTS = [
  {
    id: '5461as', name: '4-digit 7-segment display', part: '5461AS', cat: 'Displays', lesson: 28,
    blurb: 'Common cathode. The 4 digit pins are the cathodes and the 8 segment pins are the anodes. The kit sheet calls it 5641AS; the pinout is the same.',
    layout: 'dual',
    pins: [[1,'E','Segment E'],[2,'D','Segment D'],[3,'DP','Decimal point'],[4,'C','Segment C'],[5,'G','Segment G'],[6,'DIG4','Digit 4 cathode'],
           [7,'B','Segment B'],[8,'DIG3','Digit 3 cathode'],[9,'DIG2','Digit 2 cathode'],[10,'F','Segment F'],[11,'A','Segment A'],[12,'DIG1','Digit 1 cathode']],
    wiring: [
      { title: 'Direct wiring: 220Ω on the digit pins', rows: [
        ['A (11)','D22',''],['B (7)','D23',''],['C (4)','D24',''],['D (2)','D25',''],['E (1)','D26',''],['F (10)','D27',''],['G (5)','D28',''],['DP (3)','D29',''],
        ['DIG1 (12)','D30','220Ω in series'],['DIG2 (9)','D31','220Ω in series'],['DIG3 (8)','D32','220Ω in series'],['DIG4 (6)','D33','220Ω in series'] ] },
      { title: 'Kit lesson 28: segments through a 74HC595', rows: [
        ['74HC595 DS (14)','D8','data'],['74HC595 ST_CP (12)','D9','latch'],['74HC595 SH_CP (11)','D10','clock'] ] },
    ],
    notes: [
      'Front view: decimal points at the bottom, pin 1 bottom-left.',
      'Common cathode: a segment pin HIGH lights the segment, and a digit pin LOW turns that digit on. Show one digit at a time (multiplexing).',
      'Resistors on the digit pins only: a digit showing 8 looks dimmer than a 1, because its segments share one resistor. The Resistors box above lists the even-brightness options that stay under the 20 mA pin limit.',
      'SevSeg: begin(COMMON_CATHODE, 4, digitPins, segmentPins, false). The last argument is false because the resistors are on the digit pins.',
      'SevSeg gotcha: setNumber() only takes whole numbers. setNumber(22.82, 2) silently becomes 22 and shows 0.22. For decimals use setNumberF(22.82, 2).',
      'A blank leftmost digit is normal for numbers under 10, because SevSeg hides leading zeros.',
    ],
    links: [kit('lesson-28-5641as-4-digit-7-segment-display.pdf'), ext('5461AS datasheet (XLITX)', 'http://www.xlitx.com/datasheet/5461AS.pdf'), ext('SevSeg library', 'https://github.com/DeanIsMe/SevSeg')],
  },
  {
    id: '5161as', name: '1-digit 7-segment display', part: '5161AS', cat: 'Displays', lesson: 27,
    blurb: 'Common cathode, with pins 3 and 8 as the shared cathode.',
    layout: 'dual',
    pins: [[1,'E','Segment E'],[2,'D','Segment D'],[3,'COM','Common cathode'],[4,'C','Segment C'],[5,'DP','Decimal point'],
           [6,'B','Segment B'],[7,'A','Segment A'],[8,'COM','Common cathode'],[9,'F','Segment F'],[10,'G','Segment G']],
    wiring: [{ title: 'Kit lesson 27: through a 74HC595', rows: [
      ['COM (3, 8)','GND','common cathode'],['A–G, DP','74HC595 Q0–Q7','one 220Ω per segment'],
      ['74HC595 DS (14)','D2','data'],['74HC595 ST_CP (12)','D3','latch'],['74HC595 SH_CP (11)','D4','clock'] ] }],
    notes: ['For a common-anode version (5161BS), connect pins 3 and 8 to 5V instead, and invert the segment bits.'],
    links: [kit('lesson-27-5161as-1-digit-7-segment-display.pdf'), ext('5161AS datasheet (XLITX)', 'http://www.xlitx.com/datasheet/5161AS.pdf')],
  },
  {
    id: 'lcd1602', name: 'LCD1602 character display', part: 'LCD1602 (HD44780)', cat: 'Displays', lesson: 22,
    blurb: '16×2 characters, HD44780-compatible. Run in 4-bit mode it needs 6 Arduino pins.',
    layout: 'strip',
    pins: [[1,'VSS','Ground'],[2,'VDD','+5V'],[3,'V0','Contrast (pot wiper)'],[4,'RS','Register select'],[5,'RW','Read/write (tie to GND)'],[6,'E','Enable'],
           [7,'D0','Data 0 (unused in 4-bit)'],[8,'D1','Data 1 (unused)'],[9,'D2','Data 2 (unused)'],[10,'D3','Data 3 (unused)'],
           [11,'D4','Data 4'],[12,'D5','Data 5'],[13,'D6','Data 6'],[14,'D7','Data 7'],[15,'A','Backlight +'],[16,'K','Backlight −']],
    wiring: [{ title: 'Kit lesson 22', rows: [
      ['VSS','GND',''],['VDD','5V',''],['V0','10k pot wiper','pot ends to 5V and GND'],['RS','D7',''],['RW','GND',''],['E','D8',''],
      ['D4','D9',''],['D5','D10',''],['D6','D11',''],['D7','D12',''],['A','5V','220Ω in series (backlight; skip it if the module has its own)'],['K','GND',''] ] }],
    notes: ['Code: LiquidCrystal lcd(7, 8, 9, 10, 11, 12);', 'Blank screen or solid blocks? Turn the contrast pot.', 'Lessons 23 (thermometer) reuse this wiring.'],
    links: [kit('lesson-22-lcd1602a-lcd-display.pdf'), ext('HD44780 controller datasheet', 'https://www.sparkfun.com/datasheets/LCD/HD44780.pdf'), ext('LiquidCrystal library', 'https://docs.arduino.cc/libraries/liquidcrystal/')],
  },
  {
    id: 'max7219', name: '8×8 LED matrix module', part: 'MAX7219', cat: 'Displays', lesson: 15,
    blurb: 'A MAX7219 driver drives all 64 LEDs over 3 data wires. Modules can be chained from DOUT to DIN.',
    layout: 'strip',
    pins: [[1,'VCC','+5V'],[2,'GND','Ground'],[3,'DIN','Data in'],[4,'CS','Chip select / LOAD'],[5,'CLK','Clock']],
    wiring: [{ title: 'Kit lesson 15', rows: [['VCC','5V',''],['GND','GND',''],['DIN','D12',''],['CS','D11',''],['CLK','D10','']] }],
    notes: ['Code: LedControl lc = LedControl(12, 10, 11, 1); // DIN, CLK, CS, number of modules', 'The output header on the other end (VCC, GND, DOUT, CS, CLK) feeds the next module.'],
    links: [kit('lesson-15-max7219-8x8-matrix-display-module.pdf'), ext('MAX7219 datasheet (Analog Devices)', 'https://www.analog.com/media/en/technical-documentation/data-sheets/MAX7219-MAX7221.pdf'), ext('LedControl library', 'https://github.com/wayoda/LedControl')],
  },
  {
    id: 'hcsr04', name: 'Ultrasonic distance sensor', part: 'HC-SR04', cat: 'Sensors', lesson: 10,
    blurb: 'Measures 2–400 cm. A 10 µs pulse on Trig starts a reading, and the length of the Echo pulse gives the distance.',
    layout: 'strip',
    pins: [[1,'VCC','+5V'],[2,'Trig','Trigger in'],[3,'Echo','Echo out'],[4,'GND','Ground']],
    wiring: [{ title: 'Kit lesson 10', rows: [['VCC','5V',''],['Trig','D12',''],['Echo','D11',''],['GND','GND','']] }],
    notes: ['Distance in cm ≈ echo time in µs ÷ 58.'],
    links: [kit('lesson-10-hc-sr04-ultrasonic-sensor-module.pdf'), ext('HC-SR04 datasheet (SparkFun)', 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf')],
  },
  {
    id: 'dht11', name: 'Temperature and humidity sensor', part: 'DHT11 module', cat: 'Sensors', lesson: 12,
    blurb: 'A single data wire carries both readings. The module has its own pull-up resistor.',
    layout: 'strip',
    pins: [[1,'S','Data'],[2,'VCC','+5V (middle pin)'],[3,'−','Ground']],
    wiring: [{ title: 'Kit lesson 12', rows: [['S','D2',''],['VCC','5V',''],['−','GND','']] }],
    notes: ['Read it at most once every 1–2 seconds. The kit sketch uses the non-blocking DHT library on pin 2.'],
    links: [kit('lesson-12-dht11-temperature-and-humidity-sensor.pdf'), ext('DHT11 datasheet (Mouser)', 'https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-Translated-Version-1143054.pdf')],
  },
  {
    id: 'gy521', name: 'Accelerometer + gyroscope', part: 'GY-521 (MPU-6050)', cat: 'Sensors', lesson: 16,
    blurb: '6-axis motion sensor on I2C. Newer kits may ship a QMI8658C module instead (also covered in lesson 16).',
    layout: 'strip',
    pins: [[1,'VCC','+5V (on-board regulator)'],[2,'GND','Ground'],[3,'SCL','I2C clock'],[4,'SDA','I2C data'],[5,'XDA','Aux I2C data'],[6,'XCL','Aux I2C clock'],[7,'AD0','Address select'],[8,'INT','Interrupt out']],
    wiring: [{ title: 'Kit lesson 16', rows: [['VCC','5V',''],['GND','GND',''],['SCL','D21','SCL'],['SDA','D20','SDA'],['INT','D2','optional, interrupt 0']] }],
    notes: ['I2C address 0x68 with AD0 low (default), 0x69 with AD0 high.', 'The DS1307 clock module also uses 0x68. To use both, pull AD0 high on the GY-521.'],
    links: [kit('lesson-16-gy-521-module.pdf'), kit('lesson-16-gy-521-module-datasheet.pdf', 'GY-521 / MPU-6050 sheet (local copy)'), kit('lesson-16-qmi8658c-datasheet.pdf', 'QMI8658C sheet, newer kits (local copy)'), ext('MPU-6000/6050 datasheet (TDK InvenSense)', 'https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf')],
  },
  {
    id: 'hcsr501', name: 'PIR motion sensor', part: 'HC-SR501', cat: 'Sensors', lesson: 17,
    blurb: 'Output goes HIGH (3.3 V) when it sees motion. Two pots set the sensitivity and the hold time.',
    layout: 'strip',
    pins: [[1,'VCC','+5 to 20V'],[2,'OUT','Digital out (3.3V high)'],[3,'GND','Ground']],
    wiring: [{ title: 'Kit lesson 17', rows: [['VCC','5V',''],['OUT','D7',''],['GND','GND',''],['(indicator)','D13','on-board LED']] }],
    notes: ['Jumper H = repeatable trigger (motion keeps it high), L = single trigger.', 'Give it about a minute after power-up to settle.'],
    links: [kit('lesson-17-hc-sr501-pir-sensor.pdf'), ext('PIR sensor guide (Adafruit, PDF)', 'https://cdn-learn.adafruit.com/downloads/pdf/pir-passive-infrared-proximity-motion-sensor.pdf')],
  },
  {
    id: 'water', name: 'Water level sensor', part: 'Water level module', cat: 'Sensors', lesson: 18,
    blurb: 'Exposed traces whose resistance drops as more of them is underwater. Read it as an analog value.',
    layout: 'strip',
    pins: [[1,'S','Analog out'],[2,'+','+5V'],[3,'−','Ground']],
    wiring: [{ title: 'Kit lesson 18', rows: [['S','A0',''],['+','5V',''],['−','GND','']] }],
    notes: ['The traces corrode when powered all the time. You can power + from a digital pin and switch it on only while reading.'],
    links: [kit('lesson-18-water-level-detection-sensor.pdf')],
  },
  {
    id: 'sound', name: 'Sound sensor', part: 'Microphone module', cat: 'Sensors', lesson: 20,
    blurb: 'Microphone with an LM393 comparator. AO is the raw level; DO goes high past the threshold set by the blue pot.',
    layout: 'strip',
    pins: [[1,'AO','Analog out'],[2,'G','Ground'],[3,'+','+5V'],[4,'DO','Digital out']],
    wiring: [{ title: 'Kit lesson 20', rows: [['AO','A0',''],['G','GND',''],['+','5V',''],['DO','D3',''],['(indicator)','D13','on-board LED']] }],
    notes: [],
    links: [kit('lesson-20-sound-sensor-module.pdf'), ext('LM393 comparator datasheet (TI)', 'https://www.ti.com/lit/ds/symlink/lm393.pdf')],
  },
  {
    id: 'rtc', name: 'Real-time clock', part: 'DS1307 RTC module', cat: 'Sensors', lesson: 19,
    blurb: 'Keeps the time on a coin cell when the board is off. Talks I2C.',
    layout: 'strip',
    pins: [[1,'GND','Ground'],[2,'VCC','+5V'],[3,'SDA','I2C data'],[4,'SCL','I2C clock']],
    wiring: [{ title: 'Kit lesson 19', rows: [['GND','GND',''],['VCC','5V',''],['SDA','D20','SDA'],['SCL','D21','SCL']] }],
    notes: ['I2C address 0x68, the same as the GY-521 by default.', 'The 2023 code download uses a DS3231 library for this lesson; the tutorial text describes the DS1307 module. The wiring is the same either way.'],
    links: [kit('lesson-19-ds1307-serial-real-time-clock-module.pdf'), ext('DS1307 datasheet (SparkFun mirror)', 'https://cdn.sparkfun.com/datasheets/BreakoutBoards/DS1307.pdf')],
  },
  {
    id: 'rc522', name: 'RFID reader', part: 'RC522 (MFRC522)', cat: 'Sensors', lesson: 21,
    blurb: '13.56 MHz reader for the kit card and key fob. Uses the Mega\'s hardware SPI pins.',
    layout: 'strip',
    pins: [[1,'SDA','SPI chip select (SS)'],[2,'SCK','SPI clock'],[3,'MOSI','SPI data in'],[4,'MISO','SPI data out'],[5,'IRQ','Interrupt (unused)'],[6,'GND','Ground'],[7,'RST','Reset'],[8,'3.3V','Power: 3.3V only']],
    wiring: [{ title: 'Kit lesson 21', rows: [['SDA','D53','SS'],['SCK','D52','SCK'],['MOSI','D51','MOSI'],['MISO','D50','MISO'],['IRQ','—','not connected'],['GND','GND',''],['RST','D5',''],['3.3V','3V3','not 5V!']] }],
    notes: ['Power it from 3.3V. 5V on the supply pin can damage the reader.', 'On an Uno the SPI pins are 10–13; on the Mega they are 50–53. Sketches written for an Uno need the pins changed.'],
    links: [kit('lesson-21-mfrc522-rfid-module.pdf'), ext('MFRC522 library (pin table for each board)', 'https://github.com/miguelbalboa/rfid')],
  },
  {
    id: 'joystick', name: 'Analog joystick', part: 'Joystick module', cat: 'Input', lesson: 13,
    blurb: 'Two pots (X and Y) plus a push switch. About 512 at rest on each axis.',
    layout: 'strip',
    pins: [[1,'GND','Ground'],[2,'+5V','Power'],[3,'VRx','X axis (analog)'],[4,'VRy','Y axis (analog)'],[5,'SW','Push switch (to GND)']],
    wiring: [{ title: 'Kit lesson 13', rows: [['GND','GND',''],['+5V','5V',''],['VRx','A0',''],['VRy','A1',''],['SW','D2','INPUT_PULLUP']] }],
    notes: ['The switch floats when not pressed, so use pinMode(2, INPUT_PULLUP). It reads LOW when pressed.'],
    links: [kit('lesson-13-analog-joystick-module.pdf')],
  },
  {
    id: 'keypad', name: '4×4 membrane keypad', part: 'Membrane switch module', cat: 'Input', lesson: 11,
    blurb: '16 keys on 8 wires, as a matrix of 4 rows × 4 columns. Pin 1 is on the left with the keys facing you.',
    layout: 'strip',
    pins: [[1,'R1','Row 1 (1 2 3 A)'],[2,'R2','Row 2 (4 5 6 B)'],[3,'R3','Row 3 (7 8 9 C)'],[4,'R4','Row 4 (* 0 # D)'],[5,'C1','Column 1'],[6,'C2','Column 2'],[7,'C3','Column 3'],[8,'C4','Column 4']],
    wiring: [{ title: 'Kit lesson 11', rows: [['R1','D9',''],['R2','D8',''],['R3','D7',''],['R4','D6',''],['C1','D5',''],['C2','D4',''],['C3','D3',''],['C4','D2','']] }],
    notes: ['Code: byte rowPins[4] = {9, 8, 7, 6}; byte colPins[4] = {5, 4, 3, 2};'],
    links: [kit('lesson-11-membrane-switch-module.pdf'), ext('Keypad library', 'https://github.com/Chris--A/Keypad')],
  },
  {
    id: 'ir', name: 'IR receiver + remote', part: 'AX-1838HS module', cat: 'Input', lesson: 14,
    blurb: 'Decodes the 38 kHz signal from the kit remote. The output idles high and pulses low.',
    layout: 'strip',
    pins: [[1,'−','Ground'],[2,'+','+5V (middle pin)'],[3,'S','Signal out']],
    wiring: [
      { title: 'Kit lesson 14', rows: [['−','GND',''],['+','5V',''],['S','D11','']] },
      { title: 'Kit lesson 32 (with the stepper)', rows: [['S','D12','']] },
    ],
    notes: ['IRremote 3 and later changed its API. Use the library version bundled with the kit if the lesson sketch will not compile.'],
    links: [kit('lesson-14-ax-1838hs-ir-receiver.pdf'), kit('lesson-14-ir-remote-control.pdf', 'Kit remote sheet (local copy)'), ext('IRremote library', 'https://github.com/Arduino-IRremote/Arduino-IRremote')],
  },
  {
    id: 'encoder', name: 'Rotary encoder', part: 'Rotary encoder module', cat: 'Input', lesson: 33,
    blurb: 'Endless knob with a push switch. CLK and DT pulse out of step, and which one leads gives the direction.',
    layout: 'strip',
    pins: [[1,'CLK','Output A'],[2,'DT','Output B'],[3,'SW','Push switch'],[4,'+','+5V'],[5,'GND','Ground']],
    wiring: [{ title: 'Kit lesson 33', rows: [['CLK','D2','interrupt 0'],['DT','D3',''],['SW','D4',''],['+','5V',''],['GND','GND','']] }],
    notes: ['CLK is on pin 2 so attachInterrupt(0, …) catches every step.'],
    links: [kit('lesson-33-rotary-encode-module.pdf')],
  },
  {
    id: 'buttons', name: 'Push buttons', part: '4-pin tactile switch', cat: 'Input', lesson: 5,
    blurb: 'The pins on each side are joined in pairs. Pressing the button connects the two pairs.',
    layout: 'dual',
    pins: [[1,'1','Joined to 2'],[2,'2','Joined to 1'],[3,'3','Joined to 4'],[4,'4','Joined to 3']],
    wiring: [{ title: 'Kit lesson 5', rows: [['Button A','D9','INPUT_PULLUP, other leg to GND'],['Button B','D8','INPUT_PULLUP, other leg to GND'],['LED (+220Ω)','D5','']] }],
    notes: ['With INPUT_PULLUP, a pressed button reads LOW.'],
    links: [kit('lesson-5-button.pdf')],
  },
  {
    id: 'tilt', name: 'Tilt ball switch', part: 'Ball switch', cat: 'Input', lesson: 8,
    blurb: 'A metal ball closes the contacts when the switch is upright.',
    layout: 'strip',
    pins: [[1,'1','Contact'],[2,'2','Contact']],
    wiring: [{ title: 'Kit lesson 8', rows: [['Leg 1','D2','INPUT_PULLUP'],['Leg 2','GND',''],['(indicator)','D13','on-board LED']] }],
    notes: [],
    links: [kit('lesson-8-ball-switch.pdf')],
  },
  {
    id: 'sg90', name: 'Servo motor', part: 'SG90', cat: 'Motors and switching', lesson: 9,
    blurb: 'Turns to a 0–180° position set by a 50 Hz pulse.',
    layout: 'strip',
    pins: [[1,'Brown','Ground'],[2,'Red','+5V'],[3,'Orange','Signal']],
    wiring: [{ title: 'Kit lesson 9', rows: [['Brown','GND',''],['Red','5V',''],['Orange','D9','myservo.attach(9)']] }],
    notes: ['On the Mega the Servo library uses Timer5, so analogWrite() stops working on pins 44, 45 and 46 while a servo is attached.', 'More than one servo, or a servo under load, should run from the power supply module rather than the Mega\'s 5V.'],
    links: [kit('lesson-9-sg90-servo-motor.pdf'), ext('Servo library', 'https://docs.arduino.cc/libraries/servo/')],
  },
  {
    id: 'stepper', name: 'Stepper motor + driver', part: '28BYJ-48 + ULN2003', cat: 'Motors and switching', lesson: 31,
    blurb: '5V geared stepper, 2048 steps per turn of the output shaft. The ULN2003 board does the switching.',
    layout: 'strip',
    pins: [[1,'IN1','Coil A'],[2,'IN2','Coil B'],[3,'IN3','Coil C'],[4,'IN4','Coil D'],[5,'−','Ground'],[6,'+','5–12V motor power']],
    wiring: [{ title: 'Kit lessons 31–33', rows: [['IN1','D8',''],['IN2','D9',''],['IN3','D10',''],['IN4','D11',''],['−','GND','shared with the Mega'],['+','Power module 5V','not the Mega 5V pin']] }],
    notes: ['Code: Stepper myStepper(2048, 8, 10, 9, 11); The order 8, 10, 9, 11 is deliberate. It puts the coils in the right firing order for this motor.', 'Keep the speed at or below about 15 rpm.'],
    links: [kit('lesson-31-28byj-48-stepper-motor.pdf'), kit('lesson-31-uln2003a-stepper-motor-driver.pdf', 'ULN2003A sheet (local copy)'), ext('ULN2003A datasheet (TI)', 'https://www.ti.com/lit/ds/symlink/uln2003a.pdf'), ext('28BYJ-48 datasheet (Mouser)', 'https://www.mouser.com/datasheet/2/758/stepd-01-data-sheet-1143075.pdf'), ext('Stepper library', 'https://docs.arduino.cc/libraries/stepper/')],
  },
  {
    id: 'l293d', name: 'Motor driver chip', part: 'L293D', cat: 'Motors and switching', lesson: 29,
    blurb: 'Dual H-bridge, 600 mA per channel. Drives the kit DC motor (lesson 29) and the relay coil (lesson 30).',
    layout: 'dual',
    pins: [[1,'EN1,2','Enable left side (PWM = speed)'],[2,'1A','Input 1'],[3,'1Y','Output 1 → motor'],[4,'GND','Ground / heat sink'],[5,'GND','Ground / heat sink'],[6,'2Y','Output 2 → motor'],[7,'2A','Input 2'],[8,'VCC2','Motor supply'],
           [9,'EN3,4','Enable right side'],[10,'3A','Input 3'],[11,'3Y','Output 3'],[12,'GND','Ground'],[13,'GND','Ground'],[14,'4Y','Output 4'],[15,'4A','Input 4'],[16,'VCC1','Logic supply 5V']],
    wiring: [
      { title: 'Kit lesson 29 (DC motor)', rows: [['EN1,2 (1)','D5','PWM speed'],['1A (2)','D3','direction'],['2A (7)','D4','direction'],['1Y (3), 2Y (6)','Motor','the two motor wires'],['VCC1 (16)','5V',''],['VCC2 (8)','Power module 5V','motor supply'],['GND (4, 5, 12, 13)','GND','']] },
      { title: 'Kit lesson 30 (relay)', rows: [['EN1,2 (1)','D5',''],['1A (2)','D4',''],['2A (7)','D3','']] },
    ],
    notes: ['Pin 16 (VCC1) must be powered or the chip does nothing.', 'Notch on the left: pins 1–8 along the bottom, 9–16 back along the top.'],
    links: [kit('lesson-29-l293d-quadruple-half-h-driver.pdf'), ext('L293/L293D datasheet (TI)', 'https://www.ti.com/lit/ds/symlink/l293.pdf'), kit('lesson-29-130-dc-motor.pdf', '130 DC motor sheet (local copy)')],
  },
  {
    id: 'relay', name: '5V relay', part: 'SRD-05VDC-SL-C', cat: 'Motors and switching', lesson: 30,
    blurb: 'A 5V coil switches a separate circuit. COM connects to NC at rest and to NO when the coil is energised.',
    layout: 'strip',
    pins: [[1,'COIL','Coil'],[2,'COIL','Coil'],[3,'COM','Common'],[4,'NO','Normally open'],[5,'NC','Normally closed']],
    wiring: [{ title: 'Kit lesson 30', rows: [['Coil','L293D output','driven by the L293D, not straight from a pin'],['COM / NO','Motor circuit','the relay switches the motor']] }],
    notes: ['The coil draws about 70 mA, more than a Mega pin can give (20 mA). Drive it through the L293D or a transistor with a flyback diode (1N4007).'],
    links: [kit('lesson-30-srd-05vdc-sl-c-relay.pdf'), kit('pn2222-npn-bipolar-transistors.pdf', 'PN2222 transistor sheet (local copy)'), kit('1n4007-diode.pdf', '1N4007 diode sheet (local copy)')],
  },
  {
    id: '74hc595', name: 'Shift register', part: '74HC595', cat: 'Chips', lesson: 24,
    blurb: 'Turns 3 Arduino pins into 8 outputs. Chain more chips from Q7\' for more outputs.',
    layout: 'dual',
    pins: [[1,'Q1','Output 1'],[2,'Q2','Output 2'],[3,'Q3','Output 3'],[4,'Q4','Output 4'],[5,'Q5','Output 5'],[6,'Q6','Output 6'],[7,'Q7','Output 7'],[8,'GND','Ground'],
           [9,"Q7'",'Serial out (to the next chip)'],[10,'MR','Master reset, active low → 5V'],[11,'SH_CP','Shift clock (SRCLK)'],[12,'ST_CP','Latch (RCLK)'],[13,'OE','Output enable, active low → GND'],[14,'DS','Serial data in'],[15,'Q0','Output 0'],[16,'VCC','+5V']],
    wiring: [
      { title: 'Kit lessons 24–26 (8 LEDs)', rows: [['DS (14)','D12','data'],['ST_CP (12)','D11','latch'],['SH_CP (11)','D9','clock'],['VCC (16), MR (10)','5V',''],['GND (8), OE (13)','GND',''],['Q0–Q7','LEDs','each through 220Ω']] },
      { title: 'Kit lesson 27 (1-digit display)', rows: [['DS (14)','D2',''],['ST_CP (12)','D3',''],['SH_CP (11)','D4','']] },
      { title: 'Kit lesson 28 (4-digit display)', rows: [['DS (14)','D8',''],['ST_CP (12)','D9',''],['SH_CP (11)','D10','']] },
    ],
    notes: ['Pull the latch LOW, shiftOut() 8 bits, then pull the latch HIGH to update all 8 outputs at once.', 'Notch on the left: pins 1–8 along the bottom, 9–16 back along the top.'],
    links: [kit('lesson-24-74hc595.pdf'), ext('SN74HC595 datasheet (TI)', 'https://www.ti.com/lit/ds/symlink/sn74hc595.pdf'), ext('shiftOut() reference', 'https://docs.arduino.cc/language-reference/en/functions/advanced-io/shiftOut/')],
  },
  {
    id: 'rgb', name: 'RGB LED', part: 'Common cathode RGB LED', cat: 'Basic parts', lesson: 4,
    blurb: 'Three LEDs in one package. The longest leg is the shared cathode.',
    layout: 'strip',
    pins: [[1,'R','Red anode'],[2,'GND','Common cathode (longest leg)'],[3,'G','Green anode'],[4,'B','Blue anode']],
    wiring: [{ title: 'Kit lesson 4', rows: [['R','D6','220Ω, PWM'],['GND','GND',''],['G','D5','220Ω, PWM'],['B','D3','220Ω, PWM']] }],
    notes: ['All three colour pins are on PWM pins so analogWrite() can mix colours.'],
    links: [kit('lesson-4-rgb-led.pdf')],
  },
  {
    id: 'buzzers', name: 'Buzzers', part: 'Active and passive buzzer', cat: 'Basic parts', lesson: 6,
    blurb: 'The active buzzer beeps at one pitch when given 5V. The passive one needs a tone() signal and can play notes.',
    layout: 'strip',
    pins: [[1,'+','Positive (longer leg)'],[2,'−','Negative']],
    wiring: [
      { title: 'Kit lesson 6 (active)', rows: [['+','D12',''],['−','GND','']] },
      { title: 'Kit lesson 7 (passive)', rows: [['+','D8','tone(8, …)'],['−','GND','']] },
    ],
    notes: ['The active buzzer has a sealed back. The passive buzzer shows a green circuit board underneath.', 'tone() uses Timer2, so PWM on pins 9 and 10 is affected while it plays.'],
    links: [kit('lesson-6-active-buzzer.pdf'), kit('lesson-7-passive-buzzer.pdf', 'Passive buzzer sheet (local copy)'), SOURCES.tone],
  },
  {
    id: 'thermistor', name: 'Thermistor', part: 'MF52D 10k NTC', cat: 'Basic parts', lesson: 23,
    blurb: 'Its resistance falls as it gets warmer. Pair it with a 10k resistor as a voltage divider.',
    layout: 'strip',
    pins: [[1,'1','Leg'],[2,'2','Leg']],
    wiring: [{ title: 'Kit lesson 23', rows: [['Leg 1','5V',''],['Leg 2','A0','plus 10k resistor from A0 to GND'],['LCD','D7–D12','same wiring as lesson 22']] }],
    notes: ['B value 3950, 10kΩ at 25°C.'],
    links: [kit('lesson-23-mf52d-103f-3950-ntc-thermistor.pdf')],
  },
  {
    id: 'photocell', name: 'Photoresistor', part: 'CDS-55 LDR', cat: 'Basic parts', lesson: 26,
    blurb: 'Its resistance drops in bright light. Read it through a voltage divider.',
    layout: 'strip',
    pins: [[1,'1','Leg'],[2,'2','Leg']],
    wiring: [{ title: 'Kit lesson 26', rows: [['Leg 1','5V',''],['Leg 2','A0','plus 1k resistor from A0 to GND'],['74HC595','D12, D11, D9','same as lesson 24']] }],
    notes: [],
    links: [kit('lesson-26-cds-55-photoresistor.pdf')],
  },
  {
    id: 'pot', name: 'Potentiometer', part: '10k potentiometer', cat: 'Basic parts', lesson: 22,
    blurb: 'Outer legs to 5V and GND; the middle leg (wiper) gives 0–5V.',
    layout: 'strip',
    pins: [[1,'1','End (5V)'],[2,'W','Wiper'],[3,'3','End (GND)']],
    wiring: [{ title: 'Typical', rows: [['1','5V',''],['W','A0','or LCD V0'],['3','GND','']] }],
    notes: [],
    links: [kit('lesson-22-spain-potentiometer.pdf')],
  },
  {
    id: 'power', name: 'Breadboard power supply', part: 'MB-V2 module', cat: 'Power', lesson: 29,
    blurb: 'Plugs into both breadboard rails. It powers motors and servos so they don\'t load the Mega\'s regulator.',
    layout: 'strip',
    pins: [[1,'IN','6.5–9V DC barrel (centre +)'],[2,'L rail','Jumper: 5V / OFF / 3.3V'],[3,'R rail','Jumper: 5V / OFF / 3.3V'],[4,'USB','5V out'],[5,'Header','5V, 3.3V, GND pins']],
    wiring: [{ title: 'Kit lessons 29–31', rows: [['− rail','GND','connect its GND to the Mega GND'],['+ rail','Motor supply','L293D pin 8, ULN2003 +']] }],
    notes: ['700 mA max. Line up the module\'s − pin with the blue breadboard rail.', 'If both jumpers are OFF, the LED and rails stay off.'],
    links: [kit('breadboard-power-supply-module.pdf')],
  },
];

// ATmega2560 port/bit for each Arduino digital pin (from the Mega 2560 schematic).
const PORTS = {
  0:'PE0',1:'PE1',2:'PE4',3:'PE5',4:'PG5',5:'PE3',6:'PH3',7:'PH4',8:'PH5',9:'PH6',10:'PB4',11:'PB5',12:'PB6',13:'PB7',
  14:'PJ1',15:'PJ0',16:'PH1',17:'PH0',18:'PD3',19:'PD2',20:'PD1',21:'PD0',
  22:'PA0',23:'PA1',24:'PA2',25:'PA3',26:'PA4',27:'PA5',28:'PA6',29:'PA7',
  30:'PC7',31:'PC6',32:'PC5',33:'PC4',34:'PC3',35:'PC2',36:'PC1',37:'PC0',
  38:'PD7',39:'PG2',40:'PG1',41:'PG0',42:'PL7',43:'PL6',44:'PL5',45:'PL4',46:'PL3',47:'PL2',48:'PL1',49:'PL0',
  50:'PB3',51:'PB2',52:'PB1',53:'PB0',
};
const PWM = { 2:'OC3B',3:'OC3C',4:'OC0B',5:'OC3A',6:'OC4A',7:'OC4B',8:'OC4C',9:'OC2B',10:'OC2A',11:'OC1A',12:'OC1B',13:'OC0A (also OC1C)',44:'OC5C',45:'OC5B',46:'OC5A' };
// attachInterrupt(n): Arduino interrupt number per pin
const INTS = { 2:0, 3:1, 21:2, 20:3, 19:4, 18:5 };
const SERIAL = { 0:'RX0 (Serial, USB)',1:'TX0 (Serial, USB)',19:'RX1 (Serial1)',18:'TX1 (Serial1)',17:'RX2 (Serial2)',16:'TX2 (Serial2)',15:'RX3 (Serial3)',14:'TX3 (Serial3)' };
const PCINT = { 53:0,52:1,51:2,50:3,10:4,11:5,12:6,13:7,0:8,15:9,14:10 };
const SPECIAL = { 20:'SDA (I2C data)', 21:'SCL (I2C clock)', 50:'CIPO / MISO (SPI data in)', 51:'COPI / MOSI (SPI data out)', 52:'SCK (SPI clock)', 53:'CS / SS (SPI chip select)', 13:'On-board LED "L"' };

const POWER = {
  '5V':   { name: '5V', desc: 'Regulated 5V. From USB, or from the on-board regulator when powered through the barrel jack or VIN.', tags: ['power'] },
  '3V3':  { name: '3.3V', desc: 'Regulated 3.3V output, 50 mA max. Use this for the RC522 RFID reader.', tags: ['power'] },
  'GND':  { name: 'GND', desc: 'Ground. All the GND pins are connected together.', tags: ['power'] },
  'VIN':  { name: 'VIN', desc: 'Input voltage from the barrel jack. Rev3 datasheet (rev 4, Oct 2026): 7–12V recommended. You can also feed 7–12V in here.', tags: ['power'] },
  'IOREF':{ name: 'IOREF', desc: 'Tells shields the board\'s logic voltage. Connected to 5V on the Mega. Only Rev3 boards have this pin.', tags: ['power'] },
  'RESET':{ name: 'RESET', desc: 'Pull LOW to reset the microcontroller.', tags: ['power'] },
  'AREF': { name: 'AREF', desc: 'Reference voltage for analogRead(). Only used with analogReference(EXTERNAL).', tags: ['analog'] },
  'NC':   { name: 'NC', desc: 'Not connected.', tags: [] },
};

// Device-type colours (also used for the board highlight).
const CAT_COLORS = {
  'Displays': 'var(--cat-display)', 'Sensors': 'var(--cat-sensor)', 'Input': 'var(--cat-input)',
  'Motors and switching': 'var(--cat-motor)', 'Chips': 'var(--cat-chip)', 'Basic parts': 'var(--cat-basic)', 'Power': 'var(--cat-power)',
};
const CAT_KEYS = { 'Displays': 'display', 'Sensors': 'sensor', 'Input': 'input', 'Motors and switching': 'motor', 'Chips': 'chip', 'Basic parts': 'basic', 'Power': 'power' };

// Current board revision facts (Arduino Mega 2560 Rev3 datasheet, rev 4, modified 21/10/2026).
const BOARD = {
  rev: 'Rev3',
  sheet: 'Datasheet rev 4 (20 Oct 2026)',
  facts: [
    ['Microcontroller', 'ATmega2560, 16 MHz, 5V logic'],
    ['USB chip', 'ATmega16U2 (USB-B). Some clone boards use a CH340 chip instead; Linux has the driver built in.'],
    ['Genuine or clone?', 'Plug it in and run lsusb (Linux) or check Device Manager (Windows). USB ID 2341:0042 "Arduino Mega 2560 R3" means the ATmega16U2 chip, shown as /dev/ttyACM0 or a COM port. 1a86:7523 means a CH340 clone, shown as /dev/ttyUSB0.'],
    ['PWM pins', '15: pins 2–13 and 44–46'],
    ['Max current', '20 mA per I/O pin, 50 mA from the 3.3V pin'],
    ['VIN / DC jack', '7–12V recommended'],
    ['USB power', '4.8–5.5V'],
    ['Memory', '256 KB flash (8 KB bootloader), 8 KB SRAM, 4 KB EEPROM'],
  ],
  howToTell: [
    'An IOREF pin next to RESET on the power header (Rev3 only).',
    'A second SDA/SCL pair next to AREF (Rev3 only).',
    'A small chip marked 16U2 beside the USB socket (older boards had an 8U2).',
  ],
  outdated: 'ELEGOO\'s board sheet in the kit download dates from 2018. It says 14 PWM pins, an ATmega8U2 USB chip and 40 mA per pin. The current Rev3 datasheet says 15 PWM pins, an ATmega16U2 and 20 mA per pin, and this site follows the current datasheet.',
};

// Resistor values in the kit's resistor pack (1% metal film, 5 colour bands).
const KIT_RESISTORS = [
  ['10Ω',   ['brown','black','black','gold','brown']],
  ['100Ω',  ['brown','black','black','black','brown']],
  ['220Ω',  ['red','red','black','black','brown']],
  ['330Ω',  ['orange','orange','black','black','brown']],
  ['1kΩ',   ['brown','black','black','brown','brown']],
  ['2kΩ',   ['red','black','black','brown','brown']],
  ['5.1kΩ', ['green','brown','black','brown','brown']],
  ['10kΩ',  ['brown','black','black','red','brown']],
  ['100kΩ', ['brown','black','black','orange','brown']],
  ['1MΩ',   ['brown','black','black','yellow','brown']],
];

// Where each part needs resistors: [where, value, why]. An empty list means none are needed (the reason goes in RES_NONE).
const RESISTORS = {
  '5461as': [
    ['Each digit pin (12, 9, 8, 6), between the display and the Mega', '4 × 220Ω', 'The direct wiring above. Each digit draws at most about 14 mA, under the 20 mA pin limit. Digits with more segments lit look dimmer.'],
    ['Even brightness, option 1: each segment pin (A–G, DP)', '8 × 2kΩ', 'About 1.5 mA per segment, so a full "8." is 12 mA through the digit pin. Dimmer, but safe without transistors.'],
    ['Even brightness, option 2: each segment pin, plus a PN2222 per digit', '8 × 220Ω on the segments, 4 × 1kΩ to the transistor bases', 'Bright and even. The transistors carry the digit current, so a digit pin HIGH turns that digit on.'],
  ],
  '5161as': [['Each segment pin (A–G, DP), between the 74HC595 and the display', '8 × 220Ω (lesson) or 330Ω', 'The 74HC595 can supply about 70 mA in total. With 330Ω, all 8 segments together stay under that.']],
  '74hc595': [['Each output (Q0–Q7) to its LED', '8 × 220Ω (lesson) or 330Ω', 'One per LED. The chip\'s 70 mA total limit means 330Ω is safer when all 8 are on.']],
  'lcd1602': [
    ['V0 (pin 3), contrast', '10kΩ potentiometer', 'Wiper to V0, ends to 5V and GND.'],
    ['A (pin 15), backlight', '220Ω if your module has no backlight resistor', 'Many LCD1602 boards have one on the back (often marked 101 or 151). If the backlight is very bright or hot, add one.'],
  ],
  'rgb': [['Each colour leg (R, G, B)', '3 × 220Ω', 'One per colour, never one shared resistor on the common leg.']],
  'buttons': [
    ['Button inputs', 'None with INPUT_PULLUP', 'The Mega\'s built-in pull-up (about 20–50kΩ) holds the pin HIGH. Without it, use a 10kΩ from the pin to GND.'],
    ['The lesson LED', '220Ω', 'Limits the LED to about 14 mA.'],
  ],
  'thermistor': [['From A0 to GND (the other half of the divider)', '10kΩ', 'Matches the thermistor\'s 10kΩ at 25°C, so the reading sits mid-range at room temperature.']],
  'photocell': [
    ['From A0 to GND (the other half of the divider)', '1kΩ (lesson) or 10kΩ', '1kΩ suits bright light. 10kΩ gives a wider range indoors.'],
    ['74HC595 LEDs', '8 × 220Ω', 'Same as lesson 24.'],
  ],
  'relay': [['Mega pin to the transistor base, if you drive the coil with a PN2222 instead of the L293D', '1kΩ, plus a 1N4007 diode across the coil', 'The diode soaks up the voltage spike when the coil switches off.']],
  'rc522': [['Optional, for long-term use: SCK, MOSI and SDA lines', '1kΩ + 2kΩ divider on each line', 'Brings the Mega\'s 5V signals down to about 3.3V. The kit lesson wires them directly.']],
  'buzzers': [['In series with the buzzer (optional)', '100Ω', 'The lesson connects it directly. A 100Ω keeps the current comfortably under 20 mA.']],
  'tilt': [['Switch input', 'None with INPUT_PULLUP', 'The built-in pull-up holds the pin HIGH. Otherwise use a 10kΩ pull-up to 5V.']],
};
const RES_NONE = {
  max7219: 'The module has its own current-setting resistor.',
  hcsr04: 'Connect it directly. Echo is a 5V signal, which the Mega accepts.',
  dht11: 'The module has a pull-up built in. A bare 4-pin DHT11 needs a 10kΩ from DATA to 5V.',
  gy521: 'The module has I2C pull-up resistors built in.',
  hcsr501: 'Connect it directly.',
  water: 'Connect it directly. The module has its own resistors.',
  sound: 'Connect it directly. The module has its own resistors.',
  rtc: 'The module has I2C pull-up resistors built in.',
  joystick: 'None. Use INPUT_PULLUP for the switch.',
  keypad: 'None. The Keypad library turns on the internal pull-ups.',
  ir: 'Connect it directly.',
  encoder: 'The module has pull-ups on CLK and DT. Use INPUT_PULLUP for SW.',
  sg90: 'Connect it directly.',
  stepper: 'Connect it directly. The ULN2003 board does the switching.',
  l293d: 'Connect it directly. Its outputs have clamp diodes built in.',
  pot: 'None. It is a resistor itself.',
  power: 'None.',
};
