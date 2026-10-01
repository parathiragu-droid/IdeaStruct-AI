import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const backendFixturesDir = path.join(projectRoot, 'backend', 'src', 'main', 'resources', 'fixtures');
const sharedFixturesDir = path.join(projectRoot, 'shared', 'fixtures');

const baseHardwarePath = path.join(sharedFixturesDir, 'hardware_blueprint.json');
const baseHardware = JSON.parse(fs.readFileSync(baseHardwarePath, 'utf8'));

// =========================================================================
// 1. SMART PARKING OCCUPANCY DETECTOR
// =========================================================================
const parkingBlueprint = {
  ...baseHardware,
  overview: {
    projectName: "SpotSense — Overhead Smart Parking Bay Occupancy Detector",
    summary: "SpotSense is an intelligent overhead parking sensor unit designed for multi-level garages. It continuously measures vehicle presence using ultrasonic sonar telemetry, signals slot availability with a high-intensity 360-degree RGB beacon, sounds proximity warnings, and displays bay status on an integrated OLED display.",
    problemStatement: "Drivers spend an average of 15 minutes searching for vacant spots in enclosed parking garages, producing excess emissions and traffic congestion due to lack of real-time slot occupancy sensing.",
    targetUsers: [
      "Parking Garage Operators",
      "Smart City Infrastructure Engineers",
      "Commercial Facility Managers"
    ],
    goals: [
      "Detect vehicle presence within 5cm to 350cm ceiling range in under 150ms",
      "Drive visual green/red RGB beacon for driver guidance visible from 50 meters",
      "Provide local I2C OLED display for bay ID, distance telemetry, and technician calibration"
    ],
    scope: [
      "Downward-facing HC-SR04 ultrasonic distance rangefinder",
      "WS2812B high-brightness RGB status indicator dome",
      "ESP32 dual-core microcontroller with WiFi/BLE telemetry",
      "0.96 inch I2C SSD1306 OLED bay status panel",
      "Piezo acoustic reverse warning buzzer",
      "12V DC input with onboard step-down buck converter"
    ],
    outOfScope: [
      "Automatic License Plate Recognition (ALPR) camera optical unit",
      "Payment processing POS payment terminal",
      "Motorized physical barrier gate actuation"
    ]
  },
  features: [
    {
      id: "feature-vehicle-ranging",
      name: "Ultrasonic Bay Range Finding",
      description: "Emits 40kHz acoustic pulses to measure distance to vehicle roof or floor slab.",
      priority: "HIGH",
      roleIds: ["role-parking-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-rgb-signaling",
      name: "Overhead RGB Beacon Guidance",
      description: "Illuminates ultra-bright green (vacant) or red (occupied) indicator ring for driver visibility.",
      priority: "HIGH",
      roleIds: ["role-parking-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-oled-telemetry",
      name: "Bay Status & Metric Display",
      description: "Shows live clearance distance, occupancy state, and assigned bay identifier.",
      priority: "MEDIUM",
      roleIds: ["role-parking-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-proximity-alarm",
      name: "Over-Height Acoustic Warning",
      description: "Sounds intermittent buzzer alert if a high-profile vehicle approaches ceiling hazard threshold.",
      priority: "MEDIUM",
      roleIds: ["role-parking-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-parking-operator",
      name: "Garage Operations Engineer",
      description: "Configures parking bay ceiling height thresholds and monitors bay occupancy metrics.",
      permissions: ["configure_bay_thresholds", "inspect_live_distance", "run_beacon_diagnostic"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-sonar-accuracy",
      type: "FUNCTIONAL",
      description: "Ultrasonic sensor shall sample distance at 5Hz with accuracy within ±1cm.",
      featureIds: ["feature-vehicle-ranging"],
      acceptanceCriteria: ["Sample filtering algorithm rejects false transient echoes", "Latency under 200ms"],
      source: "USER_STATED"
    },
    {
      id: "req-rgb-states",
      type: "FUNCTIONAL",
      description: "RGB indicator shall support GREEN (vacant), RED (occupied), and BLUE (reserved) modes.",
      featureIds: ["feature-rgb-signaling"],
      acceptanceCriteria: ["Color transition occurs synchronously with occupancy state change"],
      source: "USER_STATED"
    }
  ],
  hardware: {
    applicable: true,
    workingPrinciple: "Overhead ultrasonic transducer fires periodic sonic bursts towards the parking bay floor. When a vehicle occupies the slot, reflected pulse transit time drops significantly. The ESP32 parses distance thresholds, drives the WS2812B RGB light ring green/red, and outputs bay statistics over I2C to the OLED screen.",
    architecture: {
      controllerArchitecture: "ESP32 Tensilica Dual-Core 32-bit MCU (240MHz)",
      sensorSubsystems: ["Ultrasonic Distance Transceiver (HC-SR04/RCWL-1601)"],
      actuatorSubsystems: ["WS2812B NeoPixel RGB Guidance Ring", "Acoustic Warning Buzzer"],
      displaySubsystems: ["0.96 inch SSD1306 Monochrome I2C OLED (128x64)"],
      powerArchitecture: "12V DC input stepped down to 5.0V via LM2596 buck regulator, with secondary 3.3V LDO for ESP32/OLED."
    },
    components: [
      {
        id: "comp-esp32",
        name: "ESP32 DevKit V1 Microcontroller",
        category: "MICROCONTROLLER",
        purpose: "Main processing unit for distance timing, RGB animation, and OLED driving",
        quantity: 1,
        specification: "Dual-core Xtensa 240MHz, 520KB SRAM, 4MB Flash, WiFi & BLE",
        estimatedUnitCost: "$5.50",
        estimatedTotalCost: "$5.50"
      },
      {
        id: "comp-ultrasonic",
        name: "HC-SR04 Ultrasonic Distance Sensor",
        category: "SENSOR",
        purpose: "Continuous downward distance measurement to detect vehicle presence",
        quantity: 1,
        specification: "40kHz acoustic burst, 2cm-400cm range, 5V supply, 15mA current",
        estimatedUnitCost: "$2.20",
        estimatedTotalCost: "$2.20"
      },
      {
        id: "comp-rgb-led",
        name: "WS2812B NeoPixel RGB LED Ring",
        category: "ACTUATOR",
        purpose: "High-intensity green/red/blue visual status beacon for motorists",
        quantity: 1,
        specification: "8-LED circular ring, single-wire digital control, 5V supply, 60mA/LED peak",
        estimatedUnitCost: "$3.80",
        estimatedTotalCost: "$3.80"
      },
      {
        id: "comp-piezo",
        name: "Active Piezo Warning Buzzer",
        category: "ACTUATOR",
        purpose: "Acoustic obstacle and ceiling height breach alert",
        quantity: 1,
        specification: "5V active buzzer, 85dB SPL at 10cm, 2.3kHz resonant frequency",
        estimatedUnitCost: "$0.80",
        estimatedTotalCost: "$0.80"
      },
      {
        id: "comp-oled",
        name: "0.96 inch SSD1306 OLED Display",
        category: "DISPLAY",
        purpose: "Local bay identifier and metric telemetry readout",
        quantity: 1,
        specification: "128x64 pixels, I2C address 0x3C, 3.3V logic, monochrome white",
        estimatedUnitCost: "$3.50",
        estimatedTotalCost: "$3.50"
      },
      {
        id: "comp-power",
        name: "12V to 5V DC Buck Converter & Barrel Jack",
        category: "POWER",
        purpose: "Steps down central garage 12V DC bus to regulated 5V system rail",
        quantity: 1,
        specification: "LM2596 buck converter, 12V input, 5V 2A output with thermal shutdown",
        estimatedUnitCost: "$2.80",
        estimatedTotalCost: "$2.80"
      }
    ],
    controllers: [
      {
        id: "ctrl-esp32",
        name: "ESP32 DevKit V1",
        type: "MCU",
        clockSpeed: "240MHz",
        flashMemory: "4MB",
        ram: "520KB",
        gpioCount: 30,
        communicationBuses: ["I2C", "SPI", "UART", "WiFi", "BLE"]
      }
    ],
    sensors: [
      {
        id: "sens-sonar",
        name: "HC-SR04 Ultrasonic Sensor",
        type: "Acoustic Rangefinder",
        interface: "Digital Trigger & Echo Pulse",
        measurementRange: "2cm to 400cm",
        accuracy: "±3mm",
        samplingRate: "5 Hz"
      }
    ],
    actuators: [
      {
        id: "act-rgb",
        name: "WS2812B NeoPixel Ring",
        type: "Individually Addressable RGB LED",
        driveSignal: "Single-wire NRZ 800kHz pulse timing",
        maxCurrent: "240mA"
      },
      {
        id: "act-buzzer",
        name: "Active Piezo Buzzer",
        type: "Acoustic Transducer",
        driveSignal: "Digital GPIO HIGH/LOW",
        maxCurrent: "25mA"
      }
    ],
    communicationModules: [
      {
        id: "comm-wifi",
        name: "ESP32 2.4GHz WiFi",
        protocol: "IEEE 802.11 b/g/n",
        purpose: "Transmits bay occupancy JSON state packets to central garage broker"
      }
    ],
    powerRequirements: {
      operatingVoltage: "5.0V DC main rail, 3.3V logic rail",
      powerSource: "Central 12V DC garage line stepped down locally to 5V 2A",
      estimatedCurrentDraw: "Nominal 110mA; Peak 310mA with all RGB LEDs illuminated"
    },
    pinConnections: [
      "ESP32 Vin <-> 5V DC Regulator Rail",
      "ESP32 GND <-> Common System Ground",
      "ESP32 GPIO5 <-> HC-SR04 Ultrasonic Trigger",
      "ESP32 GPIO18 <-> HC-SR04 Ultrasonic Echo (via 1k/2k voltage divider)",
      "ESP32 GPIO19 <-> WS2812B RGB Data Input (DIN)",
      "ESP32 GPIO21 (SDA) <-> SSD1306 OLED SDA",
      "ESP32 GPIO22 (SCL) <-> SSD1306 OLED SCL",
      "ESP32 GPIO23 <-> Active Piezo Buzzer Positive Pin"
    ],
    connections: [
      {
        id: "conn-pwr-esp",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-esp32",
        toPin: "VIN",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Powers ESP32 MCU module"
      },
      {
        id: "conn-gnd-esp",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-esp32",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "System ground reference"
      },
      {
        id: "conn-pwr-sonar",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-ultrasonic",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Power HC-SR04 ultrasonic sensor"
      },
      {
        id: "conn-gnd-sonar",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-ultrasonic",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Sensor ground"
      },
      {
        id: "conn-trig-sonar",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO5",
        toComponentId: "comp-ultrasonic",
        toPin: "TRIG",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "10us ultrasonic pulse trigger"
      },
      {
        id: "conn-echo-sonar",
        fromComponentId: "comp-ultrasonic",
        fromPin: "ECHO",
        toComponentId: "comp-esp32",
        toPin: "GPIO18",
        signalType: "DIGITAL_IN",
        voltage: "3.3V",
        purpose: "Pulse duration return proportional to target distance"
      },
      {
        id: "conn-pwr-rgb",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-rgb-led",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Power WS2812B NeoPixel ring"
      },
      {
        id: "conn-gnd-rgb",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-rgb-led",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "RGB LED ground"
      },
      {
        id: "conn-din-rgb",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO19",
        toComponentId: "comp-rgb-led",
        toPin: "DIN",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "High-speed NRZ RGB color control stream"
      },
      {
        id: "conn-pwr-oled",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-oled",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power OLED logic and panel"
      },
      {
        id: "conn-gnd-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-oled",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "OLED ground"
      },
      {
        id: "conn-sda-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO21",
        toComponentId: "comp-oled",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "I2C Serial Data"
      },
      {
        id: "conn-scl-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO22",
        toComponentId: "comp-oled",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "I2C Serial Clock"
      },
      {
        id: "conn-sig-buzzer",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO23",
        toComponentId: "comp-piezo",
        toPin: "POSITIVE",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "Triggers acoustic alert"
      },
      {
        id: "conn-gnd-buzzer",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-piezo",
        toPin: "NEGATIVE",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Buzzer ground"
      }
    ],
    firmwareLogic: {
      mainLoopDescription: "Triggers ultrasonic sensor at 5Hz. Filters returned distance through a 5-point median filter. If distance is between 30cm and 220cm for >3 seconds, classifies bay as OCCUPIED (sets RGB to RED). Otherwise, classifies as VACANT (sets RGB to GREEN). Updates OLED display with bay ID, live distance, and occupancy icon.",
      setupSteps: [
        "Initialize GPIO5 as OUTPUT (Trig) and GPIO18 as INPUT (Echo)",
        "Initialize FastLED / NeoPixel driver on GPIO19",
        "Initialize I2C bus and SSD1306 OLED screen at 0x3C",
        "Set GPIO23 as OUTPUT (Buzzer)",
        "Perform power-on self-test (sweep RGB red-green-blue)"
      ],
      safetyNotes: [
        "Use 5V-to-3.3V resistive divider on HC-SR04 Echo line to prevent overvoltage on ESP32 GPIO18",
        "Ensure overhead ceiling mount is anchored securely above vehicular vibration zones"
      ]
    },
    diagrams: {
      systemBlockMermaid: "graph TD\n    PWR[12V-to-5V Buck Converter] --> ESP[ESP32 Microcontroller]\n    PWR --> SONAR[HC-SR04 Ultrasonic Sensor]\n    PWR --> RGB[WS2812B RGB NeoPixel Ring]\n    ESP -->|Trig/Echo GPIO5/18| SONAR\n    ESP -->|Data GPIO19| RGB\n    ESP -->|I2C GPIO21/22| OLED[SSD1306 OLED Display]\n    ESP -->|GPIO23 Digital| BUZZ[Piezo Buzzer]"
    },
    enclosure: {
      type: "Overhead Bay Ceiling-Mount Enclosure",
      material: "Flame-Retardant ABS with Clear Optical Diffuser Dome",
      dimensions: "130mm x 50mm x 90mm",
      protectionRating: "IP54 dust and splash resistant"
    },
    enclosureConcept: {
      type: "OVERHEAD_BAY",
      name: "Ceiling-Mount Parking Bay Enclosure",
      material: "Flame-Retardant ABS with Clear Optical Diffuser Dome",
      dimensions: "130mm x 50mm x 90mm",
      protectionRating: "IP54 dust and splash resistant"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "OVERHEAD_BAY",
        dimensions: [130, 50, 90],
        color: "#1e293b",
        opacity: 0.35,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-esp32",
          primitiveType: "BOARD",
          dimensions: [55, 6, 28],
          position: [0, 5, 0],
          rotation: [0, 0, 0],
          color: "#065f46",
          label: "ESP32 Controller"
        },
        {
          componentId: "comp-ultrasonic",
          primitiveType: "SENSOR_MODULE",
          dimensions: [45, 20, 18],
          position: [0, 24, 25],
          rotation: [180, 0, 0],
          color: "#0284c7",
          label: "HC-SR04 Sonar (Downward)"
        },
        {
          componentId: "comp-rgb-led",
          primitiveType: "LED",
          dimensions: [22, 16, 22],
          position: [-35, 26, -15],
          rotation: [0, 0, 0],
          color: "#10b981",
          label: "WS2812B RGB Beacon Dome"
        },
        {
          componentId: "comp-piezo",
          primitiveType: "BUZZER",
          dimensions: [16, 12, 16],
          position: [35, 14, -20],
          rotation: [0, 0, 0],
          color: "#18181b",
          label: "Acoustic Warning Buzzer"
        },
        {
          componentId: "comp-oled",
          primitiveType: "DISPLAY_PANEL",
          dimensions: [38, 7, 26],
          position: [0, 22, -22],
          rotation: [0, 0, 0],
          color: "#38bdf8",
          label: "0.96 inch Bay OLED"
        },
        {
          componentId: "comp-power",
          primitiveType: "CONNECTOR",
          dimensions: [28, 14, 18],
          position: [-42, 8, 25],
          rotation: [0, 0, 0],
          color: "#f59e0b",
          label: "12V Buck Converter Jack"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-sonar-tuning",
      title: "Phase 1: Ultrasonic Calibration & Echo Filtering",
      description: "Interface HC-SR04 with ESP32 and calibrate distance thresholds for garage heights.",
      featureIds: ["feature-vehicle-ranging"],
      tasks: [
        "Implement interrupt-driven ultrasonic pulse timing",
        "Implement 5-sample median filter to eliminate false spikes",
        "Calibrate empty bay vs vehicle presence thresholds"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Stable distance telemetry output over serial stream"]
    },
    {
      id: "phase-rgb-oled",
      title: "Phase 2: RGB Visual Guidance & OLED Dashboard",
      description: "Integrate WS2812B NeoPixel ring color animations and SSD1306 bay status screen.",
      featureIds: ["feature-rgb-signaling", "feature-oled-telemetry"],
      tasks: [
        "Program state machine for Vacant (Green), Occupied (Red), and Fault (Flashing Yellow)",
        "Design OLED bay identifier and distance graphic layout",
        "Connect piezo buzzer for over-height warning pulses"
      ],
      dependsOnPhaseIds: ["phase-sonar-tuning"],
      completionCriteria: ["Visual indicators reflect bay occupancy seamlessly in real time"]
    },
    {
      id: "phase-ceiling-enclosure",
      title: "Phase 3: Ceiling Mount Enclosure & Garage Trial",
      description: "Mount into flame-retardant overhead casing with optical diffuser and run 48-hour garage test.",
      featureIds: ["feature-vehicle-ranging", "feature-rgb-signaling"],
      tasks: [
        "Assemble PCB, sonar transceiver, and RGB ring in ceiling-mount housing",
        "Connect 12V garage power rail through step-down converter",
        "Perform 48-hour continuous vehicle entry/exit validation"
      ],
      dependsOnPhaseIds: ["phase-rgb-oled"],
      completionCriteria: ["100% occupancy detection accuracy across test parking cycles"]
    }
  ],
  assumptions: [
    {
      id: "asm-ceiling-height",
      description: "Ceiling height above parking slot is between 2.2m and 3.5m.",
      affectedEntityIds: ["comp-ultrasonic", "feature-vehicle-ranging"],
      reason: "Within optimal HC-SR04 sonar detection cone and reflective gain."
    }
  ],
  openQuestions: [
    {
      id: "q-garage-lighting",
      question: "Will the parking facility require ambient light level adaptation for daytime vs nighttime beacon brightness?",
      affectedEntityIds: ["comp-rgb-led", "feature-rgb-signaling"],
      whyItMatters: "May require an optional photoresistor (LDR) to dim LEDs at night."
    }
  ]
};

// =========================================================================
// 2. AUTOMATIC PET FEEDER
// =========================================================================
const petFeederBlueprint = {
  ...baseHardware,
  overview: {
    projectName: "NutriPaw — Precision Weight-Dosed Automated Pet Feeder",
    summary: "NutriPaw is an electromechanical pet feeder appliance engineered to dispense calibrated dry kibble portions at programmable daily meal times using a motorized dispenser gate, a high-accuracy strain-gauge load cell, a real-time clock (RTC), and a local 16x2 LCD interface.",
    problemStatement: "Pet owners working long hours struggle with rigid feeding schedules and manual portion estimation, leading to pet anxiety, overfeeding, and feline/canine obesity.",
    targetUsers: [
      "Working Pet Parents (Cats & Dogs)",
      "Veterinary Nutritional Caretakers",
      "Frequent Weekend Travelers"
    ],
    goals: [
      "Dispense targeted portion weights within ±3 grams precision using closed-loop scale feedback",
      "Maintain meal scheduling via battery-backed RTC even during AC power outages",
      "Provide physical push-button portion calibration and live status on a 16x2 backlit LCD"
    ],
    scope: [
      "ESP32 / Arduino Uno central microcontroller",
      "MG996R high-torque metal-gear dispense servo motor",
      "5kg aluminum bar strain-gauge load cell with HX711 24-bit ADC amplifier",
      "DS3231 high-precision battery-backed I2C real-time clock module",
      "16x2 character I2C LCD screen",
      "Dual tactile push buttons (Manual Feed & Tare / Set Portion)",
      "5V 3A DC power supply with food hopper and weighing bowl platform"
    ],
    outOfScope: [
      "Refrigerated wet food dispenser chamber",
      "Live streaming pet camera with facial recognition",
      "Voice recording speaker and microphone playback"
    ]
  },
  features: [
    {
      id: "feature-scheduled-dispense",
      name: "RTC Scheduled Meal Automation",
      description: "Triggers servo dispenser at programmed daily timestamps using battery-backed DS3231 RTC.",
      priority: "HIGH",
      roleIds: ["role-pet-owner"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-weight-dosing",
      name: "Closed-Loop Strain-Gauge Portion Dosing",
      description: "Measures dispensed kibble weight in real time with HX711 24-bit ADC, stopping servo exactly when target weight is reached.",
      priority: "HIGH",
      roleIds: ["role-pet-owner"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-lcd-interface",
      name: "16x2 Character LCD & Button Interface",
      description: "Renders current time, next meal countdown, and bowl portion grams; allows instant manual feed via tactile buttons.",
      priority: "MEDIUM",
      roleIds: ["role-pet-owner"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-jam-prevention",
      name: "Anti-Jam Reverse Agitation Logic",
      description: "Detects kibble blockage and reverses servo angle back and forth to clear mechanical obstruction.",
      priority: "HIGH",
      roleIds: ["role-pet-owner"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-pet-owner",
      name: "Pet Owner Caretaker",
      description: "Sets daily meal portions, schedules feeding times, and performs tare weight calibration.",
      permissions: ["trigger_manual_feed", "set_meal_schedules", "calibrate_bowl_tare"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-weight-precision",
      type: "FUNCTIONAL",
      description: "The load cell scale shall resolve food bowl mass in 0.5g increments up to 2000g.",
      featureIds: ["feature-weight-dosing"],
      acceptanceCriteria: ["Dispensing stops within ±3g of configured target portion", "Tare offset is non-volatile"],
      source: "USER_STATED"
    },
    {
      id: "req-rtc-timing",
      type: "FUNCTIONAL",
      description: "The DS3231 RTC shall maintain meal schedule accuracy within ±2 minutes per year.",
      featureIds: ["feature-scheduled-dispense"],
      acceptanceCriteria: ["CR2032 coin cell retains timekeeping across mains power interruption"],
      source: "USER_STATED"
    }
  ],
  hardware: {
    applicable: true,
    workingPrinciple: "A vertical food hopper feeds dry food into a rotating paddle chamber driven by an MG996R servo. When an RTC feeding alarm fires, the MCU rotates the servo in measured pulses. Dispensed kibble drops into an isolated weighing bowl resting on a 5kg load cell. The HX711 amplifier reports continuous mass to the MCU, which halts the servo precisely at the portion target and logs the event on the 16x2 LCD.",
    architecture: {
      controllerArchitecture: "ESP32 Tensilica Dual-Core 32-bit MCU (240MHz)",
      sensorSubsystems: [
        "5kg Strain-Gauge Load Cell with HX711 24-bit ADC Amplifier",
        "DS3231 High-Precision I2C Real-Time Clock with CR2032 backup"
      ],
      actuatorSubsystems: [
        "MG996R High-Torque Metal Gear Dispenser Servo (11kg-cm torque)",
        "Dual Tactile Push Buttons (Manual Feed & Calibration)"
      ],
      displaySubsystems: ["16x2 I2C Backlit Character LCD (HD44780 with PCF8574 backpack)"],
      powerArchitecture: "5V 3A external DC adapter supplying dedicated high-current motor rail and filtered 5V/3.3V logic rails."
    },
    components: [
      {
        id: "comp-esp32",
        name: "ESP32 DevKit V1 Microcontroller",
        category: "MICROCONTROLLER",
        purpose: "Main controller managing RTC alarms, load cell polling, servo PWM, and LCD UI",
        quantity: 1,
        specification: "Dual-core Xtensa 240MHz, 520KB SRAM, 4MB Flash, 3.3V logic",
        estimatedUnitCost: "$5.50",
        estimatedTotalCost: "$5.50"
      },
      {
        id: "comp-servo",
        name: "MG996R High-Torque Metal Gear Servo",
        category: "ACTUATOR",
        purpose: "Drives kibble paddle dispenser wheel inside the hopper chute",
        quantity: 1,
        specification: "11kg-cm torque at 6V, metal gears, 50Hz PWM signal, 5V-6V supply",
        estimatedUnitCost: "$6.50",
        estimatedTotalCost: "$6.50"
      },
      {
        id: "comp-loadcell",
        name: "5kg Aluminum Bar Strain-Gauge Load Cell",
        category: "SENSOR",
        purpose: "Measures weight of food dispensed into the pet bowl",
        quantity: 1,
        specification: "Four-wire Wheatstone bridge (Red/Black/White/Green), 1mV/V sensitivity, 5kg max",
        estimatedUnitCost: "$4.20",
        estimatedTotalCost: "$4.20"
      },
      {
        id: "comp-hx711",
        name: "HX711 24-Bit ADC Load Cell Amplifier Module",
        category: "SENSOR",
        purpose: "Digitizes microvolt differential voltage from strain gauge for the MCU",
        quantity: 1,
        specification: "24-bit sigma-delta ADC, programmable gain 128/64, 2-wire serial clock/data interface",
        estimatedUnitCost: "$2.00",
        estimatedTotalCost: "$2.00"
      },
      {
        id: "comp-rtc",
        name: "DS3231 High-Precision I2C RTC Module",
        category: "OTHER",
        purpose: "Battery-backed real-time clock for reliable daily feeding schedule",
        quantity: 1,
        specification: "TCXO temperature-compensated crystal, I2C address 0x68, CR2032 battery holder",
        estimatedUnitCost: "$3.20",
        estimatedTotalCost: "$3.20"
      },
      {
        id: "comp-lcd",
        name: "16x2 Character I2C Backlit LCD",
        category: "DISPLAY",
        purpose: "Displays current time, portion mass in grams, and feeder status",
        quantity: 1,
        specification: "16 characters x 2 lines, yellow-green backlight, PCF8574 I2C adapter (0x27)",
        estimatedUnitCost: "$4.00",
        estimatedTotalCost: "$4.00"
      },
      {
        id: "comp-buttons",
        name: "Dual Tactile Push Button Module",
        category: "ACTUATOR",
        purpose: "Manual feed trigger button and scale tare/calibration button",
        quantity: 1,
        specification: "12mm tactile switches with 10k internal pullup logic",
        estimatedUnitCost: "$1.00",
        estimatedTotalCost: "$1.00"
      },
      {
        id: "comp-power",
        name: "5V 3A DC Power Supply & Dual Rail Jack",
        category: "POWER",
        purpose: "Provides isolated power for servo motor surges and stable MCU logic",
        quantity: 1,
        specification: "5.5mm DC barrel jack, 5V 3A regulated output with 1000uF smoothing capacitor",
        estimatedUnitCost: "$4.50",
        estimatedTotalCost: "$4.50"
      }
    ],
    controllers: [
      {
        id: "ctrl-esp32",
        name: "ESP32 DevKit V1",
        type: "MCU",
        clockSpeed: "240MHz",
        flashMemory: "4MB",
        ram: "520KB",
        gpioCount: 30,
        communicationBuses: ["I2C", "SPI", "UART", "PWM"]
      }
    ],
    sensors: [
      {
        id: "sens-loadcell",
        name: "5kg Strain Gauge & HX711 ADC",
        type: "Strain Gauge Mass Sensor",
        interface: "2-Wire Serial (DOUT & SCK)",
        measurementRange: "0g to 5000g",
        accuracy: "±0.5g",
        samplingRate: "10 Hz"
      },
      {
        id: "sens-rtc",
        name: "DS3231 Real-Time Clock",
        type: "I2C RTC Module",
        interface: "I2C (0x68)",
        measurementRange: "Seconds to Years",
        accuracy: "±2ppm",
        samplingRate: "On-demand"
      }
    ],
    actuators: [
      {
        id: "act-servo",
        name: "MG996R Metal-Gear Dispense Servo",
        type: "RC Servo Actuator",
        driveSignal: "50Hz 1.0ms-2.0ms PWM pulse",
        maxCurrent: "1.2A stall"
      },
      {
        id: "act-buttons",
        name: "Tactile Push Buttons",
        type: "Digital Contact Switch",
        driveSignal: "Active-LOW GPIO input",
        maxCurrent: "1mA"
      }
    ],
    communicationModules: [
      {
        id: "comm-i2c",
        name: "Onboard I2C Peripheral Bus",
        protocol: "I2C 100kHz Standard Mode",
        purpose: "Communicates simultaneously with DS3231 RTC and 16x2 LCD"
      }
    ],
    powerRequirements: {
      operatingVoltage: "5.0V DC main rail, 3.3V logic rail",
      powerSource: "5V 3A external DC wall adapter",
      estimatedCurrentDraw: "Nominal 140mA idle; Peak 1.4A during servo dispense rotation"
    },
    pinConnections: [
      "ESP32 Vin <-> 5V DC Main Power Rail",
      "ESP32 GND <-> Common System Ground",
      "ESP32 GPIO18 (PWM) <-> MG996R Servo Signal Wire",
      "ESP32 GPIO19 (Input) <-> HX711 DOUT Data Wire",
      "ESP32 GPIO21 (Output) <-> HX711 SCK Clock Wire",
      "ESP32 GPIO22 (SDA) <-> DS3231 SDA & 16x2 LCD SDA (Shared I2C)",
      "ESP32 GPIO23 (SCL) <-> DS3231 SCL & 16x2 LCD SCL (Shared I2C)",
      "ESP32 GPIO4 <-> Manual Feed Tactile Button",
      "ESP32 GPIO5 <-> Scale Tare Calibration Button",
      "HX711 (E+/E-/A+/A-) <-> 5kg Load Cell (Red/Black/Green/White)"
    ],
    connections: [
      {
        id: "conn-pwr-esp",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-esp32",
        toPin: "VIN",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Powers ESP32 MCU module"
      },
      {
        id: "conn-gnd-esp",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-esp32",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "System ground reference"
      },
      {
        id: "conn-pwr-servo",
        fromComponentId: "comp-power",
        fromPin: "5V_MOTOR_OUT",
        toComponentId: "comp-servo",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "High-current servo power supply"
      },
      {
        id: "conn-gnd-servo",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-servo",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Servo ground"
      },
      {
        id: "conn-pwm-servo",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO18",
        toComponentId: "comp-servo",
        toPin: "PWM_SIGNAL",
        signalType: "PWM",
        voltage: "3.3V",
        purpose: "Servo rotation position & speed PWM command"
      },
      {
        id: "conn-eplus-loadcell",
        fromComponentId: "comp-hx711",
        fromPin: "E_PLUS",
        toComponentId: "comp-loadcell",
        toPin: "RED_EXC+",
        signalType: "POWER",
        voltage: "4.3V",
        purpose: "Wheatstone bridge excitation positive"
      },
      {
        id: "conn-eminus-loadcell",
        fromComponentId: "comp-hx711",
        fromPin: "E_MINUS",
        toComponentId: "comp-loadcell",
        toPin: "BLK_EXC-",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Wheatstone bridge excitation ground"
      },
      {
        id: "conn-aplus-loadcell",
        fromComponentId: "comp-loadcell",
        fromPin: "GRN_SIG+",
        toComponentId: "comp-hx711",
        toPin: "A_PLUS",
        signalType: "ANALOG",
        voltage: "0-20mV",
        purpose: "Positive differential strain signal"
      },
      {
        id: "conn-aminus-loadcell",
        fromComponentId: "comp-loadcell",
        fromPin: "WHT_SIG-",
        toComponentId: "comp-hx711",
        toPin: "A_MINUS",
        signalType: "ANALOG",
        voltage: "0-20mV",
        purpose: "Negative differential strain signal"
      },
      {
        id: "conn-pwr-hx711",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-hx711",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power HX711 logic"
      },
      {
        id: "conn-gnd-hx711",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-hx711",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "HX711 ground"
      },
      {
        id: "conn-dt-hx711",
        fromComponentId: "comp-hx711",
        fromPin: "DOUT",
        toComponentId: "comp-esp32",
        toPin: "GPIO19",
        signalType: "DIGITAL_IN",
        voltage: "3.3V",
        purpose: "24-bit serial data out from ADC"
      },
      {
        id: "conn-sck-hx711",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO21",
        toComponentId: "comp-hx711",
        toPin: "SCK",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "Serial clock pulses to shift ADC bits"
      },
      {
        id: "conn-pwr-rtc",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-rtc",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power DS3231 RTC"
      },
      {
        id: "conn-gnd-rtc",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-rtc",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "RTC ground"
      },
      {
        id: "conn-sda-rtc",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO22",
        toComponentId: "comp-rtc",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "RTC I2C Serial Data"
      },
      {
        id: "conn-scl-rtc",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO23",
        toComponentId: "comp-rtc",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "RTC I2C Serial Clock"
      },
      {
        id: "conn-pwr-lcd",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-lcd",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Power 16x2 LCD and backlight"
      },
      {
        id: "conn-gnd-lcd",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-lcd",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "LCD ground"
      },
      {
        id: "conn-sda-lcd",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO22",
        toComponentId: "comp-lcd",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "Shared I2C Serial Data line"
      },
      {
        id: "conn-scl-lcd",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO23",
        toComponentId: "comp-lcd",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "Shared I2C Serial Clock line"
      },
      {
        id: "conn-btn-feed",
        fromComponentId: "comp-buttons",
        fromPin: "BTN_FEED",
        toComponentId: "comp-esp32",
        toPin: "GPIO4",
        signalType: "DIGITAL_IN",
        voltage: "3.3V",
        purpose: "Manual dispense push button"
      },
      {
        id: "conn-btn-cal",
        fromComponentId: "comp-buttons",
        fromPin: "BTN_CAL",
        toComponentId: "comp-esp32",
        toPin: "GPIO5",
        signalType: "DIGITAL_IN",
        voltage: "3.3V",
        purpose: "Scale tare zero-point button"
      }
    ],
    firmwareLogic: {
      mainLoopDescription: "Reads DS3231 RTC every 1 second. Compares against programmed meal times (e.g. 08:00, 13:00, 19:00). When time matches or manual feed button is pressed, zeroes tare on HX711 and begins pulsing MG996R servo dispenser. Continuously monitors food bowl grams until target portion (e.g. 45g) is reached. Reverses servo by 30 degrees to prevent chute jamming and updates LCD status.",
      setupSteps: [
        "Initialize I2C bus at 100kHz for DS3231 (0x68) and 16x2 LCD (0x27)",
        "Initialize HX711 load cell calibration factor stored in EEPROM",
        "Attach MG996R servo on GPIO18 and command neutral shut position (0 degrees)",
        "Configure GPIO4 and GPIO5 with internal pull-up resistors for tactile buttons",
        "Display system ready banner with current RTC time"
      ],
      safetyNotes: [
        "Do not power MG996R high-current servo directly from ESP32 3.3V pin; connect directly to 5V 3A rail",
        "Install 1000uF capacitor across servo 5V and GND to suppress inductive voltage dips during motor start"
      ]
    },
    diagrams: {
      systemBlockMermaid: "graph TD\n    PWR[5V 3A Power Supply] --> ESP[ESP32 Microcontroller]\n    PWR --> SERVO[MG996R Dispenser Servo]\n    PWR --> LCD[16x2 I2C Character LCD]\n    ESP -->|PWM GPIO18| SERVO\n    SCALE[5kg Load Cell] -->|Analog mV| HX[HX711 24-bit ADC]\n    HX -->|DOUT/SCK GPIO19/21| ESP\n    ESP -->|I2C SDA/SCL GPIO22/23| RTC[DS3231 Real-Time Clock]\n    ESP -->|I2C SDA/SCL GPIO22/23| LCD\n    BTNS[Manual Feed & Tare Buttons] -->|GPIO4/5 Digital| ESP"
    },
    enclosure: {
      type: "Hopper Tower & Weighing Scale Platform Enclosure",
      material: "Food-Grade ABS Casing with Clear Polycarbonate Hopper Tower",
      dimensions: "160mm x 140mm x 140mm",
      protectionRating: "IP42 moisture and food-dust resistant"
    },
    enclosureConcept: {
      type: "DISPENSER_FEEDER",
      name: "Automatic Pet Feeder Tower & Scale Enclosure",
      material: "Food-Grade ABS Casing with Clear Polycarbonate Hopper Tower",
      dimensions: "160mm x 140mm x 140mm",
      protectionRating: "IP42 moisture and food-dust resistant"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "DISPENSER_FEEDER",
        dimensions: [160, 140, 140],
        color: "#0f172a",
        opacity: 0.35,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-esp32",
          primitiveType: "BOARD",
          dimensions: [55, 6, 28],
          position: [-30, 8, -25],
          rotation: [0, 0, 0],
          color: "#065f46",
          label: "ESP32 Controller"
        },
        {
          componentId: "comp-servo",
          primitiveType: "ACTUATOR",
          dimensions: [40, 36, 20],
          position: [0, 65, 0],
          rotation: [0, 0, 0],
          color: "#334155",
          label: "MG996R Dispenser Motor"
        },
        {
          componentId: "comp-loadcell",
          primitiveType: "BOX",
          dimensions: [70, 14, 18],
          position: [0, 6, 45],
          rotation: [0, 0, 0],
          color: "#94a3b8",
          label: "5kg Load Cell Strain Bar"
        },
        {
          componentId: "comp-hx711",
          primitiveType: "BOARD",
          dimensions: [24, 5, 16],
          position: [38, 8, 40],
          rotation: [0, 0, 0],
          color: "#1e3a8a",
          label: "HX711 24-bit ADC Amplifier"
        },
        {
          componentId: "comp-rtc",
          primitiveType: "BOARD",
          dimensions: [24, 6, 18],
          position: [-42, 8, 15],
          rotation: [0, 0, 0],
          color: "#0891b2",
          label: "DS3231 Real-Time Clock"
        },
        {
          componentId: "comp-lcd",
          primitiveType: "DISPLAY_PANEL",
          dimensions: [70, 8, 30],
          position: [0, 95, -48],
          rotation: [0, 0, 0],
          color: "#059669",
          label: "16x2 Backlit LCD Dashboard"
        },
        {
          componentId: "comp-buttons",
          primitiveType: "BUTTON",
          dimensions: [26, 10, 14],
          position: [42, 85, -45],
          rotation: [0, 0, 0],
          color: "#dc2626",
          label: "Manual Feed & Tare Buttons"
        },
        {
          componentId: "comp-power",
          primitiveType: "CONNECTOR",
          dimensions: [26, 14, 18],
          position: [-50, 8, -45],
          rotation: [0, 0, 0],
          color: "#f59e0b",
          label: "5V 3A DC Barrel Jack"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-scale-calibration",
      title: "Phase 1: Strain-Gauge Load Cell & HX711 Calibration",
      description: "Interface HX711 with ESP32 and calibrate mass sensitivity slope using precision calibration weights.",
      featureIds: ["feature-weight-dosing"],
      tasks: [
        "Wire load cell Wheatstone bridge to HX711 differential inputs",
        "Implement non-blocking 24-bit ADC read driver",
        "Calculate calibration scale factor and zero tare offset"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Scale measures test weights within ±1g precision across 0-500g range"]
    },
    {
      id: "phase-dispense-control",
      title: "Phase 2: Closed-Loop Servo Dispensing & RTC Scheduling",
      description: "Integrate DS3231 RTC alarms with MG996R servo PWM drive and closed-loop weight cutoff.",
      featureIds: ["feature-scheduled-dispense", "feature-weight-dosing", "feature-jam-prevention"],
      tasks: [
        "Implement RTC daily alarm triggers at meal hours",
        "Program servo pulse control loop with continuous weight feedback",
        "Implement bidirectional anti-jam agitation routine"
      ],
      dependsOnPhaseIds: ["phase-scale-calibration"],
      completionCriteria: ["Feeder automatically dispenses exact 45g portion when RTC alarm fires"]
    },
    {
      id: "phase-hopper-assembly",
      title: "Phase 3: Food Hopper & Bowl Assembly Stress Testing",
      description: "Fit mechanical chute, 16x2 LCD, and push buttons into food-safe ABS tower casing for 5-day continuous testing.",
      featureIds: ["feature-scheduled-dispense", "feature-lcd-interface"],
      tasks: [
        "Mount ESP32, load cell base, and LCD in food-grade tower enclosure",
        "Wire manual feed tactile buttons with debounce logic",
        "Run 5-day continuous automated feeding cycle test"
      ],
      dependsOnPhaseIds: ["phase-dispense-control"],
      completionCriteria: ["100% reliable feeding cycles with zero chute jams across 15 automated meals"]
    }
  ],
  assumptions: [
    {
      id: "asm-kibble-size",
      description: "Dry kibble diameter is between 6mm and 15mm.",
      affectedEntityIds: ["comp-servo", "feature-jam-prevention"],
      reason: "Paddle dispenser chute dimensions are optimized for standard dry pet food kibble."
    }
  ],
  openQuestions: [
    {
      id: "q-low-food-sensor",
      question: "Should an optical infrared or time-of-flight sensor be added inside the upper hopper to alert when kibble is running low?",
      affectedEntityIds: ["comp-servo", "feature-scheduled-dispense"],
      whyItMatters: "Enables proactively warning the owner before the hopper runs completely empty."
    }
  ]
};

const newFixtures = [
  { name: 'hardware_parking_blueprint.json', data: parkingBlueprint },
  { name: 'hardware_pet_feeder_blueprint.json', data: petFeederBlueprint },
];

for (const { name, data } of newFixtures) {
  const sharedPath = path.join(sharedFixturesDir, name);
  const backendPath = path.join(backendFixturesDir, name);
  
  fs.writeFileSync(sharedPath, JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(backendPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Generated: ${name}`);
}

console.log('\nAll new hardware blueprint fixtures generated successfully!');
