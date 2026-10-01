import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const backendFixturesDir = path.join(projectRoot, 'backend', 'src', 'main', 'resources', 'fixtures');
const sharedFixturesDir = path.join(projectRoot, 'shared', 'fixtures');

// Read existing food_ordering_blueprint.json as the baseline for the software fixture
const baseFoodPath = path.join(sharedFixturesDir, 'food_ordering_blueprint.json');
const baseFood = JSON.parse(fs.readFileSync(baseFoodPath, 'utf8'));

// -------------------------------------------------------------
// 1. SOFTWARE FIXTURE: Campus Food Ordering & Pickup
// -------------------------------------------------------------
const softwareBlueprint = {
  ...baseFood,
  schemaVersion: "2.0",
  projectType: "SOFTWARE",
  classification: {
    type: "SOFTWARE",
    reason: "Project focuses on software architecture, frontend screens, database schema design, and backend REST APIs.",
    confidence: "HIGH"
  },
  estimates: {
    difficulty: "MEDIUM",
    estimatedDuration: "6–8 weeks",
    recommendedTeamSize: 4,
    teamRoles: [
      { role: "Frontend Engineer", count: 1, responsibility: "Student mobile-responsive web app, menu browser, and live pickup UI" },
      { role: "Backend Engineer", count: 1, responsibility: "Spring Boot REST services, concurrency control, and MongoDB persistence" },
      { role: "UI/UX Designer", count: 1, responsibility: "High-contrast kitchen display board and student ordering flows" },
      { role: "QA Engineer", count: 1, responsibility: "Automated order flow testing and peak concurrency validation" }
    ],
    estimatedCost: {
      currency: "USD",
      minimum: 15000,
      maximum: 28000,
      basis: "4 engineers over 6–8 weeks, cloud hosting, and SMS notification gateways.",
      disclaimer: "Approximate estimate based on the supplied requirements."
    },
    resources: [
      { name: "Application Server Cluster", type: "INFRASTRUCTURE", purpose: "Spring Boot application deployment" },
      { name: "Managed MongoDB Database", type: "INFRASTRUCTURE", purpose: "Transactional persistence for orders and menus" },
      { name: "SMS Gateway Service", type: "SERVICE", purpose: "Dispatching pickup alert notifications" }
    ]
  },
  software: {
    applicable: true,
    architecture: {
      pattern: "Client-Server Layered Architecture",
      description: "Single-page React client communicating with a Spring Boot REST API layer backed by MongoDB persistence."
    },
    recommendedTechStack: {
      frontend: {
        technology: "React 19 + Vite",
        reason: "Lightweight virtual DOM and fast mobile bundle delivery for students walking between lectures",
        alternatives: ["Next.js", "Vue 3"],
        tradeOffs: "Client-side routing requires separate SSR configuration if SEO is required"
      },
      backend: {
        technology: "Spring Boot 3 (Java 21)",
        reason: "Enterprise stability, strong concurrency primitives, and clean separation of concerns",
        alternatives: ["Node.js / Express", "FastAPI"],
        tradeOffs: "Higher initial memory footprint than micro-frameworks"
      },
      database: {
        technology: "MongoDB",
        reason: "Flexible document structure well suited for nested meal customizations, menus, and dynamic line items",
        alternatives: ["PostgreSQL"],
        tradeOffs: "Requires careful application-level indexing for high-volume transactions"
      },
      deployment: {
        technology: "Docker + Linux Cloud VPS",
        reason: "Containerized reproducible execution with predictable cost",
        alternatives: ["AWS ECS / Fargate", "Vercel"],
        tradeOffs: "Requires container maintenance and manual orchestration"
      },
      testing: {
        technology: "JUnit 5 + Mockito + Playwright",
        reason: "Full verification from isolated business rules to browser ordering flows",
        alternatives: ["Cypress", "Selenium"],
        tradeOffs: "Browser tests require browser binary provisioning in CI"
      },
      optionalServices: [
        {
          technology: "Redis",
          reason: "Fast in-memory cache for vendor daily menu and peak session tokens",
          alternatives: ["Local In-Memory Cache"],
          tradeOffs: "Adds an additional stateful service to monitor"
        }
      ]
    },
    modules: [
      { id: "mod-menu", name: "Menu & Vendor Catalog", description: "Vendor directory, item listings, and pricing", responsibilities: "Filter dietary tags, verify operational hours" },
      { id: "mod-order", name: "Order Lifecycle Engine", description: "Cart calculation, slot booking, and state transitions", responsibilities: "Atomic inventory validation, queue dispatch" }
    ],
    database: baseFood.database,
    apis: baseFood.apis,
    screens: baseFood.uiScreens,
    userFlows: [
      {
        id: "flow-student-order",
        name: "Student Pre-Order & Pickup Flow",
        description: "Student browses food options, customizes meal, selects pickup time, and collects meal.",
        steps: [
          "Open campus dining app",
          "Select vendor and choose food item",
          "Customize dietary options (e.g. spice level)",
          "Select available 5-minute pickup time window",
          "Confirm order and receive pickup pass",
          "Show barcode at pickup station to collect food"
        ]
      }
    ],
    integrations: [
      {
        source: "Order Service",
        destination: "Campus SMS Gateway",
        protocol: "HTTPS",
        data: "Order ready notifications with student phone and pickup code",
        purpose: "Alert students when kitchen marks order ready"
      }
    ],
    testingStrategy: {
      unitTesting: "JUnit 5 for business services and order slot calculations",
      integrationTesting: "Spring Data MongoDB integration tests with embedded MongoDB",
      e2eTesting: "Playwright automated journeys covering student checkout to vendor receipt"
    },
    deploymentPlan: {
      environment: "Docker container on Linux Cloud Host",
      steps: [
        "Compile backend jar and build frontend production assets",
        "Package multi-stage Docker image",
        "Run automated health checks on /api/health",
        "Configure SSL reverse proxy via Caddy/Nginx"
      ],
      monitoring: "Structured JSON logging and Spring Boot Actuator endpoints"
    },
    prototype: {
      generated: true,
      platform: "WEB",
      startScreenId: "screen-vendors",
      screens: [
        {
          id: "screen-vendors",
          name: "Campus Dining Vendors",
          purpose: "Browse active campus dining halls and food trucks",
          layout: "SINGLE_COLUMN",
          sampleData: { campus: "University Central Campus" },
          components: [
            {
              id: "cmp-heading",
              type: "Heading",
              props: { level: 2, text: "Campus Dining Locations" }
            },
            {
              id: "cmp-desc",
              type: "Text",
              props: { content: "Skip the lunchtime rush — pre-order meals for fast pickup between lectures." }
            },
            {
              id: "cmp-vendor-list",
              type: "List",
              props: {
                items: [
                  { id: "v1", title: "Green Quad Burrito Truck", badge: "Open • Fast Pickup", subtitle: "Tacos, Bowls & Fresh Salsa (Avg wait: 4 min)" },
                  { id: "v2", title: "Student Center Diner", badge: "Open", subtitle: "Burgers, Fries & Salads (Avg wait: 8 min)" },
                  { id: "v3", title: "Library Espresso Bar", badge: "Open", subtitle: "Artisan Coffee & Gourmet Paninis (Avg wait: 2 min)" }
                ]
              }
            },
            {
              id: "cmp-btn-menu",
              type: "Button",
              props: { label: "Select Green Quad Truck Menu", variant: "primary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-menu" }
            }
          ]
        },
        {
          id: "screen-menu",
          name: "Vendor Menu & Customizer",
          purpose: "Select dish, customize options, and reserve pickup window",
          layout: "SINGLE_COLUMN",
          sampleData: { vendor: "Green Quad Burrito Truck" },
          components: [
            {
              id: "cmp-menu-heading",
              type: "Heading",
              props: { level: 2, text: "Green Quad Burrito Truck" }
            },
            {
              id: "cmp-item-card",
              type: "Card",
              props: {
                title: "Fiesta Grilled Chicken & Avocado Bowl",
                subtitle: "$8.50 • High Protein • Gluten-Free Option",
                description: "Cilantro lime rice, seasoned black beans, fire-roasted corn, guacamole, and house chipotle crema."
              }
            },
            {
              id: "cmp-spice-select",
              type: "Select",
              props: {
                label: "Custom Spice Level",
                name: "spiceLevel",
                options: ["Mild Salsa Verde", "Medium Smoky Chipotle", "Fiery Habanero Hot Sauce"]
              }
            },
            {
              id: "cmp-time-select",
              type: "Select",
              props: {
                label: "Pickup Time Window",
                name: "pickupWindow",
                options: ["12:15 PM – 12:20 PM", "12:30 PM – 12:35 PM", "12:45 PM – 12:50 PM"]
              }
            },
            {
              id: "cmp-btn-checkout",
              type: "Button",
              props: { label: "Reserve & Place Order ($8.50)", variant: "primary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-order-confirm" }
            },
            {
              id: "cmp-btn-back-vendors",
              type: "Button",
              props: { label: "Back to Vendor List", variant: "secondary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-vendors" }
            }
          ]
        },
        {
          id: "screen-order-confirm",
          name: "Order Status & Pickup Pass",
          purpose: "Live preparation tracking with verified pickup pass",
          layout: "SINGLE_COLUMN",
          sampleData: { orderId: "CB-8492" },
          components: [
            {
              id: "cmp-badge-ready",
              type: "Badge",
              props: { text: "Order #CB-8492 Confirmed", variant: "success" }
            },
            {
              id: "cmp-stat-status",
              type: "StatCard",
              props: {
                label: "Kitchen Preparation Stage",
                value: "In Kitchen (Prep in Progress)",
                hint: "Estimated ready for pickup in 5 minutes"
              }
            },
            {
              id: "cmp-pass-card",
              type: "Card",
              props: {
                title: "Pickup Window: 12:15 PM – 12:20 PM",
                subtitle: "Location: Green Quad Truck #2 (Window B)",
                description: "Please show your student ID or order confirmation code CB-8492 upon arrival."
              }
            },
            {
              id: "cmp-btn-reset",
              type: "Button",
              props: { label: "Place Another Pre-Order", variant: "secondary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-vendors" }
            }
          ]
        }
      ],
      navigation: [
        { fromScreenId: "screen-vendors", actionId: "cmp-btn-menu", toScreenId: "screen-menu" },
        { fromScreenId: "screen-menu", actionId: "cmp-btn-checkout", toScreenId: "screen-order-confirm" },
        { fromScreenId: "screen-menu", actionId: "cmp-btn-back-vendors", toScreenId: "screen-vendors" },
        { fromScreenId: "screen-order-confirm", actionId: "cmp-btn-reset", toScreenId: "screen-vendors" }
      ]
    }
  },
  hardware: {
    applicable: false
  },
  risks: [
    {
      id: "risk-peak-concurrency",
      title: "Class Transition Surge Congestion",
      severity: "HIGH",
      mitigation: "Cap order slots to 25 orders per 5-minute window per kitchen to avoid cooking bottlenecks."
    },
    {
      id: "risk-no-shows",
      title: "Uncollected Prepared Orders",
      severity: "MEDIUM",
      mitigation: "Require student campus card authorization before meal preparation commences."
    }
  ],
  recommendations: [
    {
      id: "rec-kitchen-printer",
      category: "IMPROVEMENT",
      title: "Kitchen Thermal Printer Integration",
      description: "Add optional integration with network thermal printers for kitchens that prefer physical order tickets."
    },
    {
      id: "rec-loyalty-rewards",
      category: "FUTURE_FEATURE",
      title: "Campus Dining Points Rewards",
      description: "Introduce student loyalty badges and coffee rewards to encourage repeat pre-ordering."
    }
  ]
};

// -------------------------------------------------------------
// 2. HARDWARE FIXTURE: Smart Gas & Air Quality Sentinel
// -------------------------------------------------------------
const hardwareBlueprint = {
  schemaVersion: "2.0",
  projectType: "HARDWARE",
  classification: {
    type: "HARDWARE",
    reason: "Project primarily focuses on physical circuit design, embedded controller selection, sensors/actuators, and wiring connections.",
    confidence: "HIGH"
  },
  overview: {
    projectName: "SentinelAir — Autonomous Hazardous Gas & Smoke Detection Circuit",
    summary: "SentinelAir is a standalone embedded safety appliance designed to detect dangerous concentrations of flammable gas, smoke, and toxic VOCs in workshops, kitchens, and maker laboratories.",
    problemStatement: "Methane and volatile gas leaks in enclosed educational labs and workshops frequently go unnoticed until dangerous explosive concentrations develop, presenting immediate fire and health risks.",
    targetUsers: [
      "Workshop & Laboratory Safety Supervisors",
      "Electronics Hobbyists & Makers",
      "Facilities Maintenance Technicians"
    ],
    goals: [
      "Continuously monitor atmospheric gas concentrations with sub-second sample rates",
      "Sound an instant 85dB acoustic and flashing optical alarm when thresholds are exceeded",
      "Provide clear real-time PPM metrics on a local OLED display without requiring cloud connectivity"
    ],
    scope: [
      "MQ-135 and MQ-2 electrochemical gas sensing",
      "DHT22 temperature and relative humidity compensation",
      "ESP32 analog-to-digital conversion and threshold state machine",
      "SSD1306 local OLED live metric dashboard",
      "Piezo buzzer and high-intensity alert LED actuation",
      "5V DC power regulation and surge protection circuit"
    ],
    outOfScope: [
      "Internet/Cloud web portal or cellular telemetry",
      "Automated solenoid gas shutoff valve plumbing installation",
      "Explosion-proof ATEX zone 0 certified metal casting"
    ]
  },
  features: [
    {
      id: "feature-gas-sensing",
      name: "Electrochemical Gas & Smoke Sampling",
      description: "Continuously reads analog voltage from MQ-135 sensor to quantify parts-per-million concentration of harmful airborne compounds.",
      priority: "HIGH",
      roleIds: ["role-safety-officer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-env-compensation",
      name: "Temperature & Humidity Compensation",
      description: "Measures ambient temperature and relative humidity using DHT22 to mathematically calibrate gas sensor resistance drift.",
      priority: "HIGH",
      roleIds: ["role-safety-officer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-alarm-actuation",
      name: "Multi-Modal Acoustic & Optical Alarm",
      description: "Drives an active piezo buzzer and pulsing red LED when gas concentration crosses the critical threshold (400 PPM).",
      priority: "HIGH",
      roleIds: ["role-safety-officer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    },
    {
      id: "feature-local-display",
      name: "Local OLED Status Display",
      description: "Renders live PPM value, ambient temperature, humidity, and safety status badge on a 0.96 inch monochrome display.",
      priority: "MEDIUM",
      roleIds: ["role-safety-officer"],
      needsApi: false,
      needsUi: false,
      needsPersistence: false
    }
  ],
  roles: [
    {
      id: "role-safety-officer",
      name: "Laboratory Safety Officer",
      description: "Monitors laboratory environment and verifies sentinel alarm test button periodically.",
      permissions: ["inspect_readout", "trigger_test_alarm", "calibrate_baseline"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-sampling-frequency",
      type: "FUNCTIONAL",
      description: "The microcontroller shall sample sensor ADC pins at a minimum rate of 2 Hz (every 500 ms).",
      featureIds: ["feature-gas-sensing"],
      acceptanceCriteria: [
        "ADC samples are averaged over a 4-sample moving window to filter electrical noise",
        "Threshold breach triggers alarm state within 1 second of gas exposure"
      ],
      source: "USER_STATED"
    },
    {
      id: "req-alarm-output",
      type: "FUNCTIONAL",
      description: "The system shall trigger a continuous 85 dB audible buzzer tone and 4 Hz flashing red LED whenever gas levels exceed 400 PPM.",
      featureIds: ["feature-alarm-actuation"],
      acceptanceCriteria: [
        "Alarm activates within 500ms of threshold breach",
        "Buzzer sounds continuously until gas levels drop below 350 PPM hysteresis point"
      ],
      source: "USER_STATED"
    },
    {
      id: "req-power-supply",
      type: "NON_FUNCTIONAL",
      description: "The circuit shall operate reliably from a standard regulated 5V DC 2A power adapter.",
      featureIds: ["feature-gas-sensing", "feature-alarm-actuation"],
      acceptanceCriteria: [
        "Sensor heater receives steady 5.0V +/- 0.2V DC",
        "ESP32 operates at 3.3V without brownout resets"
      ],
      source: "AI_ASSUMED"
    }
  ],
  estimates: {
    difficulty: "EASY",
    estimatedDuration: "3–5 weeks",
    recommendedTeamSize: 2,
    teamRoles: [
      { role: "Hardware Electronics Engineer", count: 1, responsibility: "Schematic design, breadboard circuit assembly, component sourcing, and enclosure modeling" },
      { role: "Embedded Firmware Engineer", count: 1, responsibility: "ESP32 C++/Arduino firmware, ADC filtering algorithms, and I2C display drivers" }
    ],
    estimatedCost: {
      currency: "USD",
      minimum: 45,
      maximum: 120,
      basis: "Prototyping components, breadboard, custom 3D printed enclosure, and 5V power adapter.",
      disclaimer: "Approximate estimate based on the supplied requirements."
    },
    resources: [
      { name: "Electronics Prototyping Bench", type: "HARDWARE", purpose: "Soldering, breadboarding, and digital multimeter testing" },
      { name: "3D Printer (PETG Filament)", type: "HARDWARE", purpose: "Fabricating ventilated enclosure chassis" }
    ]
  },
  software: {
    applicable: false
  },
  hardware: {
    applicable: true,
    workingPrinciple: "The MQ-135 electrochemical gas sensor contains a tin dioxide (SnO2) sensing layer that decreases in electrical resistance in the presence of combustible gases and smoke. The resulting analog voltage divider signal is read by the ESP32 ADC. Temperature and humidity values from the DHT22 are incorporated to calibrate baseline air resistance. When calculated PPM exceeds the safety threshold, the ESP32 asserts GPIO pins to activate an acoustic piezo siren and flashing alert LED while refreshing the local I2C OLED display.",
    architecture: {
      summary: "Star-topology sensor and actuator bus centered on an ESP32 microcontroller with a regulated 5V DC rail.",
      blockDiagramMermaid: "graph LR\n    PWR[5V 2A Power Adapter] --> VIN[ESP32 5V Vin & MQ-135 Heater]\n    ESP[ESP32 DevKit V1] --> OLED[SSD1306 OLED Display I2C]\n    MQ[MQ-135 Gas Sensor] -->|Analog Voltage A0| ESP\n    DHT[DHT22 Sensor] -->|1-Wire Digital GPIO4| ESP\n    ESP -->|GPIO18 Digital High| BUZZ[Active Piezo Buzzer 5V]\n    ESP -->|GPIO19 4Hz Pulse| LED[Red Warning LED]"
    },
    components: [
      {
        id: "comp-esp32",
        name: "ESP32 DevKit V1 (30-Pin)",
        category: "MICROCONTROLLER",
        purpose: "Central embedded controller for ADC sampling, sensor calibration, and alert dispatch",
        quantity: 1,
        specification: "Xtensa Dual-Core 32-bit LX6 MCU, 240MHz, 3.3V logic, 5V Vin tolerant",
        alternatives: ["Arduino Nano 33 IoT", "Raspberry Pi Pico"],
        estimatedUnitCost: 6.50,
        estimatedTotalCost: 6.50
      },
      {
        id: "comp-mq135",
        name: "MQ-135 Hazardous Gas & Air Quality Sensor",
        category: "SENSOR",
        purpose: "Detects toxic gases, NH3, alcohol, smoke, and combustible VOCs",
        quantity: 1,
        specification: "5V operating voltage, internal 33-ohm heater, 10–1000 PPM sensitivity range",
        alternatives: ["MQ-2", "BME680"],
        estimatedUnitCost: 4.20,
        estimatedTotalCost: 4.20
      },
      {
        id: "comp-dht22",
        name: "DHT22 Digital Temperature & Humidity Sensor",
        category: "SENSOR",
        purpose: "Compensates for humidity and temperature drift in electrochemical sensor readings",
        quantity: 1,
        specification: "3.3V–5V DC, -40 to 80°C range (+/-0.5°C), 0-100% RH range (+/-2% RH)",
        alternatives: ["DHT11", "SHT31"],
        estimatedUnitCost: 3.80,
        estimatedTotalCost: 3.80
      },
      {
        id: "comp-oled",
        name: "SSD1306 0.96-inch Monochrome I2C OLED Display",
        category: "DISPLAY",
        purpose: "Displays real-time gas PPM, temperature, and system safety status",
        quantity: 1,
        specification: "128x64 pixels, I2C address 0x3C, 3.3V–5V compatible",
        alternatives: ["16x2 LCD with I2C backpack"],
        estimatedUnitCost: 3.50,
        estimatedTotalCost: 3.50
      },
      {
        id: "comp-buzzer",
        name: "Active Piezo Siren Buzzer 5V",
        category: "ACTUATOR",
        purpose: "Emits 85 dB audible warning tone when gas threshold is breached",
        quantity: 1,
        specification: "5V DC active continuous buzzer, 30mA current consumption",
        alternatives: ["Passive buzzer with PWM melody"],
        estimatedUnitCost: 0.80,
        estimatedTotalCost: 0.80
      },
      {
        id: "comp-led",
        name: "High-Intensity Red Alert LED (5mm)",
        category: "ACTUATOR",
        purpose: "Flashing optical emergency beacon paired with 220-ohm current limiting resistor",
        quantity: 1,
        specification: "5mm diffused red, 2.0V forward voltage, 20mA forward current",
        alternatives: ["RGB LED Module"],
        estimatedUnitCost: 0.20,
        estimatedTotalCost: 0.20
      },
      {
        id: "comp-power",
        name: "5V 2A DC Wall Power Adapter & Barrel Jack",
        category: "POWER",
        purpose: "Provides steady 5V power to sensor heating elements and microcontroller",
        quantity: 1,
        specification: "100-240V AC to 5V 2A DC, 5.5mm x 2.1mm center-positive plug",
        alternatives: ["Micro-USB 5V 2A power brick"],
        estimatedUnitCost: 5.00,
        estimatedTotalCost: 5.00
      }
    ],
    controllers: ["ESP32 DevKit V1 (30-Pin)"],
    sensors: ["MQ-135 Hazardous Gas & Air Quality Sensor", "DHT22 Digital Temperature & Humidity Sensor"],
    actuators: ["Active Piezo Siren Buzzer 5V", "High-Intensity Red Alert LED (5mm)"],
    communicationModules: ["ESP32 Onboard Hardware I2C (SDA/SCL)"],
    powerRequirements: {
      operatingVoltage: "5.0V DC regulated main bus; 3.3V DC internal MCU bus",
      powerSource: "5V 2A DC external wall adapter via barrel jack",
      estimatedCurrentDraw: "Nominal 180mA during heater warmup; Peak 320mA during alarm buzzer activation"
    },
    pinConnections: [
      "ESP32 Vin Pin <-> 5V DC Power Rail",
      "ESP32 GND Pin <-> Common System Ground",
      "ESP32 GPIO34 (ADC1_CH6) <-> MQ-135 Analog A0 Pin",
      "ESP32 GPIO4 <-> DHT22 Data Pin",
      "ESP32 GPIO21 (SDA) <-> SSD1306 OLED SDA Pin",
      "ESP32 GPIO22 (SCL) <-> SSD1306 OLED SCL Pin",
      "ESP32 GPIO18 <-> Piezo Buzzer Positive Pin",
      "ESP32 GPIO19 <-> Red LED Anode (via 220-ohm resistor)"
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
        purpose: "Supplies 5V to ESP32 onboard regulator",
        notes: "Connect to Vin terminal"
      },
      {
        id: "conn-gnd-esp",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-esp32",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "System ground reference",
        notes: "Shared ground plane"
      },
      {
        id: "conn-pwr-mq135",
        fromComponentId: "comp-power",
        fromPin: "5V_OUT",
        toComponentId: "comp-mq135",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Power sensor internal heating coil",
        notes: "Requires dedicated 5V rail connection"
      },
      {
        id: "conn-gnd-mq135",
        fromComponentId: "comp-power",
        fromPin: "GND",
        toComponentId: "comp-mq135",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Sensor ground return",
        notes: "Common ground"
      },
      {
        id: "conn-sig-mq135",
        fromComponentId: "comp-mq135",
        fromPin: "A0",
        toComponentId: "comp-esp32",
        toPin: "GPIO34",
        signalType: "ANALOG",
        voltage: "0-3.3V",
        purpose: "Gas concentration analog voltage output",
        notes: "Read by ESP32 ADC1 (input-only pin)"
      },
      {
        id: "conn-pwr-dht22",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-dht22",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power DHT22 electronics",
        notes: "3.3V regulated output from ESP32"
      },
      {
        id: "conn-gnd-dht22",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-dht22",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "DHT22 ground",
        notes: "Common ground"
      },
      {
        id: "conn-sig-dht22",
        fromComponentId: "comp-dht22",
        fromPin: "DATA",
        toComponentId: "comp-esp32",
        toPin: "GPIO4",
        signalType: "DIGITAL_1WIRE",
        voltage: "3.3V",
        purpose: "Bidirectional single-wire temperature and humidity stream",
        notes: "Requires 10k pullup resistor to 3.3V"
      },
      {
        id: "conn-pwr-oled",
        fromComponentId: "comp-esp32",
        fromPin: "3V3",
        toComponentId: "comp-oled",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power OLED display logic and panel",
        notes: "Draws approx 20mA"
      },
      {
        id: "conn-gnd-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-oled",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "OLED ground",
        notes: "Common ground"
      },
      {
        id: "conn-sda-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO21",
        toComponentId: "comp-oled",
        toPin: "SDA",
        signalType: "I2C_DATA",
        voltage: "3.3V",
        purpose: "I2C Serial Data line",
        notes: "Standard ESP32 default SDA pin"
      },
      {
        id: "conn-scl-oled",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO22",
        toComponentId: "comp-oled",
        toPin: "SCL",
        signalType: "I2C_CLOCK",
        voltage: "3.3V",
        purpose: "I2C Serial Clock line",
        notes: "Standard ESP32 default SCL pin"
      },
      {
        id: "conn-sig-buzz",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO18",
        toComponentId: "comp-buzzer",
        toPin: "POSITIVE",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "Drives buzzer on alarm trigger",
        notes: "Active buzzer emits tone when pin is HIGH"
      },
      {
        id: "conn-gnd-buzz",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-buzzer",
        toPin: "NEGATIVE",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Buzzer ground return",
        notes: "Common ground"
      },
      {
        id: "conn-sig-led",
        fromComponentId: "comp-esp32",
        fromPin: "GPIO19",
        toComponentId: "comp-led",
        toPin: "ANODE",
        signalType: "DIGITAL_OUT",
        voltage: "3.3V",
        purpose: "Drives visual flashing beacon",
        notes: "220-ohm current-limiting resistor placed in series"
      },
      {
        id: "conn-gnd-led",
        fromComponentId: "comp-esp32",
        fromPin: "GND",
        toComponentId: "comp-led",
        toPin: "CATHODE",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "LED cathode ground return",
        notes: "Common ground"
      }
    ],
    firmwareLogic: {
      mainLoopDescription: "Reads analog sensor voltage and environmental metrics every 500 ms. Computes parts-per-million concentration with calibration curves. Updates OLED buffer. If gas concentration exceeds 400 PPM threshold, enters ALARM state toggling buzzer and LED at 4Hz until level falls below 350 PPM.",
      setupSteps: [
        "Initialize serial port at 115200 baud for diagnostics",
        "Set GPIO18 (buzzer) and GPIO19 (LED) to OUTPUT mode",
        "Initialize Wire library for I2C and verify SSD1306 display at 0x3C",
        "Start DHT22 temperature and humidity communication",
        "Execute 30-second sensor heater warmup countdown on display"
      ],
      safetyNotes: [
        "Preheat MQ-135 sensor for at least 24 hours prior to final accuracy calibration",
        "Do not touch heated sensor mesh with bare fingers during operation",
        "Ensure device is placed away from direct drafts to maintain accurate ambient readings"
      ]
    },
    diagrams: {
      systemBlockMermaid: "graph TD\n    PWR[5V 2A DC Power Supply] --> ESP[ESP32 Microcontroller]\n    PWR --> MQ[MQ-135 Gas Sensor]\n    MQ -->|Analog A0| ESP\n    DHT[DHT22 Temp & Humidity] -->|Digital GPIO4| ESP\n    ESP -->|I2C SDA/SCL| OLED[SSD1306 OLED Display]\n    ESP -->|GPIO18 Digital| BUZZ[Active Piezo Buzzer]\n    ESP -->|GPIO19 Digital| LED[Red Warning LED]"
    },
    enclosure: {
      type: "Ventilated Wall-Mount Enclosure",
      material: "Flame-Retardant ABS or 3D Printed PETG",
      dimensions: "120mm x 80mm x 45mm",
      protectionRating: "IP40 with louvered gas intake vents"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "WALL_MOUNT",
        dimensions: [120, 45, 80],
        color: "#334155",
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
          label: "ESP32 DevKit V1"
        },
        {
          componentId: "comp-mq135",
          primitiveType: "SENSOR_MODULE",
          dimensions: [20, 16, 20],
          position: [-35, 12, 15],
          rotation: [0, 0, 0],
          color: "#b45309",
          label: "MQ-135 Gas Sensor"
        },
        {
          componentId: "comp-dht22",
          primitiveType: "SENSOR_MODULE",
          dimensions: [15, 20, 10],
          position: [35, 10, 15],
          rotation: [0, 0, 0],
          color: "#f8fafc",
          label: "DHT22 Temp & Humidity"
        },
        {
          componentId: "comp-oled",
          primitiveType: "DISPLAY_PANEL",
          dimensions: [28, 4, 28],
          position: [0, 22, -10],
          rotation: [0, 0, 0],
          color: "#0f172a",
          label: "SSD1306 OLED Display"
        },
        {
          componentId: "comp-buzzer",
          primitiveType: "BUZZER",
          dimensions: [12, 10, 12],
          position: [35, 8, -20],
          rotation: [0, 0, 0],
          color: "#1e293b",
          label: "Active Buzzer 5V"
        },
        {
          componentId: "comp-led",
          primitiveType: "LED",
          dimensions: [6, 10, 6],
          position: [-35, 10, -20],
          rotation: [0, 0, 0],
          color: "#ef4444",
          label: "Red Warning LED"
        },
        {
          componentId: "comp-power",
          primitiveType: "CONNECTOR",
          dimensions: [12, 10, 15],
          position: [0, 6, -35],
          rotation: [0, 0, 0],
          color: "#475569",
          label: "DC 5V Barrel Jack"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-circuit-prototype",
      title: "Phase 1: Breadboard Circuit & Sensor Validation",
      description: "Assemble core sensing circuit on breadboard and verify ADC voltage curves.",
      featureIds: ["feature-gas-sensing", "feature-env-compensation"],
      tasks: [
        "Wire ESP32, MQ-135, and DHT22 on solderless breadboard",
        "Calibrate clean-air baseline resistance (R0) over 24-hour burn in",
        "Verify I2C bus communication with SSD1306 OLED display"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Gas concentration and ambient temperature read reliably on serial monitor"]
    },
    {
      id: "phase-alarm-firmware",
      title: "Phase 2: Alert State Machine & Hysteresis",
      description: "Implement non-blocking buzzer/LED alert routines and hysteresis thresholds.",
      featureIds: ["feature-alarm-actuation", "feature-local-display"],
      tasks: [
        "Write threshold comparator with 50 PPM hysteresis band",
        "Implement timer-driven 4Hz flashing LED and acoustic siren logic",
        "Design OLED visual layout showing PPM gauge and status banner"
      ],
      dependsOnPhaseIds: ["phase-circuit-prototype"],
      completionCriteria: ["Simulated gas test reliably activates buzzer and OLED alarm state"]
    },
    {
      id: "phase-pcb-enclosure",
      title: "Phase 3: Custom PCB & 3D Printed Chassis",
      description: "Design compact 2-layer PCB and fabricate ventilated enclosure.",
      featureIds: ["feature-gas-sensing", "feature-alarm-actuation"],
      tasks: [
        "Layout schematic and PCB traces in KiCad",
        "Fabricate PCB prototype with through-hole headers",
        "3D print wall-mount chassis with ventilation louvers"
      ],
      dependsOnPhaseIds: ["phase-alarm-firmware"],
      completionCriteria: ["Complete physical device assembled and wall-mounted for burn-in testing"]
    }
  ],
  assumptions: [
    {
      id: "asm-mains-power",
      description: "Continuous mains AC power is available to power the 5V DC adapter at installation location.",
      affectedEntityIds: ["comp-power"],
      reason: "MQ-series electrochemical heaters consume 150-180mA continuously, making long-term battery operation impractical."
    }
  ],
  openQuestions: [
    {
      id: "q-calibrated-gas-source",
      question: "Will calibrated test gas cylinders (e.g. 500 PPM methane reference) be available for precision span calibration?",
      affectedEntityIds: ["comp-mq135", "feature-gas-sensing"],
      whyItMatters: "Determines whether calibration relies on factory curve approximations or precise multi-point physical reference calibration."
    }
  ],
  risks: [
    {
      id: "risk-heater-burnin",
      title: "Sensor Drift During Initial Heating",
      severity: "MEDIUM",
      mitigation: "Include software lockout requiring 24 hours of burn-in heating before saving baseline calibration."
    },
    {
      id: "risk-silicone-poisoning",
      title: "Sensor Poisoning from Aerosols",
      severity: "HIGH",
      mitigation: "Clearly label enclosure warnings against using silicone adhesives, hairspray, or VOC cleaners near unit."
    }
  ],
  recommendations: [
    {
      id: "rec-backup-battery",
      category: "FUTURE_FEATURE",
      title: "LiPo Battery Backup with Charger IC",
      description: "Consider adding a single-cell LiPo battery and TP4056 charging IC for 2-hour backup during power outages."
    }
  ]
};

// -------------------------------------------------------------
// 3. HYBRID FIXTURE: Connected Cold-Chain Asset Monitor
// -------------------------------------------------------------
const hybridBlueprint = {
  schemaVersion: "2.0",
  projectType: "HYBRID",
  classification: {
    type: "HYBRID",
    reason: "Project combines physical hardware telemetry tracking (temperature/GPS/vibration MCU) with a web/mobile cloud monitoring dashboard.",
    confidence: "HIGH"
  },
  overview: {
    projectName: "PulseIoT — Connected Industrial Cold-Chain Fleet & Asset Monitor",
    summary: "PulseIoT is an end-to-end IoT tracking platform consisting of an embedded GPS/temperature sensor telematics unit deployed on refrigerated transport vehicles, transmitting real-time telemetry over cellular MQTT to a cloud dashboard.",
    problemStatement: "Pharmaceutical and perishable food shipments frequently suffer temperature excursions during transit, leading to spoiled inventory and regulatory non-compliance because deviations are discovered only at delivery.",
    targetUsers: [
      "Fleet Operations Managers",
      "Cold-Chain Logistics Technicians",
      "Quality Assurance & Compliance Auditors"
    ],
    goals: [
      "Track refrigerated cargo temperature and geolocation in real time with 30-second reporting intervals",
      "Instantly notify dispatchers via SMS and web alerts when temperatures breach safe bounds (+2°C to +8°C)",
      "Provide complete automated audit trails for regulatory compliance (FDA 21 CFR Part 11)"
    ],
    scope: [
      "ESP32-S3 microcontroller with external DS18B20 digital temperature probe and NEO-6M GPS receiver",
      "SIM7600 4G LTE cellular module transmitting structured JSON telemetry over MQTT",
      "Spring Boot backend MQTT ingestion service with MongoDB timeseries persistence",
      "React web dashboard displaying live interactive map, telemetry graphs, and fleet health",
      "Automated temperature breach alert notifications via WebSockets and SMS"
    ],
    outOfScope: [
      "Direct integration with proprietary vehicle CAN bus engine computers",
      "Active refrigeration compressor speed control"
    ]
  },
  features: [
    {
      id: "feature-telemetry-sampling",
      name: "High-Precision Temperature & GPS Telematics",
      description: "Hardware unit samples calibrated cargo temperature and satellite coordinates every 10 seconds.",
      priority: "HIGH",
      roleIds: ["role-fleet-manager"],
      needsApi: true,
      needsUi: true,
      needsPersistence: true
    },
    {
      id: "feature-cellular-transmission",
      name: "Cellular MQTT Telemetry Stream",
      description: "Encodes sensor payload into compact JSON and publishes over encrypted TLS MQTT to cloud broker.",
      priority: "HIGH",
      roleIds: ["role-fleet-manager"],
      needsApi: true,
      needsUi: false,
      needsPersistence: true
    },
    {
      id: "feature-live-dashboard",
      name: "Real-Time Fleet Map & Telemetry Canvas",
      description: "Dispatchers monitor vehicle locations, live cargo temperature curves, and connectivity status on an interactive map.",
      priority: "HIGH",
      roleIds: ["role-fleet-manager"],
      needsApi: true,
      needsUi: true,
      needsPersistence: false
    },
    {
      id: "feature-breach-alerts",
      name: "Immediate Excursion Alerts & Audit Log",
      description: "Triggers instant notifications when temperature strays outside the certified cold-chain window (+2°C to +8°C).",
      priority: "HIGH",
      roleIds: ["role-fleet-manager", "role-qa-auditor"],
      needsApi: true,
      needsUi: true,
      needsPersistence: true
    }
  ],
  roles: [
    {
      id: "role-fleet-manager",
      name: "Fleet Operations Manager",
      description: "Oversees vehicle fleet, monitors live temperature telemetry, and handles transit alerts.",
      permissions: ["view_fleet_map", "view_live_telemetry", "acknowledge_alerts", "export_transit_reports"],
      interactive: true
    },
    {
      id: "role-qa-auditor",
      name: "Quality Compliance Auditor",
      description: "Audits historic shipment temperature logs for cold-chain certification compliance.",
      permissions: ["view_audit_logs", "verify_calibration_certificates", "export_compliance_pdf"],
      interactive: true
    }
  ],
  requirements: [
    {
      id: "req-temp-accuracy",
      type: "FUNCTIONAL",
      description: "Temperature measurements shall maintain +/-0.5°C accuracy across the -20°C to +30°C temperature range.",
      featureIds: ["feature-telemetry-sampling"],
      acceptanceCriteria: [
        "DS18B20 12-bit resolution provides 0.0625°C increments",
        "Sensors pass 3-point ice/water bath calibration verification"
      ],
      source: "USER_STATED"
    },
    {
      id: "req-mqtt-ingestion",
      type: "FUNCTIONAL",
      description: "The backend shall ingest telemetry messages from up to 1,000 active vehicle units concurrently without dropping packets.",
      featureIds: ["feature-cellular-transmission", "feature-live-dashboard"],
      acceptanceCriteria: [
        "Inbound telemetry is written to database within 150ms of MQTT receipt",
        "WebSocket broadcast delivers updates to web dashboard within 500ms"
      ],
      source: "USER_STATED"
    }
  ],
  estimates: {
    difficulty: "HARD",
    estimatedDuration: "10–14 weeks",
    recommendedTeamSize: 5,
    teamRoles: [
      { role: "Embedded IoT Hardware Engineer", count: 1, responsibility: "Custom PCB, power management, GPS/Cellular RF layout, and rugged enclosure" },
      { role: "Embedded Firmware Engineer", count: 1, responsibility: "C++ firmware for ESP32-S3, cellular AT command driver, and MQTT protocol buffer serialization" },
      { role: "Backend Cloud Engineer", count: 1, responsibility: "MQTT broker infrastructure, Spring Boot ingest service, and MongoDB timeseries persistence" },
      { role: "Frontend Web Engineer", count: 1, responsibility: "React live map dashboard, WebSocket streaming integration, and alert components" },
      { role: "QA Engineer", count: 1, responsibility: "End-to-end integration testing, intermittent cellular connectivity resilience, and field trials" }
    ],
    estimatedCost: {
      currency: "USD",
      minimum: 28000,
      maximum: 55000,
      basis: "5 engineers over 10-14 weeks, 10 prototype hardware devices with cellular SIM contracts, and cloud infrastructure.",
      disclaimer: "Approximate estimate based on the supplied requirements."
    },
    resources: [
      { name: "IoT Cellular SIM Data Pool", type: "SERVICE", purpose: "Global LTE-M M2M cellular data connectivity for field hardware" },
      { name: "Cloud MQTT Broker (EMQX / AWS IoT)", type: "INFRASTRUCTURE", purpose: "Scalable pub/sub message broker" },
      { name: "Timeseries MongoDB Cluster", type: "INFRASTRUCTURE", purpose: "High-throughput sensor telemetry storage" }
    ]
  },
  software: {
    applicable: true,
    architecture: {
      pattern: "Event-Driven IoT Ingestion & Reactive Web Client",
      description: "Cellular hardware publishes telemetry to an MQTT broker. Spring Boot backend ingests events, validates thresholds, stores to MongoDB, and pushes to React dashboard via WebSockets."
    },
    recommendedTechStack: {
      frontend: {
        technology: "React 19 + Leaflet / MapLibre",
        reason: "Interactive high-fps map rendering for real-time fleet geolocations",
        alternatives: ["Google Maps JS API"],
        tradeOffs: "Open-source map stack eliminates expensive per-tile Google API fees"
      },
      backend: {
        technology: "Spring Boot 3 (Java 21) + Spring Integration MQTT",
        reason: "Robust high-concurrency event-driven pipeline with managed thread pools",
        alternatives: ["Go (Gorilla / Paho)"],
        tradeOffs: "Slightly higher memory than Go, but excellent enterprise ecosystem for data pipelines"
      },
      database: {
        technology: "MongoDB Time Series Collections",
        reason: "Native time-bucketed compression for high-frequency GPS and temperature samples",
        alternatives: ["TimescaleDB", "InfluxDB"],
        tradeOffs: "Requires MongoDB 5.0+ time series engine"
      },
      deployment: {
        technology: "Kubernetes / AWS ECS + EMQX Cloud",
        reason: "Handles variable fleet connection spikes and ensures 99.9% ingestion uptime",
        alternatives: ["Docker Swarm on Bare Metal"],
        tradeOffs: "Higher operational complexity than single VPS"
      },
      testing: {
        technology: "JUnit 5 + Testcontainers (MQTT & Mongo) + Playwright",
        reason: "Simulate end-to-end telemetry delivery with real containerized brokers in test suite",
        alternatives: ["Mock MQTT libraries"],
        tradeOffs: "Testcontainers requires Docker daemon in CI"
      },
      optionalServices: [
        {
          technology: "Twilio SMS",
          reason: "Emergency SMS alerts to dispatchers when temperatures breach critical +8°C threshold",
          alternatives: ["AWS SNS"],
          tradeOffs: "Incurs per-SMS carrier message costs"
        }
      ]
    },
    modules: [
      { id: "mod-telemetry-ingest", name: "MQTT Telemetry Ingest", description: "Consumes vehicle sensor packets and parses payload", responsibilities: "Validate schema, extract temperature/GPS, detect threshold violations" },
      { id: "mod-fleet-ui", name: "Fleet Monitoring Dashboard", description: "Live map rendering, temperature graph, and fleet table", responsibilities: "Display vehicle pins, color-code status, stream updates" }
    ],
    database: {
      collections: [
        {
          id: "collection-vehicles",
          name: "vehicles",
          description: "Registered transport trucks, assigned cargo types, and hardware device pairing IDs.",
          featureIds: ["feature-live-dashboard"],
          fields: [
            { name: "_id", dataType: "ObjectId", required: true, unique: true, description: "Vehicle record ID" },
            { name: "vin", dataType: "String", required: true, unique: true, description: "Vehicle Identification Number" },
            { name: "deviceId", dataType: "String", required: true, unique: true, description: "Hardware telematics serial number" },
            { name: "plateNumber", dataType: "String", required: true, unique: false, description: "License plate" },
            { name: "targetTempMin", dataType: "Double", required: true, unique: false, description: "e.g. 2.0 degrees C" },
            { name: "targetTempMax", dataType: "Double", required: true, unique: false, description: "e.g. 8.0 degrees C" }
          ],
          indexes: ["deviceId_1", "vin_1"]
        },
        {
          id: "collection-telemetry",
          name: "telemetry",
          description: "High-frequency timeseries sensor readings from vehicles.",
          featureIds: ["feature-telemetry-sampling", "feature-live-dashboard"],
          fields: [
            { name: "timestamp", dataType: "Date", required: true, unique: false, description: "Sample time (UTC)" },
            { name: "deviceId", dataType: "String", required: true, unique: false, description: "Hardware device ID" },
            { name: "temperature", dataType: "Double", required: true, unique: false, description: "Cargo temperature in C" },
            { name: "latitude", dataType: "Double", required: true, unique: false, description: "GPS latitude" },
            { name: "longitude", dataType: "Double", required: true, unique: false, description: "GPS longitude" },
            { name: "batteryVoltage", dataType: "Double", required: true, unique: false, description: "Device battery level" }
          ],
          indexes: ["deviceId_1_timestamp_-1"]
        }
      ],
      relationships: [
        {
          id: "rel-telemetry-vehicle",
          sourceCollectionId: "collection-telemetry",
          targetCollectionId: "collection-vehicles",
          sourceField: "deviceId",
          targetField: "deviceId",
          cardinality: "ONE_TO_MANY",
          description: "Each telemetry point belongs to one registered vehicle hardware device."
        }
      ]
    },
    apis: [
      {
        id: "api-get-fleet",
        method: "GET",
        path: "/fleet/vehicles",
        purpose: "Fetch list of active vehicles with latest temperature and location coordinates.",
        featureIds: ["feature-live-dashboard"],
        roleIds: ["role-fleet-manager"],
        authRequired: true,
        requestExample: null,
        responseExample: [
          { "deviceId": "PULSE-001", "plateNumber": "K-8821", "temperature": 4.2, "status": "OPTIMAL", "lat": 42.36, "lng": -71.05 }
        ],
        successStatus: 200,
        errorCases: [
          { "status": 500, "code": "DB_ERROR", "description": "Database query failure" }
        ]
      },
      {
        id: "api-get-telemetry-history",
        method: "GET",
        path: "/fleet/vehicles/{deviceId}/telemetry",
        purpose: "Retrieve historical temperature curve and GPS path for a vehicle over a time range.",
        featureIds: ["feature-live-dashboard", "feature-breach-alerts"],
        roleIds: ["role-fleet-manager", "role-qa-auditor"],
        authRequired: true,
        requestExample: null,
        responseExample: [
          { "timestamp": "2026-09-25T12:00:00Z", "temperature": 4.1, "lat": 42.3601, "lng": -71.0589 }
        ],
        successStatus: 200,
        errorCases: [
          { "status": 404, "code": "VEHICLE_NOT_FOUND", "description": "Vehicle not recognized" }
        ]
      }
    ],
    screens: [
      {
        id: "screen-fleet-map",
        name: "Live Fleet Telematics Map",
        route: "/fleet",
        purpose: "Interactive overview of all refrigerated vehicles with color-coded temperature badges.",
        roleIds: ["role-fleet-manager"],
        featureIds: ["feature-live-dashboard"],
        components: ["FleetMapCanvas", "VehicleSidebarList", "ExcursionAlertBanner", "StatusFilterPill"],
        states: ["loading", "connected-live", "stream-error"],
        actions: [
          { "id": "act-select-vehicle", "label": "Inspect Vehicle Details", "kind": "NAVIGATION", "targetScreenId": "screen-vehicle-detail" }
        ]
      },
      {
        id: "screen-vehicle-detail",
        name: "Vehicle Cargo Telemetry & Trace",
        route: "/fleet/{deviceId}",
        purpose: "Detailed 24-hour temperature curve, route timeline, and compliance verification.",
        roleIds: ["role-fleet-manager", "role-qa-auditor"],
        featureIds: ["feature-live-dashboard", "feature-breach-alerts"],
        components: ["TemperatureGraph", "GpsRouteBreadcrumbs", "SensorHealthCard", "ComplianceExportButton"],
        states: ["loading", "active", "temperature-breach-warning"],
        actions: [
          { "id": "act-back-map", "label": "Return to Fleet Map", "kind": "NAVIGATION", "targetScreenId": "screen-fleet-map" }
        ]
      }
    ],
    userFlows: [
      {
        id: "flow-monitor-fleet",
        name: "Dispatcher Temperature Monitoring & Excursion Response",
        description: "Dispatcher observes live map, receives temperature excursion alert, and dispatches driver intervention.",
        steps: [
          "Open live fleet telematics dashboard",
          "Observe vehicle markers on map (Green: 2-8°C, Red: Excursion)",
          "Receive real-time push alert if truck refrigerated unit fails",
          "Inspect temperature curve history to assess cargo exposure duration",
          "Contact truck driver to check auxiliary cooling unit"
        ]
      }
    ],
    integrations: [
      {
        source: "Hardware Tracking Device",
        destination: "Cloud MQTT Broker",
        protocol: "MQTT over TLS (MQTTS)",
        data: "JSON payload with deviceId, timestamp, temp, lat, lng, battery",
        purpose: "Cellular low-overhead telemetry ingestion every 30 seconds"
      },
      {
        source: "Spring Boot Ingest Service",
        destination: "Web Browser Clients",
        protocol: "WebSocket (STOMP / WSS)",
        data: "Live telemetry delta stream",
        purpose: "Push instant updates to dispatcher map without polling"
      }
    ],
    testingStrategy: {
      unitTesting: "JUnit 5 for temperature breach rules and MQTT JSON payload parsing",
      integrationTesting: "Testcontainers running EMQX MQTT broker and MongoDB timeseries container",
      e2eTesting: "Playwright journey verifying map marker color change when simulated excursion packet arrives"
    },
    deploymentPlan: {
      environment: "Managed Cloud Kubernetes with EMQX MQTT Cluster",
      steps: [
        "Deploy EMQX MQTT cluster with TLS mutual authentication",
        "Deploy Spring Boot microservices with auto-scaling ingestion pods",
        "Configure MongoDB Atlas Timeseries collections",
        "Deploy React web dashboard to CDN"
      ],
      monitoring: "Grafana dashboards tracking MQTT packet ingress rate and queue lag"
    },
    prototype: {
      generated: true,
      platform: "WEB",
      startScreenId: "screen-fleet-overview",
      screens: [
        {
          id: "screen-fleet-overview",
          name: "Fleet Overview & Active Transits",
          purpose: "Real-time summary of all refrigerated trucks with status indicators",
          layout: "SINGLE_COLUMN",
          sampleData: { activeTrucks: 14, optimalCount: 13, alertCount: 1 },
          components: [
            {
              id: "cmp-fleet-heading",
              type: "Heading",
              props: { level: 2, text: "PulseIoT — Cold-Chain Fleet Telemetry" }
            },
            {
              id: "cmp-status-badge",
              type: "Badge",
              props: { text: "13 / 14 Vehicles In Safe Range (+2°C to +8°C)", variant: "success" }
            },
            {
              id: "cmp-truck-list",
              type: "List",
              props: {
                items: [
                  { id: "t1", title: "Truck #104 — Boston to Providence", badge: "4.2°C • Safe", subtitle: "Vaccine Shipment • Last ping: 12s ago" },
                  { id: "t2", title: "Truck #108 — Hartford Express", badge: "8.9°C • EXCURSION ALERT", subtitle: "Biologics Cargo • Last ping: 5s ago" },
                  { id: "t3", title: "Truck #112 — New Haven Transit", badge: "3.8°C • Safe", subtitle: "Chilled Produce • Last ping: 25s ago" }
                ]
              }
            },
            {
              id: "cmp-btn-inspect-alert",
              type: "Button",
              props: { label: "Inspect Alert: Truck #108 (8.9°C Excursion)", variant: "primary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-truck-detail" }
            }
          ]
        },
        {
          id: "screen-truck-detail",
          name: "Truck #108 Excursion Diagnostics",
          purpose: "Detailed temperature curve, GPS location, and driver contact pass",
          layout: "SINGLE_COLUMN",
          sampleData: { truckId: "TRK-108", currentTemp: 8.9, driver: "Marcus Vance" },
          components: [
            {
              id: "cmp-detail-heading",
              type: "Heading",
              props: { level: 2, text: "Truck #108 — Live Diagnostics" }
            },
            {
              id: "cmp-stat-temp",
              type: "StatCard",
              props: {
                label: "Cargo Bay Probe Temperature",
                value: "8.9°C (+0.9°C Above Limit)",
                hint: "Safe limit is +8.0°C. Temperature rising +0.3°C / 10min."
              }
            },
            {
              id: "cmp-location-card",
              type: "Card",
              props: {
                title: "Location: I-91 Southbound (Mile Marker 42)",
                subtitle: "Driver: Marcus Vance • Vehicle: Freightliner Cascadia",
                description: "Hardware Telematics ID: PULSE-HW-0882 • Cellular Signal: 4G LTE (-78 dBm)"
              }
            },
            {
              id: "cmp-btn-acknowledge",
              type: "Button",
              props: { label: "Acknowledge Alert & Dispatch Driver Warning", variant: "primary" },
              action: { type: "SHOW_MESSAGE", message: "Alert acknowledged. Dispatch SMS sent to driver Marcus Vance." }
            },
            {
              id: "cmp-btn-back-fleet",
              type: "Button",
              props: { label: "Back to Fleet Overview", variant: "secondary" },
              action: { type: "NAVIGATE", targetScreenId: "screen-fleet-overview" }
            }
          ]
        }
      ],
      navigation: [
        { fromScreenId: "screen-fleet-overview", actionId: "cmp-btn-inspect-alert", toScreenId: "screen-truck-detail" },
        { fromScreenId: "screen-truck-detail", actionId: "cmp-btn-back-fleet", toScreenId: "screen-fleet-overview" }
      ]
    }
  },
  hardware: {
    applicable: true,
    workingPrinciple: "The tracking device sits inside the refrigerated vehicle cargo hold. The waterproof DS18B20 digital probe measures temperatures every 10 seconds. The NEO-6M GPS receiver acquires satellite coordinates. The ESP32-S3 microcontroller serializes the telemetry readings into compact JSON and instructs the SIM7600 4G LTE cellular module via AT commands to publish the payload over TLS to the cloud MQTT broker.",
    architecture: {
      summary: "Industrial embedded telemetry device with digital 1-Wire temperature probe, UART GPS, and high-speed 4G LTE modem.",
      blockDiagramMermaid: "graph TD\n    PWR[12V-24V Vehicle Battery] --> REG[5V 3A Step-Down Buck Regulator]\n    REG --> ESP[ESP32-S3 Central MCU]\n    REG --> MODEM[SIM7600 4G LTE Modem]\n    PROBE[DS18B20 Waterproof Temp Probe] -->|1-Wire GPIO4| ESP\n    GPS[NEO-6M GPS Receiver] -->|UART RX/TX| ESP\n    ESP -->|UART High-Speed 115200| MODEM\n    MODEM -->|4G Cellular TLS| CLOUD[Cloud MQTT Broker]"
    },
    components: [
      {
        id: "comp-esp32s3",
        name: "ESP32-S3 Microcontroller Module",
        category: "MICROCONTROLLER",
        purpose: "Core telematics processor, protocol serialization, and modem power management",
        quantity: 1,
        specification: "Dual-core Xtensa 32-bit LX7, 8MB Flash, 2MB PSRAM, USB/UART",
        alternatives: ["STM32F401", "Nordic nRF9160"],
        estimatedUnitCost: 7.50,
        estimatedTotalCost: 7.50
      },
      {
        id: "comp-temp-probe",
        name: "DS18B20 Waterproof Stainless Steel Temperature Probe",
        category: "SENSOR",
        purpose: "Measures cargo air temperature with high precision inside refrigerated hold",
        quantity: 1,
        specification: "Stainless steel tube 6mm x 50mm, 1-meter cable, +/-0.5°C accuracy (-10°C to +85°C)",
        alternatives: ["PT100 RTD with MAX31865"],
        estimatedUnitCost: 4.50,
        estimatedTotalCost: 4.50
      },
      {
        id: "comp-gps",
        name: "NEO-6M Satellite GPS Receiver & Patch Antenna",
        category: "COMMUNICATION",
        purpose: "Calculates vehicle geolocation coordinates, speed, and UTC timestamp",
        quantity: 1,
        specification: "50-channel u-blox 6 engine, UART 9600 baud, 2.5m positional accuracy",
        alternatives: ["NEO-8M", "Quectel L76-L"],
        estimatedUnitCost: 6.80,
        estimatedTotalCost: 6.80
      },
      {
        id: "comp-cellular",
        name: "SIM7600E 4G LTE-M / NB-IoT Cellular Module",
        category: "COMMUNICATION",
        purpose: "Transmits MQTT telemetry packets over cellular network to cloud broker",
        quantity: 1,
        specification: "LTE Cat-1, multi-band fallback, UART AT interface, micro-SIM socket",
        alternatives: ["SIM7000G", "Quectel EC25"],
        estimatedUnitCost: 19.50,
        estimatedTotalCost: 19.50
      },
      {
        id: "comp-buck-reg",
        name: "Automotive 12V/24V to 5V 3A Buck Voltage Regulator",
        category: "POWER",
        purpose: "Steps down vehicle electrical system voltage to 5V DC with surge suppression",
        quantity: 1,
        specification: "Input 9V–36V DC, Output 5V 3A continuous, TVS surge protection diode",
        alternatives: ["LM2596 DC-DC step-down module"],
        estimatedUnitCost: 4.20,
        estimatedTotalCost: 4.20
      },
      {
        id: "comp-lipo-backup",
        name: "3.7V 2500mAh LiPo Backup Battery",
        category: "POWER",
        purpose: "Maintains telemetry transmission for up to 8 hours if vehicle ignition is switched off",
        quantity: 1,
        specification: "Lithium Polymer with internal PCM protection circuit, JST-PH 2.0 connector",
        alternatives: ["18650 Li-ion cell"],
        estimatedUnitCost: 8.00,
        estimatedTotalCost: 8.00
      }
    ],
    controllers: ["ESP32-S3 Microcontroller Module"],
    sensors: ["DS18B20 Waterproof Stainless Steel Temperature Probe"],
    actuators: ["Hardware Status Dual-Color LED Indicator"],
    communicationModules: ["NEO-6M Satellite GPS Receiver", "SIM7600E 4G LTE Cellular Module"],
    powerRequirements: {
      operatingVoltage: "Main: 12V–24V vehicle battery; Internal: 5V DC bus and 3.3V DC logic; Backup: 3.7V LiPo",
      powerSource: "Vehicle auxiliary power port or direct wiring with LiPo battery backup",
      estimatedCurrentDraw: "Nominal 120mA during sensor sampling; Peak 1.8A burst during cellular radio packet transmission"
    },
    pinConnections: [
      "Buck Regulator 5V Out <-> ESP32-S3 5V Vin & SIM7600 VCC",
      "Buck Regulator GND <-> Common Vehicle & Circuit Ground",
      "ESP32-S3 GPIO4 <-> DS18B20 1-Wire Data (with 4.7k pullup to 3.3V)",
      "ESP32-S3 GPIO17 (TX) <-> SIM7600 RXD",
      "ESP32-S3 GPIO18 (RX) <-> SIM7600 TXD",
      "ESP32-S3 GPIO43 (U0TXD) <-> NEO-6M RXD",
      "ESP32-S3 GPIO44 (U0RXD) <-> NEO-6M TXD"
    ],
    connections: [
      {
        id: "conn-pwr-buck",
        fromComponentId: "comp-buck-reg",
        fromPin: "5V_OUT",
        toComponentId: "comp-esp32s3",
        toPin: "VIN",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "Main power supply for ESP32 processor",
        notes: "Regulated 5V output"
      },
      {
        id: "conn-gnd-main",
        fromComponentId: "comp-buck-reg",
        fromPin: "GND",
        toComponentId: "comp-esp32s3",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "System ground reference",
        notes: "Common ground"
      },
      {
        id: "conn-pwr-cellular",
        fromComponentId: "comp-buck-reg",
        fromPin: "5V_OUT",
        toComponentId: "comp-cellular",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "5.0V",
        purpose: "High-current power supply for cellular transmission bursts",
        notes: "Requires minimum 2A capability"
      },
      {
        id: "conn-gnd-cellular",
        fromComponentId: "comp-buck-reg",
        fromPin: "GND",
        toComponentId: "comp-cellular",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "Cellular module ground",
        notes: "Common ground"
      },
      {
        id: "conn-uart-cell-tx",
        fromComponentId: "comp-esp32s3",
        fromPin: "GPIO17",
        toComponentId: "comp-cellular",
        toPin: "RXD",
        signalType: "UART_TX",
        voltage: "3.3V",
        purpose: "Send AT commands and MQTT payload to modem",
        notes: "Baud rate 115200"
      },
      {
        id: "conn-uart-cell-rx",
        fromComponentId: "comp-cellular",
        fromPin: "TXD",
        toComponentId: "comp-esp32s3",
        toPin: "GPIO18",
        signalType: "UART_RX",
        voltage: "3.3V",
        purpose: "Receive modem status responses",
        notes: "Baud rate 115200"
      },
      {
        id: "conn-pwr-gps",
        fromComponentId: "comp-esp32s3",
        fromPin: "3V3",
        toComponentId: "comp-gps",
        toPin: "VCC",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power GPS receiver module",
        notes: "3.3V regulated rail"
      },
      {
        id: "conn-gnd-gps",
        fromComponentId: "comp-esp32s3",
        fromPin: "GND",
        toComponentId: "comp-gps",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "GPS ground",
        notes: "Common ground"
      },
      {
        id: "conn-uart-gps-tx",
        fromComponentId: "comp-gps",
        fromPin: "TXD",
        toComponentId: "comp-esp32s3",
        toPin: "GPIO44",
        signalType: "UART_RX",
        voltage: "3.3V",
        purpose: "Stream NMEA sentence satellite coordinates",
        notes: "Baud rate 9600"
      },
      {
        id: "conn-pwr-temp",
        fromComponentId: "comp-esp32s3",
        fromPin: "3V3",
        toComponentId: "comp-temp-probe",
        toPin: "VDD",
        signalType: "POWER",
        voltage: "3.3V",
        purpose: "Power DS18B20 digital temperature sensor",
        notes: "Red wire"
      },
      {
        id: "conn-gnd-temp",
        fromComponentId: "comp-esp32s3",
        fromPin: "GND",
        toComponentId: "comp-temp-probe",
        toPin: "GND",
        signalType: "GROUND",
        voltage: "0V",
        purpose: "DS18B20 ground return",
        notes: "Black wire"
      },
      {
        id: "conn-sig-temp",
        fromComponentId: "comp-temp-probe",
        fromPin: "DQ",
        toComponentId: "comp-esp32s3",
        toPin: "GPIO4",
        signalType: "DIGITAL_1WIRE",
        voltage: "3.3V",
        purpose: "1-Wire digital temperature reading",
        notes: "Yellow wire with 4.7k pullup resistor"
      }
    ],
    firmwareLogic: {
      mainLoopDescription: "Every 10 seconds: queries GPS coordinates via NMEA parser; queries DS18B20 temperature probe; checks internal battery ADC voltage. Formats telemetry payload. If cellular connection is active, publishes MQTT message to 'telemetry/vehicles/{deviceId}'. If cellular link is unavailable, writes packet to flash ring-buffer for deferred store-and-forward sync upon reconnection.",
      setupSteps: [
        "Initialize hardware serial ports for GPS (9600 baud) and Cellular Modem (115200 baud)",
        "Configure DS18B20 OneWire bus and verify ROM ID",
        "Power on SIM7600 module, wait for network registration, and open TLS MQTT socket",
        "Mount SPIFFS / LittleFS partition for offline telemetry caching",
        "Begin continuous background GPS coordinate acquisition"
      ],
      safetyNotes: [
        "Include automotive TVS diode protection against vehicle alternator load-dump spikes (up to 40V)",
        "Store battery in fire-resistant compartment away from external vehicle engine heat"
      ]
    },
    diagrams: {
      systemBlockMermaid: "graph TD\n    PWR[Vehicle 12-24V Supply] --> BUCK[Step-Down Buck Regulator 5V]\n    BUCK --> ESP[ESP32-S3 Controller]\n    BUCK --> CELL[SIM7600 4G LTE Modem]\n    PROBE[DS18B20 Temp Probe] -->|1-Wire| ESP\n    GPS[NEO-6M GPS Module] -->|UART| ESP\n    ESP -->|UART High Speed| CELL\n    CELL -->|4G Cellular MQTTS| BROKER[Cloud MQTT Broker]\n    BROKER --> INGEST[Spring Boot Ingest Service]\n    INGEST --> DB[(MongoDB TimeSeries)]\n    INGEST --> UI[React Live Web Map]"
    },
    enclosure: {
      type: "Industrial Rugged IP67 Enclosure",
      material: "Polycarbonate with silicone gasket seal and magnetic mounting bracket",
      dimensions: "140mm x 95mm x 45mm",
      protectionRating: "IP67 dust-tight and water-resistant for refrigerated vehicle wash-down"
    },
    threeDModel: {
      generated: true,
      enclosure: {
        type: "RUGGED_BOX",
        dimensions: [140, 45, 95],
        color: "#1e293b",
        opacity: 0.35,
        wireframe: false
      },
      components: [
        {
          componentId: "comp-esp32s3",
          primitiveType: "BOARD",
          dimensions: [60, 6, 32],
          position: [0, 5, 0],
          rotation: [0, 0, 0],
          color: "#047857",
          label: "ESP32-S3 MCU Board"
        },
        {
          componentId: "comp-cellular",
          primitiveType: "BOARD",
          dimensions: [45, 8, 40],
          position: [-38, 8, 12],
          rotation: [0, 0, 0],
          color: "#0369a1",
          label: "SIM7600 4G Cellular"
        },
        {
          componentId: "comp-gps",
          primitiveType: "SENSOR_MODULE",
          dimensions: [25, 10, 25],
          position: [38, 10, 15],
          rotation: [0, 0, 0],
          color: "#ca8a04",
          label: "NEO-6M GPS & Antenna"
        },
        {
          componentId: "comp-buck-reg",
          primitiveType: "BOARD",
          dimensions: [30, 8, 20],
          position: [-38, 7, -25],
          rotation: [0, 0, 0],
          color: "#475569",
          label: "12V Buck Regulator"
        },
        {
          componentId: "comp-lipo-backup",
          primitiveType: "BOX",
          dimensions: [50, 10, 35],
          position: [0, 6, -22],
          rotation: [0, 0, 0],
          color: "#64748b",
          label: "LiPo Backup Battery"
        },
        {
          componentId: "comp-temp-probe",
          primitiveType: "CONNECTOR",
          dimensions: [15, 12, 12],
          position: [45, 6, -25],
          rotation: [0, 0, 0],
          color: "#e2e8f0",
          label: "M12 Probe Cable Gland"
        }
      ]
    }
  },
  roadmap: [
    {
      id: "phase-hw-firmware",
      title: "Phase 1: Telematics Hardware & Firmware Assembly",
      description: "Build embedded tracking device, test cellular LTE registration, and verify 1-Wire temperature acquisition.",
      featureIds: ["feature-telemetry-sampling", "feature-cellular-transmission"],
      tasks: [
        "Solder ESP32-S3, SIM7600, and GPS module onto prototyping board",
        "Implement non-blocking UART AT driver for cellular registration",
        "Test store-and-forward ring buffer during simulated cell dropouts"
      ],
      dependsOnPhaseIds: [],
      completionCriteria: ["Device publishes live GPS and temperature packets to test MQTT broker over 4G"]
    },
    {
      id: "phase-cloud-ingest",
      title: "Phase 2: Cloud MQTT Ingest & Timeseries Persistence",
      description: "Setup Spring Boot MQTT consumer, threshold validation, and MongoDB timeseries storage.",
      featureIds: ["feature-cellular-transmission", "feature-breach-alerts"],
      tasks: [
        "Configure Spring Integration MQTT inbound channel adapter",
        "Implement excursion detection algorithm with hysteresis",
        "Create MongoDB time-series collection with 30-day retention policy"
      ],
      dependsOnPhaseIds: ["phase-hw-firmware"],
      completionCriteria: ["Inbound telemetry stored and queryable via REST APIs under 100ms"]
    },
    {
      id: "phase-web-dashboard",
      title: "Phase 3: Web Dashboard & Excursion Alerts",
      description: "Build React map view, WebSocket real-time updates, and dispatcher notification triggers.",
      featureIds: ["feature-live-dashboard", "feature-breach-alerts"],
      tasks: [
        "Implement interactive fleet map with color-coded vehicle markers",
        "Build temperature historical graph with zoom and threshold bounds",
        "Integrate WebSocket client for real-time telemetry streaming"
      ],
      dependsOnPhaseIds: ["phase-cloud-ingest"],
      completionCriteria: ["Dispatchers can monitor simulated fleet movements and receive alerts in browser"]
    }
  ],
  assumptions: [
    {
      id: "asm-cellular-coverage",
      description: "Fleet transit corridors provide at least 2G/4G cellular coverage for 85% of transit duration.",
      affectedEntityIds: ["comp-cellular"],
      reason: "Store-and-forward flash memory caches up to 72 hours of disconnected data, but real-time alerts require cellular connectivity."
    }
  ],
  openQuestions: [
    {
      id: "q-probe-placement",
      question: "Will the temperature probe be attached directly inside the trailer ceiling return air duct or embedded inside cargo sample packs?",
      affectedEntityIds: ["comp-temp-probe", "feature-telemetry-sampling"],
      whyItMatters: "Return air ducts fluctuate faster during door openings, whereas cargo-embedded probes measure true core product temperature."
    }
  ],
  risks: [
    {
      id: "risk-cellular-dead-zones",
      title: "Cellular Dead Zones in Rural Transit",
      severity: "MEDIUM",
      mitigation: "Onboard SPI flash ring-buffer caches up to 10,000 telemetry records and flushes automatically upon reconnect."
    }
  ],
  recommendations: [
    {
      id: "rec-door-sensor",
      category: "FUTURE_FEATURE",
      title: "Refrigerated Door Open Reed Sensor",
      description: "Add a magnetic reed sensor on cargo doors to correlate sudden temperature spikes with authorized deliveries."
    }
  ]
};

// Write files to both backend resources and shared fixtures
fs.writeFileSync(path.join(backendFixturesDir, 'food_ordering_blueprint.json'), JSON.stringify(softwareBlueprint, null, 2), 'utf8');
fs.writeFileSync(path.join(sharedFixturesDir, 'food_ordering_blueprint.json'), JSON.stringify(softwareBlueprint, null, 2), 'utf8');

fs.writeFileSync(path.join(backendFixturesDir, 'software_blueprint.json'), JSON.stringify(softwareBlueprint, null, 2), 'utf8');
fs.writeFileSync(path.join(sharedFixturesDir, 'software_blueprint.json'), JSON.stringify(softwareBlueprint, null, 2), 'utf8');

fs.writeFileSync(path.join(backendFixturesDir, 'hardware_blueprint.json'), JSON.stringify(hardwareBlueprint, null, 2), 'utf8');
fs.writeFileSync(path.join(sharedFixturesDir, 'hardware_blueprint.json'), JSON.stringify(hardwareBlueprint, null, 2), 'utf8');

fs.writeFileSync(path.join(backendFixturesDir, 'hybrid_blueprint.json'), JSON.stringify(hybridBlueprint, null, 2), 'utf8');
fs.writeFileSync(path.join(sharedFixturesDir, 'hybrid_blueprint.json'), JSON.stringify(hybridBlueprint, null, 2), 'utf8');

console.log('✅ Successfully created and synchronized all 3 expanded fixtures:');
console.log('  - software_blueprint.json (and updated food_ordering_blueprint.json)');
console.log('  - hardware_blueprint.json');
console.log('  - hybrid_blueprint.json');
