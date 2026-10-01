import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const backendFixturesDir = path.join(projectRoot, 'backend', 'src', 'main', 'resources', 'fixtures');
const sharedFixturesDir = path.join(projectRoot, 'shared', 'fixtures');

// Base hardware fixture for baseline structure
const baseHardwarePath = path.join(sharedFixturesDir, 'hardware_blueprint.json');
const baseHardware = JSON.parse(fs.readFileSync(baseHardwarePath, 'utf8'));

// =========================================================================
// 1. AGRICULTURE / SMART IRRIGATION CONTROLLER
// =========================================================================
const agricultureBlueprint = {
  ...baseHardware,
  overview: {
    projectName: "AgriFlow — Smart Irrigation & Soil Moisture Automation Controller",
    summary: "AgriFlow is an automated, weather-resilient agricultural IoT controller designed to continuously measure soil dielectric permittivity and atmospheric vapor-pressure deficit (VPD) to actuate high-pressure drip solenoid valves.",
    problemStatement: "Over-irrigation in greenhouse crops wastes up to 40% of fresh water while leaching essential soil nutrients; manual valve scheduling cannot react to real-time microclimate evaporation changes.",
    targetUsers: [
      "Precision Agriculture Farmers",
      "Greenhouse Operators",
      "Urban Community Gardeners"
    ],
    goals: [
      "Continuously monitor root-zone volumetric water content (VWC)",
      "Trigger 12V DC brass solenoid valve pulses precisely when moisture drops below 35%",
      "Display real-time soil VWC, temperature, and pump status on an outdoor-readable 16x2 LCD"
    ],
    scope: [
      "Capacitive soil moisture sensing v1.2 with corrosion-resistant probe geometry",
      "DHT22 high-accuracy temperature and relative humidity sensing",
      "ESP32 dual-core threshold controller and non-volatile calibration storage",
      "Optocoupled 5V dual-channel relay module driving a 12V DC solenoid valve",
      "IP67 weatherproof sealed junction box with PG7 cable glands",
      "Local 16x2 I2C backlit character display"
    ],
    outOfScope: [
      "Cloud telemetry or remote cellular modem streaming",
      "Multi-zone chemical fertilizer injection dosing pump",
      "Solar MPPT charge controller sub-assembly"
    ]
  },
  features: [
    {
      id: "feature-soil-sensing",
      name: "Dielectric Volumetric Water Content Sensing",
      description: "Samples analog output from capacitive soil probe with 12-bit ADC precision to determine real-time soil hydration.",
      priority: "HIGH",
      roleIds: ["role-farm-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-climate-sensing",
      name: "Atmospheric Vapor-Pressure Deficit Tracking",
      description: "Monitors ambient greenhouse temperature and relative humidity with DHT22 for microclimate evapotranspiration calculations.",
      priority: "HIGH",
      roleIds: ["role-farm-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-solenoid-actuation",
      name: "Pulsed Solenoid Valve Drip Control",
      description: "Switches an isolated 10A optocoupled relay to open a 12V DC brass solenoid water valve for regulated 15-minute soak cycles.",
      priority: "HIGH",
      roleIds: ["role-farm-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-lcd-display",
      name: "Outdoor Backlit LCD Status Display",
      description: "Renders live soil moisture percentage, air temperature, valve state, and last irrigation timestamp on a 16x2 character screen.",
      priority: "MEDIUM",
      roleIds: ["role-farm-operator"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-farm-operator",
      name: "Farm Irrigation Operator",
      description: "Supervises crop zone hydration thresholds and performs manual bypass irrigation tests.",
      permissions: ["inspect_soil_metrics", "trigger_manual_irrigation", "calibrate_dry_wet_limits"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-moisture-accuracy",
      type: "FUNCTIONAL",
      description: "System shall sample soil moisture at 10-second intervals with +/- 2% volumetric water content accuracy.",
      featureIds: ["feature-soil-sensing"],
      acceptanceCriteria: ["ADC reading updates every 10 seconds", "Calibration curve maps 0-100% moisture correctly"],
      source: "USER_STATED"
    },
    {
      id: "req-solenoid-safety",
      type: "NON_FUNCTIONAL",
      description: "Solenoid valve activation shall feature a hardware watchdog to prevent overflow flooding if MCU freezes.",
      featureIds: ["feature-solenoid-actuation"],
      acceptanceCriteria: ["Maximum continuous open time strictly capped at 20 minutes", "Normally closed fail-safe valve state"],
      source: "AI_ASSUMED"
    },
    {
      id: "req-weatherproof-protection",
      type: "NON_FUNCTIONAL",
      description: "Controller casing must withstand 100% humidity and direct water spray in greenhouse environments.",
      featureIds: ["feature-lcd-display"],
      acceptanceCriteria: ["IP67 rated enclosure with silicone seal gasket", "Cable entries sealed via waterproof glands"],
      source: "AI_ASSUMED"
    }
  ],
  hardware: {
    applicable: true,
    workingPrinciple: "Frequency-domain capacitive probe measures changes in soil dielectric permittivity caused by water content. When the analog reading falls below the 35% threshold, ESP32 GPIO4 trips an optoisolated relay, opening a 12V DC brass solenoid valve to deliver pulsed drip hydration.",
    components: [
      {
        id: "comp-esp32",
        name: "ESP32 DevKit V1 Microcontroller",
        category: "MICROCONTROLLER",
        purpose: "Dual-core processor executing sensor sampling loop, relay control state machine, and I2C LCD driver",
        quantity: 1,
        specification: "ESP-WROOM-32, 240MHz Xtensa Dual-Core, 12-bit ADC, 520KB SRAM, 3.3V Logic",
        alternatives: ["Arduino Uno with Terminal Shield", "Raspberry Pi Pico"],
        estimatedUnitCost: 4.50,
        estimatedTotalCost: 4.50
      },
      {
        id: "comp-soil-moisture",
        name: "Capacitive Soil Moisture Probe v1.2",
        category: "SENSOR",
        purpose: "Corrosion-resistant dielectric root-zone volumetric water content sensor",
        quantity: 1,
        specification: "Analog voltage 0-3.0V linear output, 3.3V-5V operating voltage, conformal coated probe",
        alternatives: ["Chirp I2C Soil Sensor", "DFRobot Analog Capacitive Probe"],
        estimatedUnitCost: 2.80,
        estimatedTotalCost: 2.80
      },
      {
        id: "comp-dht22",
        name: "DHT22 High-Precision Temperature & Humidity Sensor",
        category: "SENSOR",
        purpose: "Greenhouse ambient temperature and relative humidity tracking for VPD calculations",
        quantity: 1,
        specification: "-40 to 80C (+/-0.5C), 0 to 100% RH (+/-2% RH), digital single-bus protocol",
        alternatives: ["BME280 I2C Sensor", "SHT31-D"],
        estimatedUnitCost: 3.20,
        estimatedTotalCost: 3.20
      },
      {
        id: "comp-relay",
        name: "5V Dual-Channel Optocoupled Relay Module",
        category: "ACTUATOR",
        purpose: "Electrically isolated switching for 12V DC solenoid valve power circuit",
        quantity: 1,
        specification: "10A @ 250VAC / 30VDC contacts, PC817 optocoupler isolation, active LOW trigger",
        alternatives: ["Single-Channel MOSFET Driver Module", "Solid State Relay (SSR)"],
        estimatedUnitCost: 3.50,
        estimatedTotalCost: 3.50
      },
      {
        id: "comp-solenoid",
        name: "12V DC 1/2-Inch Brass Solenoid Water Valve",
        category: "ACTUATOR",
        purpose: "Normally closed electromechanical valve controlling pressurized drip irrigation line",
        quantity: 1,
        specification: "12V DC, 0.02 - 0.8 MPa operating pressure, 1/2-inch NPT threaded brass body",
        alternatives: ["12V Motorized Ball Valve", "12V Submersible 3W Water Pump"],
        estimatedUnitCost: 9.80,
        estimatedTotalCost: 9.80
      },
      {
        id: "comp-lcd1602",
        name: "16x2 Character I2C LCD Display Module",
        category: "DISPLAY",
        purpose: "High-contrast outdoor-readable status readout showing live VWC and pump status",
        quantity: 1,
        specification: "16 columns x 2 rows, PCF8574 I2C backpack (default address 0x27), yellow-green backlight",
        alternatives: ["0.96 inch I2C OLED", "TM1637 4-Digit Display"],
        estimatedUnitCost: 3.90,
        estimatedTotalCost: 3.90
      },
      {
        id: "comp-power",
        name: "12V 2A DC Power Adapter with Step-Down Buck Converter",
        category: "POWER",
        purpose: "Supplies 12V DC for solenoid valve and steps down to clean 5V DC for ESP32 and relay logic",
        quantity: 1,
        specification: "Input 100-240VAC; Output 12VDC 2A barrel jack; onboard LM2596 5V 3A step-down regulator",
        alternatives: ["12V Solar Panel + MPPT Battery Kit", "Dual 5V/12V Industrial DIN Power Supply"],
        estimatedUnitCost: 5.50,
        estimatedTotalCost: 5.50
      },
      {
        id: "comp-terminals",
        name: "8-Position Heavy-Duty Screw Barrier Terminal Block",
        category: "PASSIVE",
        purpose: "Secure field wiring terminals for sensor leads, valve cables, and DC power input",
        quantity: 1,
        specification: "Pitch 8.25mm, 15A 300V rating, zinc-plated steel screws with transparent protective cover",
        alternatives: ["WAGO 221 Lever Connectors", "Phoenix Contact Pluggable Blocks"],
        estimatedUnitCost: 1.80,
        estimatedTotalCost: 1.80
      }
    ],
    controllers: ["ESP32 DevKit V1 240MHz Dual-Core with 12-bit ADC"],
    sensors: ["Capacitive Soil Moisture Probe v1.2", "DHT22 Digital Temperature & Humidity Sensor"],
    actuators: ["5V Dual Optocoupled Relay Module", "12V Brass Solenoid Water Valve"],
    communicationModules: ["Onboard ESP32 802.11b/g/n Wi-Fi & BLE (Local AP Diagnostics)"],
    powerRequirements: {
      voltageRail: "12V DC main solenoid rail; 5.0V DC logic rail; 3.3V DC sensor rail",
      powerSource: "12V 2A DC regulated wall adapter with LM2596 step-down converter",
      estimatedCurrentDraw: "Nominal 120mA standby; Peak 650mA during 12V solenoid valve activation"
    },
    pinConnections: [
      "ESP32 3V3 Pin <-> Soil Moisture Probe VCC",
      "ESP32 GND Pin <-> Common System Ground",
      "ESP32 GPIO36 (VP / ADC1_CH0) <-> Soil Moisture Analog Signal",
      "ESP32 GPIO18 <-> DHT22 Data Pin (with 10k pullup)",
      "ESP32 GPIO4 <-> Relay Module IN1 Trigger Pin",
      "ESP32 GPIO21 (SDA) <-> LCD1602 SDA Pin",
      "ESP32 GPIO22 (SCL) <-> LCD1602 SCL Pin",
      "Relay Module NO1 Contact <-> 12V Solenoid Valve Positive Terminal"
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
        purpose: "Powers ESP32 onboard LDO regulator"
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
        id: "conn-soil-vcc",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-soil-moisture",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Powers capacitive moisture probe"
      },
      {
        id: "conn-soil-gnd",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-soil-moisture",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Soil probe ground"
      },
      {
        id: "conn-soil-sig",
        fromComponentId: "comp-soil-moisture",
        fromPin: "AOUT",
        toComponentId: "comp-esp32",
        toPin: "GPIO36",
        signalType: "ANALOG",
        voltage: "0-3.3V",
        purpose: "Volumetric water content analog voltage"
      },
      {
        id: "conn-dht-vcc",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-dht22",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Powers DHT22 climate sensor"
      },
      {
        id: "conn-dht-gnd",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-dht22",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "DHT22 ground reference"
      },
      {
        id: "conn-dht-sig",
        fromComponentId: "comp-dht22",
        fromPin: "DATA",
        toComponentId: "comp-esp32",
        toPin: "GPIO18",
        signalType: "DIGITAL_1WIRE",
        voltage: "3.3V",
        purpose: "Single-wire temperature and humidity stream"
      },
      {
        id: "conn-relay-vcc",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-relay",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Powers relay electromagnetic coil circuit"
      },
      {
        id: "conn-relay-gnd",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-relay",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Relay logic ground"
      },
      {
        id: "conn-relay-in1",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO4",
        toComponentId: "comp-relay",
        toPin: "IN1",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "Active-low optocoupler valve trigger"
      },
      {
        id: "conn-solenoid-pwr",
        fromComponentId: "comp-relay",
        fromPin: "NO1",
        toComponentId: "comp-solenoid",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "12V",
        purpose: "Switched 12V power supply to brass solenoid coil"
      },
      {
        id: "conn-solenoid-gnd",
        fromComponentId: "comp-power",
        fromPin: "12V_GND",
        toComponentId: "comp-solenoid",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "High-current solenoid return ground"
      },
      {
        id: "conn-lcd-vcc",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-lcd1602",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Powers LCD controller logic and LED backlight"
      },
      {
        id: "conn-lcd-gnd",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-lcd1602",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "LCD ground reference"
      },
      {
        id: "conn-lcd-sda",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO21",
        toComponentId: "comp-lcd1602",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "I2C Serial Data line for display text"
      },
      {
        id: "conn-lcd-scl",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO22",
        toComponentId: "comp-lcd1602",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "I2C Serial Clock line for display timing"
      }
    ],
    enclosure: {
      type: "WEATHERPROOF_BOX",
      material: "IP67 Weatherproof ABS with Silicone Gasket & Clear Polycarbonate Lid",
      dimensions: "150mm x 110mm x 60mm",
      protectionRating: "IP67 waterproof with dual PG7 cable glands"
    },
    enclosureConcept: {
      type: "WEATHERPROOF_BOX",
      name: "Weatherproof Sealed Enclosure",
      material: "IP67 Weatherproof ABS with Silicone Gasket & Clear Polycarbonate Lid",
      dimensions: "150mm x 110mm x 60mm",
      protectionRating: "IP67 waterproof with dual PG7 cable glands"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "WEATHERPROOF_BOX",
        dimensions: [150, 60, 110],
        color: "#14532d",
        opacity: 0.35,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-esp32",
          primitiveType: "BOARD",
          dimensions: [55, 6, 28],
          position: [-20, 6, 0],
          rotation: [0, 0, 0],
          color: "#065f46",
          label: "ESP32 Controller"
        },
        {
          componentId: "comp-relay",
          primitiveType: "BOARD",
          dimensions: [45, 14, 35],
          position: [-45, 10, -28],
          rotation: [0, 0, 0],
          color: "#1d4ed8",
          label: "Dual 5V Relay Module"
        },
        {
          componentId: "comp-lcd1602",
          primitiveType: "DISPLAY_PANEL",
          dimensions: [70, 8, 30],
          position: [25, 24, -20],
          rotation: [0, 0, 0],
          color: "#059669",
          label: "16x2 Backlit LCD"
        },
        {
          componentId: "comp-soil-moisture",
          primitiveType: "SENSOR_MODULE",
          dimensions: [20, 28, 12],
          position: [-45, 12, 35],
          rotation: [0, 0, 0],
          color: "#10b981",
          label: "Soil Moisture Probe Lead"
        },
        {
          componentId: "comp-solenoid",
          primitiveType: "CYLINDER",
          dimensions: [28, 32, 28],
          position: [48, 16, 25],
          rotation: [0, 0, 0],
          color: "#d97706",
          label: "12V Brass Solenoid Valve"
        },
        {
          componentId: "comp-dht22",
          primitiveType: "SENSOR_MODULE",
          dimensions: [16, 20, 12],
          position: [50, 12, -35],
          rotation: [0, 0, 0],
          color: "#0284c7",
          label: "DHT22 Climate Probe"
        },
        {
          componentId: "comp-power",
          primitiveType: "CONNECTOR",
          dimensions: [30, 14, 20],
          position: [0, 8, 42],
          rotation: [0, 0, 0],
          color: "#f59e0b",
          label: "12V DC Terminal & Buck Converter"
        },
        {
          componentId: "comp-terminals",
          primitiveType: "CONNECTOR",
          dimensions: [40, 10, 14],
          position: [-20, 8, -40],
          rotation: [0, 0, 0],
          color: "#64748b",
          label: "Screw Barrier Terminal"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-sensor-calibration",
      title: "Phase 1: Soil & Climate Sensor Calibration",
      description: "Wire capacitive probe and DHT22 to ESP32 ADC and calibrate dry/wet soil points.",
      featureIds: ["feature-soil-sensing", "feature-climate-sensing"],
      tasks: [
        "Calibrate capacitive probe in air (0%) and submerged water (100%)",
        "Implement moving-average ADC filter on ESP32 GPIO36",
        "Verify DHT22 1-wire timing and vapor pressure calculations"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Live soil volumetric water content updates stably on serial monitor"]
    },
    {
      id: "phase-solenoid-automation",
      title: "Phase 2: Relay & Solenoid Valve Control Loop",
      description: "Integrate 5V relay module with 12V solenoid valve and hardware safety timeout.",
      featureIds: ["feature-solenoid-actuation", "feature-lcd-display"],
      tasks: [
        "Wire optocoupled relay to ESP32 GPIO4 with flyback protection",
        "Implement hysteresis irrigation control algorithm",
        "Connect 16x2 I2C LCD for real-time field status display"
      ],
      dependsOnPhaseIds: ["phase-sensor-calibration"],
      completionCriteria: ["Valve reliably triggers at <35% soil moisture and closes at >65%"]
    },
    {
      id: "phase-weatherproof-field-deploy",
      title: "Phase 3: Weatherproof Enclosure & Field Deployment",
      description: "Mount assembly inside IP67 sealed box with PG7 cable glands and perform soak testing.",
      featureIds: ["feature-soil-sensing", "feature-solenoid-actuation"],
      tasks: [
        "Mount ESP32, relay, and buck converter on DIN/standoff plate",
        "Seal cable entries using PG7 waterproof glands",
        "Conduct continuous 48-hour automated irrigation stress test"
      ],
      dependsOnPhaseIds: ["phase-solenoid-automation"],
      completionCriteria: ["Controller operates autonomously under water spray exposure without leak"]
    }
  ],
  assumptions: [
    {
      id: "asm-12v-power",
      description: "A continuous 12V DC power source or mains adapter is available near the irrigation manifold.",
      affectedEntityIds: ["comp-power", "comp-solenoid"],
      reason: "High-pressure solenoid valve requires 12V DC coil excitation."
    }
  ],
  openQuestions: [
    {
      id: "q-water-pressure",
      question: "What is the static water line pressure available at the drip irrigation inlet manifold?",
      affectedEntityIds: ["comp-solenoid", "feature-solenoid-actuation"],
      whyItMatters: "Direct-acting vs pilot-operated solenoid valves require specific minimum line pressure (0.02 MPa)."
    }
  ]
};

// =========================================================================
// 2. WEARABLE / HEALTH MONITORING DEVICE
// =========================================================================
const wearableBlueprint = {
  ...baseHardware,
  overview: {
    projectName: "PulseTrack — Biometric Heart Rate & SpO2 Health Wearable Wristband",
    summary: "PulseTrack is an ultra-compact ergonomic wrist wearable designed for real-time photoplethysmography (PPG) pulse oximetry, skin temperature tracking, and haptic biometric alert feedback.",
    problemStatement: "Patients and fitness users needing continuous cardiovascular vitals monitoring are hindered by bulky medical equipment and inconvenient wired fingertip sensors.",
    targetUsers: [
      "Cardiovascular Wellness Patients",
      "Endurance Athletes & Runners",
      "Elderly Care Supervisors"
    ],
    goals: [
      "Continuously measure capillary pulse rate and blood oxygen saturation (SpO2)",
      "Vibrate subtly on the wrist when arrhythmia or hypoxic thresholds are detected",
      "Provide a crisp circular color readout with 36-hour single-charge battery autonomy"
    ],
    scope: [
      "MAX30102 integrated optical pulse oximeter with skin contact lens",
      "NTC precision skin thermistor for surface temperature tracking",
      "ESP32-C3 ultra-low-power RISC-V microcontroller with BLE 5.0",
      "0.96 inch circular AMOLED color display",
      "Coin-type ERM haptic vibration motor",
      "3.7V 300mAh LiPo battery with magnetic pogo-pin charging"
    ],
    outOfScope: [
      "12-lead clinical ECG diagnostics",
      "Cellular 5G eSIM standalone calling",
      "Invasive blood pressure arterial monitoring"
    ]
  },
  features: [
    {
      id: "feature-ppg-sensing",
      name: "Optical Photoplethysmography Pulse & SpO2 Sensing",
      description: "Directs red and infrared optical wavelengths through skin capillaries to calculate heart rate and blood oxygen saturation.",
      priority: "HIGH",
      roleIds: ["role-patient-user"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-skin-temp",
      name: "Continuous Epidermal Temperature Tracking",
      description: "Measures localized skin temperature using a calibrated precision thermistor located on the bottom case plate.",
      priority: "MEDIUM",
      roleIds: ["role-patient-user"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-haptic-alert",
      name: "Silent Haptic Arrhythmia Vibration Feedback",
      description: "Triggers discrete pattern pulses from an internal ERM coin motor when heart rate exceeds customized threshold limits.",
      priority: "HIGH",
      roleIds: ["role-patient-user"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-circular-display",
      name: "Circular AMOLED Vitals Watchface",
      description: "Renders live pulse BPM, SpO2 percentage, battery meter, and step counter on a high-contrast circular display.",
      priority: "HIGH",
      roleIds: ["role-patient-user"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-patient-user",
      name: "Wearable User",
      description: "Wears wristband during daily activities and inspects real-time vitals and vibration alerts.",
      permissions: ["view_live_vitals", "dismiss_haptic_alert", "pair_bluetooth_phone"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-ppg-accuracy",
      type: "FUNCTIONAL",
      description: "System shall sample PPG sensor at 100Hz with digital noise reduction to filter motion artifacts.",
      featureIds: ["feature-ppg-sensing"],
      acceptanceCriteria: ["Heart rate accuracy within +/- 3 BPM compared to ECG baseline", "SpO2 accuracy within +/- 2%"],
      source: "USER_STATED"
    },
    {
      id: "req-battery-life",
      type: "NON_FUNCTIONAL",
      description: "Device must operate for a minimum of 36 continuous hours on a single 300mAh battery charge.",
      featureIds: ["feature-circular-display"],
      acceptanceCriteria: ["Deep-sleep current draw under 25uA between display wake-ups", "Full recharge in under 60 minutes"],
      source: "USER_STATED"
    },
    {
      id: "req-skin-safety",
      type: "NON_FUNCTIONAL",
      description: "Enclosure bottom plate and optical window must be biocompatible and hypoallergenic.",
      featureIds: ["feature-skin-temp"],
      acceptanceCriteria: ["ISO 10993 cytotoxicity and skin irritation compliance", "IP68 water immersion rating"],
      source: "AI_ASSUMED"
    }
  ],
  hardware: {
    applicable: true,
    workingPrinciple: "MAX30102 optical sensor directs alternating 660nm red and 880nm infrared light into capillary bed tissue. Photodiode voltage fluctuations are sampled via I2C by the ESP32-C3 RISC-V core. If BPM or oxygen saturation violates safety boundaries, a miniature coin vibration motor pulses while the circular AMOLED display turns amber/red.",
    components: [
      {
        id: "comp-esp32c3",
        name: "ESP32-C3 Ultra-Low-Power BLE Micro Module",
        category: "MICROCONTROLLER",
        purpose: "Single-core 160MHz RISC-V processor with integrated Bluetooth Low Energy 5.0 and hardware cryptographic engine",
        quantity: 1,
        specification: "ESP32-C3-WROOM-02, 160MHz 32-bit RISC-V, 400KB SRAM, 4MB Flash, compact 18x14mm form-factor",
        alternatives: ["nRF52840 BLE SoC", "RP2040 Zero"],
        estimatedUnitCost: 3.20,
        estimatedTotalCost: 3.20
      },
      {
        id: "comp-max30102",
        name: "MAX30102 Optical PPG Heart Rate & SpO2 Sensor",
        category: "SENSOR",
        purpose: "Skin-contact photoplethysmography sensor measuring blood volumetric absorption peaks",
        quantity: 1,
        specification: "Dual LED (660nm / 880nm), integrated photodetector, 18-bit ADC, I2C interface, 1.8V logic",
        alternatives: ["MAX30100", "Pulse Sensor Amped Optical"],
        estimatedUnitCost: 4.80,
        estimatedTotalCost: 4.80
      },
      {
        id: "comp-skin-temp",
        name: "NTC Precision Medical Skin Thermistor",
        category: "SENSOR",
        purpose: "Localized epidermal surface temperature sensor embedded in bottom casing",
        quantity: 1,
        specification: "10k ohm @ 25C, 1% tolerance, B-value 3950K, stainless disc contact cap",
        alternatives: ["TMP117 High-Precision Digital Sensor", "MLX90614 Contactless IR"],
        estimatedUnitCost: 1.20,
        estimatedTotalCost: 1.20
      },
      {
        id: "comp-vibe-motor",
        name: "ERM Coin-Type Haptic Micro-Vibration Motor",
        category: "ACTUATOR",
        purpose: "Silent tactile wrist notification for threshold alerts and button tap feedback",
        quantity: 1,
        specification: "10mm diameter x 3mm height, 3V DC, 75mA, 12,000 RPM eccentric rotating mass",
        alternatives: ["Linear Resonant Actuator (LRA)", "Piezo Haptic Disc"],
        estimatedUnitCost: 1.50,
        estimatedTotalCost: 1.50
      },
      {
        id: "comp-oled-round",
        name: "0.96-Inch Circular AMOLED Color Display",
        category: "DISPLAY",
        purpose: "Ultra-crisp circular vitals dashboard showing live pulse BPM and oxygen saturation",
        quantity: 1,
        specification: "240x240 pixel resolution, GC9A01 SPI driver, 65k full color, 300 nits brightness",
        alternatives: ["1.28 inch Round LCD", "0.96 inch Square Monochrome OLED"],
        estimatedUnitCost: 5.60,
        estimatedTotalCost: 5.60
      },
      {
        id: "comp-lipo",
        name: "3.7V 300mAh Miniature Rechargeable LiPo Battery",
        category: "POWER",
        purpose: "Lightweight internal battery providing 36 hours of continuous biometric tracking",
        quantity: 1,
        specification: "3.7V nominal, 300mAh, integrated PCM over-discharge/short-circuit protection, 502030 pouch",
        alternatives: ["LIR2032 Coin Rechargeable Cell", "400mAh LiPo Cell"],
        estimatedUnitCost: 3.80,
        estimatedTotalCost: 3.80
      },
      {
        id: "comp-power",
        name: "Magnetic 2-Pin Pogo USB Charging Port & TP4056 IC",
        category: "POWER",
        purpose: "Waterproof magnetic charging interface with linear constant-current LiPo management",
        quantity: 1,
        specification: "Magnetic keyed pogo-pins, TP4056 200mA charge limiter, reverse polarity protection",
        alternatives: ["Qi Wireless Inductive Charging Coil", "Sealed USB-C Port"],
        estimatedUnitCost: 2.10,
        estimatedTotalCost: 2.10
      }
    ],
    controllers: ["ESP32-C3 Ultra-Low-Power RISC-V 160MHz"],
    sensors: ["MAX30102 PPG Optical Heart Rate Sensor", "NTC Skin Surface Thermistor"],
    actuators: ["ERM Coin Micro-Vibration Motor"],
    communicationModules: ["Bluetooth Low Energy (BLE 5.0) Nordic Protocol"],
    powerRequirements: {
      voltageRail: "3.7V LiPo rail stepped down to 3.3V system logic and 1.8V optical sensor VDD",
      powerSource: "Internal 3.7V 300mAh LiPo battery with magnetic USB charging",
      estimatedCurrentDraw: "15mA active display; 45mA during vibration alert; 45uA background sleep"
    },
    pinConnections: [
      "ESP32-C3 GPIO8 (SDA) <-> MAX30102 SDA Pin",
      "ESP32-C3 GPIO9 (SCL) <-> MAX30102 SCL Pin",
      "ESP32-C3 GPIO3 (INT) <-> MAX30102 Interrupt Pin",
      "ESP32-C3 GPIO5 (PWM) <-> Vibration Motor Driver Transistor Gate",
      "ESP32-C3 GPIO0 (ADC0) <-> Skin Thermistor Divider Pin",
      "ESP32-C3 SPI (MOSI/SCLK/CS) <-> Circular AMOLED Display",
      "LiPo Battery (+) <-> TP4056 BAT+ Pin and System Power Switch"
    ],
    connections: [
      {
        id: "conn-max-sda",
        fromComponentId: "comp-esp32c3",
        fromPin: "GPIO8",
        toComponentId: "comp-max30102",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "I2C Serial Data line for optical PPG sensor"
      },
      {
        id: "conn-max-scl",
        fromComponentId: "comp-esp32c3",
        fromPin: "GPIO9",
        toComponentId: "comp-max30102",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "I2C Serial Clock line for optical sensor"
      },
      {
        id: "conn-max-int",
        fromComponentId: "comp-max30102",
        fromPin: "INT",
        toComponentId: "comp-esp32c3",
        toPin: "GPIO3",
        signalType: "DIGITAL_IN",
        voltage: "3.3V",
        purpose: "Hardware interrupt signaling new sample ready in FIFO"
      },
      {
        id: "conn-vibe-pwm",
        fromComponentId: "comp-esp32c3",
        fromPin: "GPIO5",
        toComponentId: "comp-vibe-motor",
        toPin: "IN",
        signalType: "PWM",
        voltage: "3.3V",
        purpose: "Pulse-width modulated drive signal for haptic alerts"
      },
      {
        id: "conn-temp-analog",
        fromComponentId: "comp-skin-temp",
        fromPin: "VOUT",
        toComponentId: "comp-esp32c3",
        toPin: "GPIO0",
        signalType: "ANALOG",
        voltage: "0-3.3V",
        purpose: "Epidermal temperature voltage divider reading"
      },
      {
        id: "conn-oled-spi",
        fromComponentId: "comp-esp32c3",
        fromPin: "SPI_MOSI",
        toComponentId: "comp-oled-round",
        toPin: "MOSI",
        signalType: "SPI",
        voltage: "3.3V",
        purpose: "High-speed SPI frame transfer for circular display"
      },
      {
        id: "conn-battery-pwr",
        fromComponentId: "comp-lipo",
        fromPin: "BAT+",
        toComponentId: "comp-esp32c3",
        toPin: "VIN",
        signalType: "POWER",
        voltage: "3.7V",
        purpose: "LiPo battery power delivery to regulator"
      },
      {
        id: "conn-charger-pwr",
        fromComponentId: "comp-power",
        fromPin: "VBUS",
        toComponentId: "comp-lipo",
        toPin: "CHG_IN",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Magnetic charging current from external USB"
      }
    ],
    enclosure: {
      type: "WEARABLE_CASE",
      material: "Ergonomic Polycarbonate Chassis with Hypoallergenic Fluororubber Wrist Straps",
      dimensions: "52mm x 44mm x 16mm",
      protectionRating: "IP68 sweat & splash resistant"
    },
    enclosureConcept: {
      type: "WEARABLE_CASE",
      name: "Ergonomic Wristband Enclosure",
      material: "Ergonomic Polycarbonate Chassis with Hypoallergenic Fluororubber Wrist Straps",
      dimensions: "52mm x 44mm x 16mm",
      protectionRating: "IP68 sweat & splash resistant"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "WEARABLE_CASE",
        dimensions: [52, 16, 44],
        color: "#0f172a",
        opacity: 0.4,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-esp32c3",
          primitiveType: "BOARD",
          dimensions: [26, 4, 20],
          position: [0, 4, 0],
          rotation: [0, 0, 0],
          color: "#047857",
          label: "ESP32-C3 BLE Micro Module"
        },
        {
          componentId: "comp-oled-round",
          primitiveType: "DISPLAY_PANEL",
          dimensions: [32, 4, 32],
          position: [0, 9, 0],
          rotation: [0, 0, 0],
          color: "#38bdf8",
          label: "0.96-Inch Circular AMOLED Display"
        },
        {
          componentId: "comp-max30102",
          primitiveType: "SENSOR_MODULE",
          dimensions: [16, 6, 16],
          position: [0, -4, 0],
          rotation: [0, 0, 0],
          color: "#ef4444",
          label: "MAX30102 Optical Pulse Sensor (Underside)"
        },
        {
          componentId: "comp-vibe-motor",
          primitiveType: "CYLINDER",
          dimensions: [12, 6, 12],
          position: [15, 4, 8],
          rotation: [0, 0, 0],
          color: "#64748b",
          label: "Haptic Coin Vibration Motor"
        },
        {
          componentId: "comp-skin-temp",
          primitiveType: "SENSOR_MODULE",
          dimensions: [10, 5, 10],
          position: [-14, -3, 8],
          rotation: [0, 0, 0],
          color: "#10b981",
          label: "Medical Skin Thermistor"
        },
        {
          componentId: "comp-lipo",
          primitiveType: "BOX",
          dimensions: [24, 5, 20],
          position: [0, 1, -10],
          rotation: [0, 0, 0],
          color: "#94a3b8",
          label: "3.7V 300mAh LiPo Cell"
        },
        {
          componentId: "comp-power",
          primitiveType: "CONNECTOR",
          dimensions: [14, 5, 8],
          position: [-20, 4, 0],
          rotation: [0, 0, 0],
          color: "#f59e0b",
          label: "Magnetic Pogo Charger"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-biometric-sampling",
      title: "Phase 1: Optical PPG & Temperature Sensor Validation",
      description: "Validate MAX30102 I2C register configuration and NTC thermistor ADC readout.",
      featureIds: ["feature-ppg-sensing", "feature-skin-temp"],
      tasks: [
        "Interface MAX30102 over I2C with ESP32-C3",
        "Implement SpO2 and pulse peak detection algorithm",
        "Calibrate Steinhart-Hart equation for skin thermistor"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Accurate pulse BPM and temperature displayed on serial terminal"]
    },
    {
      id: "phase-haptics-display",
      title: "Phase 2: AMOLED Display & Haptic Alert Feedback",
      description: "Implement circular watchface graphics and silent ERM motor vibration patterns.",
      featureIds: ["feature-haptic-alert", "feature-circular-display"],
      tasks: [
        "Port GC9A01 circular display driver for ESP32-C3",
        "Design real-time heart rate gauge and battery indicator",
        "Create PWM vibration patterns for arrhythmia threshold alerts"
      ],
      dependsOnPhaseIds: ["phase-biometric-sampling"],
      completionCriteria: ["Vitals render cleanly on round AMOLED and buzzer/motor vibrates on alert"]
    },
    {
      id: "phase-wearable-casing",
      title: "Phase 3: Ergonomic Wrist Casing & Battery Management",
      description: "Assemble flexible silicone strap, magnetic charging dock, and verify 36-hour autonomy.",
      featureIds: ["feature-ppg-sensing", "feature-circular-display"],
      tasks: [
        "Integrate 300mAh LiPo and MCP73831 charging circuit with pogo pins",
        "Fit assembly into SLA resin circular case with curved lens",
        "Measure active vs deep sleep power consumption"
      ],
      dependsOnPhaseIds: ["phase-haptics-display"],
      completionCriteria: ["Continuous 36-hour runtime achieved on single charge cycle"]
    }
  ],
  assumptions: [
    {
      id: "asm-wrist-contact",
      description: "User maintains snug wrist contact so optical window touches skin without ambient light leakage.",
      affectedEntityIds: ["comp-max30102", "feature-ppg-sensing"],
      reason: "PPG sensor accuracy degrades significantly under ambient light interference."
    }
  ],
  openQuestions: [
    {
      id: "q-charging-dock",
      question: "Should magnetic pogo pins or standard USB-C port be used for device charging?",
      affectedEntityIds: ["comp-power", "feature-circular-display"],
      whyItMatters: "Affects waterproof seal rating and enclosure thickness."
    }
  ]
};

// =========================================================================
// 3. ROBOTICS / AUTONOMOUS OBSTACLE-AVOIDANCE ROVER
// =========================================================================
const roboticsBlueprint = {
  ...baseHardware,
  overview: {
    projectName: "RoverNav — Autonomous Sonar Obstacle-Avoidance Robotic Vehicle",
    summary: "RoverNav is an educational two-wheel differential drive mobile robot platform designed to autonomously navigate cluttered indoor terrain using forward ultrasonic sonar scanning and high-torque DC gear motors.",
    problemStatement: "Introductory robotics students struggle with the complex integration gap between ultrasonic range finding, motor driver H-bridge PWM steering logic, and power isolation.",
    targetUsers: [
      "Robotics & Mechatronics Students",
      "STEM Workshop Educators",
      "Autonomous Systems Hobbyists"
    ],
    goals: [
      "Continuously sweep front obstacle distance using a servo-mounted ultrasonic sensor",
      "Execute responsive differential steering maneuvers to avoid objects closer than 20cm",
      "Provide independent high-current motor power rails protected against back-EMF spikes"
    ],
    scope: [
      "HC-SR04 ultrasonic rangefinder mounted on SG90 sweep micro-servo",
      "L298N dual H-bridge motor driver with finned aluminum heatsink",
      "Dual 1:48 TT DC gear motors with 65mm rubber tread drive wheels",
      "Dual-deck smoked acrylic mobile chassis with front omni-directional caster ball",
      "2x 18650 7.4V rechargeable battery pack with power rocker switch",
      "Arduino Uno R3 central microcontroller with motor shield"
    ],
    outOfScope: [
      "SLAM LiDAR 2D room mapping",
      "Computer vision camera object detection",
      "Outdoor GPS waypoint navigation"
    ]
  },
  features: [
    {
      id: "feature-sonar-sweep",
      name: "Dynamic Sonar Distance Sweeping",
      description: "Pans an ultrasonic sensor left-center-right using a micro-servo to calculate clear heading vectors.",
      priority: "HIGH",
      roleIds: ["role-robot-programmer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-differential-drive",
      name: "Dual H-Bridge Differential Steering Control",
      description: "Generates synchronized pulse-width modulation (PWM) signals to control left and right motor speed and direction.",
      priority: "HIGH",
      roleIds: ["role-robot-programmer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-wheel-encoders",
      name: "Optical Wheel Odometry Tracking",
      description: "Counts slotted wheel revolutions using infrared optical encoders to calculate vehicle travel distance.",
      priority: "MEDIUM",
      roleIds: ["role-robot-programmer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-emergency-stop",
      name: "Autonomous Obstacle Safe-Braking",
      description: "Cuts motor drive immediately if an obstacle suddenly appears within critical 10cm emergency threshold.",
      priority: "HIGH",
      roleIds: ["role-robot-programmer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-robot-programmer",
      name: "Robotics Student Developer",
      description: "Tunes navigation avoidance algorithms, tests obstacle thresholds, and monitors battery charge.",
      permissions: ["upload_navigation_firmware", "calibrate_steering_trim", "read_sonar_metrics"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-sonar-range",
      type: "FUNCTIONAL",
      description: "Ultrasonic sonar sensor shall detect obstacles within a range of 2cm to 300cm with 3mm accuracy.",
      featureIds: ["feature-sonar-sweep"],
      acceptanceCriteria: ["Obstacle echo timing measured via hardware interrupt", "Servo sweep cycle executes in under 400ms"],
      source: "USER_STATED"
    },
    {
      id: "req-motor-torque",
      type: "NON_FUNCTIONAL",
      description: "Gear motors must provide sufficient torque to propel a 600g chassis up a 15-degree incline.",
      featureIds: ["feature-differential-drive"],
      acceptanceCriteria: ["Differential turning radius under 20cm", "Operating speed between 0.3m/s and 0.6m/s"],
      source: "USER_STATED"
    },
    {
      id: "req-back-emf-protection",
      type: "NON_FUNCTIONAL",
      description: "Motor driver circuit must incorporate flyback protection diodes to absorb inductive back-EMF spikes.",
      featureIds: ["feature-differential-drive"],
      acceptanceCriteria: ["Flyback diode clamping verified", "Zero reset glitches on MCU power line during sudden motor stops"],
      source: "AI_ASSUMED"
    }
  ],
  hardware: {
    applicable: true,
    workingPrinciple: "Arduino Uno triggers 10us ultrasonic burst from HC-SR04; echo pulse duration calculates distance. If forward clearance is under 20cm, SG90 servo pans 60 degrees left and right to evaluate alternative paths, then drives the L298N H-bridge with PWM to execute an in-place pivot turn.",
    components: [
      {
        id: "comp-arduino",
        name: "Arduino Uno R3 Microcontroller Board",
        category: "MICROCONTROLLER",
        purpose: "8-bit AVR central controller executing navigation loop, pulse timing, and motor PWM logic",
        quantity: 1,
        specification: "ATmega328P, 16MHz clock, 14 digital I/O (6 PWM), 6 analog inputs, 5V logic",
        alternatives: ["ESP32 DevKit V1", "Arduino Nano Every"],
        estimatedUnitCost: 5.20,
        estimatedTotalCost: 5.20
      },
      {
        id: "comp-l298n",
        name: "L298N Dual H-Bridge Motor Driver Module",
        category: "ACTUATOR",
        purpose: "Controls speed and direction of two high-current DC gear motors with aluminum heatsink",
        quantity: 1,
        specification: "Dual H-bridge, 2A peak per channel, 5V-35V motor voltage, onboard 5V regulator, flyback protection",
        alternatives: ["TB6612FNG Dual Motor Driver", "DRV8833 Low Voltage Driver"],
        estimatedUnitCost: 3.80,
        estimatedTotalCost: 3.80
      },
      {
        id: "comp-hcsr04",
        name: "HC-SR04 Ultrasonic Sonar Distance Sensor",
        category: "SENSOR",
        purpose: "Measures distance to front obstacles via 40kHz acoustic echo time-of-flight",
        quantity: 1,
        specification: "2cm to 400cm range, 15 degree measurement angle, 5V operating voltage",
        alternatives: ["TF-Luna Micro LiDAR", "Sharp GP2Y0A21YK0F Optical Distance Sensor"],
        estimatedUnitCost: 2.50,
        estimatedTotalCost: 2.50
      },
      {
        id: "comp-servo",
        name: "SG90 Micro Sweep Servo Motor",
        category: "ACTUATOR",
        purpose: "Pans the ultrasonic sensor across 180-degree sweep arc to scan surroundings",
        quantity: 1,
        specification: "9g weight, 1.8 kg-cm torque, 0.1s/60deg speed, 4.8V-6V operating range",
        alternatives: ["MG90S Metal Gear Servo", "Standard 180-Degree Micro Servo"],
        estimatedUnitCost: 2.20,
        estimatedTotalCost: 2.20
      },
      {
        id: "comp-motor-left",
        name: "Left TT Gear Motor & 65mm Rubber Tread Tire",
        category: "ACTUATOR",
        purpose: "High-torque 1:48 gear motor driving left chassis side",
        quantity: 1,
        specification: "3V-6V DC, 1:48 reduction gearbox, 200 RPM @ 6V, 65mm diameter rubber tire",
        alternatives: ["Metal Gear N20 Motor", "Continuous Rotation Servo Wheel"],
        estimatedUnitCost: 3.00,
        estimatedTotalCost: 3.00
      },
      {
        id: "comp-motor-right",
        name: "Right TT Gear Motor & 65mm Rubber Tread Tire",
        category: "ACTUATOR",
        purpose: "High-torque 1:48 gear motor driving right chassis side",
        quantity: 1,
        specification: "3V-6V DC, 1:48 reduction gearbox, 200 RPM @ 6V, 65mm diameter rubber tire",
        alternatives: ["Metal Gear N20 Motor", "Continuous Rotation Servo Wheel"],
        estimatedUnitCost: 3.00,
        estimatedTotalCost: 3.00
      },
      {
        id: "comp-battery",
        name: "2x 18650 7.4V Li-ion Battery Holder Pack",
        category: "POWER",
        purpose: "Provides 7.4V high-drain power to motors and Arduino VIN jack",
        quantity: 1,
        specification: "Dual series 18650 cell holder, 7.4V nominal output, integrated rocker on/off switch",
        alternatives: ["6x AA 9V Battery Holder", "2S 7.4V 1500mAh RC LiPo Pack"],
        estimatedUnitCost: 4.80,
        estimatedTotalCost: 4.80
      },
      {
        id: "comp-encoder",
        name: "Dual Optical Wheel Speed Encoder Sensors",
        category: "SENSOR",
        purpose: "Measures wheel rotation ticks for straight-line navigation and dead reckoning",
        quantity: 1,
        specification: "Slotted optical IR phototransistor, digital pulse output, 20-slot encoder disc",
        alternatives: ["Hall Effect Magnetic Encoders", "Optical Mouse Sensor"],
        estimatedUnitCost: 2.40,
        estimatedTotalCost: 2.40
      }
    ],
    controllers: ["Arduino Uno R3 ATmega328P 16MHz"],
    sensors: ["HC-SR04 Ultrasonic Sonar Module", "Optical Wheel Encoders"],
    actuators: ["L298N Dual Motor Driver", "Dual TT Gear Motors", "SG90 Micro Servo"],
    communicationModules: ["USB Serial Programming & Telemetry Port"],
    powerRequirements: {
      voltageRail: "7.4V unregulated motor supply; 5.0V regulated microcontroller and sensor supply",
      powerSource: "Dual 18650 7.4V Li-ion rechargeable battery pack",
      estimatedCurrentDraw: "Nominal 350mA cruising; Peak 1.2A during stall / rapid pivot turns"
    },
    pinConnections: [
      "Arduino 5V Pin <-> HC-SR04 and SG90 VCC",
      "Arduino GND Pin <-> Common System Ground",
      "Arduino D7 <-> HC-SR04 Trigger Pin",
      "Arduino D8 <-> HC-SR04 Echo Pin",
      "Arduino D6 (PWM) <-> SG90 Servo Signal",
      "Arduino D9 (PWM) <-> L298N ENA (Left Speed)",
      "Arduino D10 (PWM) <-> L298N ENB (Right Speed)",
      "Arduino D2 / D3 <-> L298N IN1 / IN2 (Left Direction)",
      "Arduino D4 / D5 <-> L298N IN3 / IN4 (Right Direction)",
      "Battery 7.4V (+) <-> L298N 12V Screw Terminal and Arduino VIN"
    ],
    connections: [
      {
        id: "conn-sonar-trig",
        fromComponentId: "comp-arduino",
        fromPin: "D7",
        toComponentId: "comp-hcsr04",
        toPin: "TRIG",
        signalType: "DIGITAL_OUT",
        voltage: "5.0V",
        purpose: "10us ultrasonic pulse trigger"
      },
      {
        id: "conn-sonar-echo",
        fromComponentId: "comp-hcsr04",
        fromPin: "ECHO",
        toComponentId: "comp-arduino",
        toPin: "D8",
        signalType: "DIGITAL_IN",
        voltage: "5.0V",
        purpose: "Echo pulse width proportional to target distance"
      },
      {
        id: "conn-servo-pwm",
        fromComponentId: "comp-arduino",
        fromPin: "D6",
        toComponentId: "comp-servo",
        toPin: "PWM",
        signalType: "PWM",
        voltage: "5.0V",
        purpose: "50Hz PWM signal for servo angle positioning"
      },
      {
        id: "conn-motor-left-a",
        fromComponentId: "comp-l298n",
        fromPin: "OUT1",
        toComponentId: "comp-motor-left",
        toPin: "M+",
        signalType: "POWER",
        voltage: "7.4V",
        purpose: "High-current H-bridge drive to left gear motor"
      },
      {
        id: "conn-motor-left-b",
        fromComponentId: "comp-l298n",
        fromPin: "OUT2",
        toComponentId: "comp-motor-left",
        toPin: "M-",
        signalType: "POWER",
        voltage: "7.4V",
        purpose: "Return line for left motor bidirectional control"
      },
      {
        id: "conn-motor-right-a",
        fromComponentId: "comp-l298n",
        fromPin: "OUT3",
        toComponentId: "comp-motor-right",
        toPin: "M+",
        signalType: "POWER",
        voltage: "7.4V",
        purpose: "High-current H-bridge drive to right gear motor"
      },
      {
        id: "conn-motor-right-b",
        fromComponentId: "comp-l298n",
        fromPin: "OUT4",
        toComponentId: "comp-motor-right",
        toPin: "M-",
        signalType: "POWER",
        voltage: "7.4V",
        purpose: "Return line for right motor bidirectional control"
      },
      {
        id: "conn-battery-pwr",
        fromComponentId: "comp-battery",
        fromPin: "7V4_OUT",
        toComponentId: "comp-l298n",
        toPin: "VMS",
        signalType: "POWER",
        voltage: "7.4V",
        purpose: "High-current battery rail feeding L298N motor bridges"
      }
    ],
    enclosure: {
      type: "ROBOTIC_CHASSIS",
      material: "Dual-Deck Smoked Acrylic Robotic Chassis with Integrated DC Motor Brackets",
      dimensions: "160mm x 120mm x 42mm",
      protectionRating: "Open mobile robotics platform with front bumper"
    },
    enclosureConcept: {
      type: "ROBOTIC_CHASSIS",
      name: "Robotic Mobile Platform Chassis",
      material: "Dual-Deck Smoked Acrylic Robotic Chassis with Integrated DC Motor Brackets",
      dimensions: "160mm x 120mm x 42mm",
      protectionRating: "Open mobile robotics platform with front bumper"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "ROBOTIC_CHASSIS",
        dimensions: [160, 42, 120],
        color: "#1e3a8a",
        opacity: 0.35,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-arduino",
          primitiveType: "BOARD",
          dimensions: [65, 8, 50],
          position: [0, 24, -15],
          rotation: [0, 0, 0],
          color: "#065f46",
          label: "Arduino Uno R3 Microcontroller"
        },
        {
          componentId: "comp-l298n",
          primitiveType: "BOARD",
          dimensions: [45, 22, 45],
          position: [0, 12, -10],
          rotation: [0, 0, 0],
          color: "#dc2626",
          label: "L298N Dual H-Bridge Motor Driver"
        },
        {
          componentId: "comp-hcsr04",
          primitiveType: "SENSOR_MODULE",
          dimensions: [45, 18, 15],
          position: [0, 20, 55],
          rotation: [0, 0, 0],
          color: "#38bdf8",
          label: "HC-SR04 Ultrasonic Sonar Eyes"
        },
        {
          componentId: "comp-servo",
          primitiveType: "BOX",
          dimensions: [22, 16, 12],
          position: [0, 8, 48],
          rotation: [0, 0, 0],
          color: "#2563eb",
          label: "SG90 Radar Sweep Servo"
        },
        {
          componentId: "comp-motor-left",
          primitiveType: "CYLINDER",
          dimensions: [16, 45, 45],
          position: [-65, 14, 0],
          rotation: [0, 0, 90],
          color: "#18181b",
          label: "Left TT Gear Motor & Rubber Tire"
        },
        {
          componentId: "comp-motor-right",
          primitiveType: "CYLINDER",
          dimensions: [16, 45, 45],
          position: [65, 14, 0],
          rotation: [0, 0, 90],
          color: "#18181b",
          label: "Right TT Gear Motor & Rubber Tire"
        },
        {
          componentId: "comp-battery",
          primitiveType: "BOX",
          dimensions: [55, 20, 40],
          position: [0, 10, -45],
          rotation: [0, 0, 0],
          color: "#334155",
          label: "2x 18650 7.4V Battery Pack"
        },
        {
          componentId: "comp-encoder",
          primitiveType: "SENSOR_MODULE",
          dimensions: [15, 10, 12],
          position: [-45, 10, 0],
          rotation: [0, 0, 0],
          color: "#10b981",
          label: "Optical Wheel Speed Encoder"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-motor-drivetrain",
      title: "Phase 1: Drivetrain & Motor Controller Integration",
      description: "Mount TT gear motors on acrylic chassis and verify L298N bidirectional PWM speed control.",
      featureIds: ["feature-differential-drive", "feature-wheel-encoders"],
      tasks: [
        "Mount DC gear motors, rubber wheels, and front caster ball",
        "Wire L298N H-bridge to Arduino Uno PWM digital pins",
        "Verify optical wheel encoder interrupts for odometry counting"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Rover executes forward, reverse, and spot-turn maneuvers under PWM control"]
    },
    {
      id: "phase-sonar-navigation",
      title: "Phase 2: Sonar Radar Sweep & Obstacle Avoidance",
      description: "Mount HC-SR04 on SG90 servo turret and implement reactive navigation algorithm.",
      featureIds: ["feature-sonar-sweep", "feature-emergency-stop"],
      tasks: [
        "Mount ultrasonic sensor on servo pan-tilt bracket",
        "Implement 180-degree radar sweep scanning routine",
        "Program collision distance threshold state machine with safety stop"
      ],
      dependsOnPhaseIds: ["phase-motor-drivetrain"],
      completionCriteria: ["Rover autonomously navigates around obstacles without physical collisions"]
    },
    {
      id: "phase-rover-integration",
      title: "Phase 3: Chassis Deck Stacking & Power Management",
      description: "Assemble upper smoked acrylic deck, 7.4V Li-ion pack, and run continuous navigation tests.",
      featureIds: ["feature-differential-drive", "feature-sonar-sweep"],
      tasks: [
        "Fasten upper deck with brass standoffs and route wiring cleanly",
        "Connect 2S 18650 battery holder with power switch and LM2596 buck",
        "Perform 30-minute continuous obstacle avoidance navigation run"
      ],
      dependsOnPhaseIds: ["phase-sonar-navigation"],
      completionCriteria: ["Rover operates smoothly for 30+ minutes on obstacle course"]
    }
  ],
  assumptions: [
    {
      id: "asm-flat-terrain",
      description: "Rover operates primarily on indoor flat or low-pile carpeted terrain.",
      affectedEntityIds: ["comp-motor-left", "comp-motor-right"],
      reason: "Differential dual-wheel drive with caster is optimized for smooth planar surfaces."
    }
  ],
  openQuestions: [
    {
      id: "q-remote-override",
      question: "Is manual remote control override (Bluetooth / IR) required in addition to autonomous mode?",
      affectedEntityIds: ["comp-arduino", "feature-emergency-stop"],
      whyItMatters: "Requires reserving hardware UART or timer pins for wireless receiver."
    }
  ]
};

// Write fixtures to shared and backend directories
const fixtures = [
  { name: 'hardware_agriculture_blueprint.json', data: agricultureBlueprint },
  { name: 'hardware_wearable_blueprint.json', data: wearableBlueprint },
  { name: 'hardware_robotics_blueprint.json', data: roboticsBlueprint },
];

for (const { name, data } of fixtures) {
  const sharedPath = path.join(sharedFixturesDir, name);
  const backendPath = path.join(backendFixturesDir, name);
  
  fs.writeFileSync(sharedPath, JSON.stringify(data, null, 2), 'utf8');
  fs.writeFileSync(backendPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Generated: ${name}`);
}

console.log('\nAll 3 project archetype fixtures generated successfully!');
