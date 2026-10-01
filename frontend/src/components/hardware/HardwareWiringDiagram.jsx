import { useState, useMemo } from 'react';

/**
 * Signal color mappings for deterministic circuit wiring visualization.
 */
const SIGNAL_COLORS = {
  POWER: '#ef4444',
  VCC: '#ef4444',
  GROUND: '#64748b',
  GND: '#64748b',
  DIGITAL: '#3b82f6',
  DIGITAL_OUT: '#3b82f6',
  DIGITAL_IN: '#3b82f6',
  DIGITAL_1WIRE: '#06b6d4',
  ANALOG: '#10b981',
  I2C: '#f59e0b',
  I2C_DATA: '#f59e0b',
  I2C_CLOCK: '#d97706',
  SPI: '#8b5cf6',
  SPI_MOSI: '#8b5cf6',
  SPI_MISO: '#a855f7',
  SPI_SCK: '#7c3aed',
  UART: '#ec4899',
  UART_TX: '#ec4899',
  UART_RX: '#f43f5e',
  PWM: '#14b8a6',
  DEFAULT: '#94a3b8',
};

function getSignalColor(signalType) {
  if (!signalType) return SIGNAL_COLORS.DEFAULT;
  const upper = signalType.toUpperCase();
  if (SIGNAL_COLORS[upper]) return SIGNAL_COLORS[upper];
  for (const [key, color] of Object.entries(SIGNAL_COLORS)) {
    if (upper.includes(key)) return color;
  }
  return SIGNAL_COLORS.DEFAULT;
}

const CATEGORY_COLORS = {
  MICROCONTROLLER: { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', badge: '#0891b2' },
  SENSOR: { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', badge: '#059669' },
  ACTUATOR: { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', badge: '#dc2626' },
  DISPLAY: { bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7', badge: '#9333ea' },
  POWER: { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', badge: '#d97706' },
  COMMUNICATION: { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', badge: '#2563eb' },
  OTHER: { bg: 'rgba(100, 116, 139, 0.12)', border: '#64748b', badge: '#475569' },
};

/**
 * Deterministic React + SVG Hardware Wiring & Connection Diagram.
 * Renders directly from structured components and connections data.
 */
export default function HardwareWiringDiagram({
  components = [],
  connections = [],
  onSelectComponent,
  selectedComponentId,
}) {
  const [hoveredConnId, setHoveredConnId] = useState(null);
  const [hoveredCompId, setHoveredCompId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [filterSignal, setFilterSignal] = useState('ALL');

  const mcuName = useMemo(() => {
    const mcu = components.find((c) => (c.category || '').toUpperCase() === 'MICROCONTROLLER');
    return mcu?.name || '';
  }, [components]);

  const signalStats = useMemo(() => {
    const counts = {};
    connections.forEach((conn) => {
      const type = (conn.signalType || 'OTHER').toUpperCase();
      let key = 'DIGITAL';
      if (type.includes('POWER') || type.includes('VCC')) key = 'POWER';
      else if (type.includes('GND') || type.includes('GROUND')) key = 'GROUND';
      else if (type.includes('I2C')) key = 'I2C';
      else if (type.includes('SPI')) key = 'SPI';
      else if (type.includes('ANALOG') || type.includes('ADC')) key = 'ANALOG';
      else if (type.includes('UART')) key = 'UART';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      color: getSignalColor(type),
    }));
  }, [connections]);

  // Compute component layout and pin coordinates deterministically
  const layout = useMemo(() => {
    if (!components.length) return { nodes: [], pinCoords: {}, width: 900, height: 600 };

    // Categorize components into logical columns/areas
    // Column 0: Power
    // Column 1: Sensors & Inputs
    // Column 2: Microcontroller (Center Hub)
    // Column 3: Actuators, Displays, Outputs
    const powerComps = [];
    const sensorComps = [];
    const mcuComps = [];
    const outputComps = [];
    const otherComps = [];

    components.forEach((c) => {
      const cat = (c.category || '').toUpperCase();
      if (cat === 'POWER') powerComps.push(c);
      else if (cat === 'MICROCONTROLLER') mcuComps.push(c);
      else if (cat === 'SENSOR') sensorComps.push(c);
      else if (cat === 'ACTUATOR' || cat === 'DISPLAY') outputComps.push(c);
      else otherComps.push(c);
    });

    const CARD_WIDTH = 220;
    const CARD_HEIGHT_BASE = 80;
    const PIN_ROW_HEIGHT = 22;

    // Collect all pins each component has in the connection list
    const compPins = {};
    components.forEach((c) => {
      compPins[c.id] = { left: new Set(), right: new Set() };
    });

    connections.forEach((conn) => {
      if (compPins[conn.fromComponentId]) {
        // Source pins go to right if MCU or sensor, or left
        compPins[conn.fromComponentId].right.add(conn.fromPin || 'OUT');
      }
      if (compPins[conn.toComponentId]) {
        compPins[conn.toComponentId].left.add(conn.toPin || 'IN');
      }
    });

    // Column positions (X coordinates)
    const COLUMNS = [
      { x: 40, items: [...powerComps, ...sensorComps] },
      { x: 380, items: mcuComps.length ? mcuComps : otherComps.splice(0, 1) },
      { x: 720, items: [...outputComps, ...otherComps] },
    ];

    const nodes = [];
    const pinCoords = {};
    let maxBottom = 500;

    COLUMNS.forEach((col) => {
      let currentY = 50;
      (col.items || []).filter(Boolean).forEach((comp) => {
        const leftPins = Array.from(compPins[comp.id]?.left || []);
        const rightPins = Array.from(compPins[comp.id]?.right || []);
        const maxPins = Math.max(leftPins.length, rightPins.length, 1);
        const cardHeight = CARD_HEIGHT_BASE + maxPins * PIN_ROW_HEIGHT;

        const node = {
          ...comp,
          x: col.x,
          y: currentY,
          width: CARD_WIDTH,
          height: cardHeight,
          leftPins,
          rightPins,
        };
        nodes.push(node);

        // Calculate absolute pin terminal coordinates
        leftPins.forEach((pin, idx) => {
          const py = currentY + CARD_HEIGHT_BASE + idx * PIN_ROW_HEIGHT;
          pinCoords[`${comp.id}::${pin}`] = { x: col.x, y: py, side: 'left' };
        });

        rightPins.forEach((pin, idx) => {
          const py = currentY + CARD_HEIGHT_BASE + idx * PIN_ROW_HEIGHT;
          pinCoords[`${comp.id}::${pin}`] = { x: col.x + CARD_WIDTH, y: py, side: 'right' };
        });

        currentY += cardHeight + 40;
        if (currentY > maxBottom) maxBottom = currentY;
      });
    });

    return {
      nodes,
      pinCoords,
      width: 980,
      height: Math.max(maxBottom + 60, 560),
    };
  }, [components, connections]);

  // Filtered connections
  const visibleConnections = useMemo(() => {
    if (filterSignal === 'ALL') return connections;
    return connections.filter((conn) => {
      const type = (conn.signalType || '').toUpperCase();
      return type.includes(filterSignal);
    });
  }, [connections, filterSignal]);

  if (!components.length && !connections.length) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No hardware components or wiring connections defined for this blueprint.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Circuit Architecture Summary Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚡</span>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Deterministic Pinout & Circuit Schematic
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {mcuName ? `MCU: ${mcuName}` : 'Controller Center Hub'} • {components.length} Components • {connections.length} Pin-to-Pin Wire Routes
            </div>
          </div>
        </div>

        {/* Signal Bus Badges */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.6875rem' }}>
          {signalStats.map((stat) => (
            <span
              key={stat.type}
              style={{
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: `${stat.color}18`,
                color: stat.color,
                border: `1px solid ${stat.color}44`,
                fontWeight: 700,
              }}
            >
              {stat.count}x {stat.type}
            </span>
          ))}
        </div>
      </div>

      {/* Diagram Controls & Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Filter Signal:
          </span>
          {['ALL', 'POWER', 'GROUND', 'DIGITAL', 'ANALOG', 'I2C'].map((sig) => (
            <button
              key={sig}
              type="button"
              onClick={() => setFilterSignal(sig)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: filterSignal === sig ? 'rgba(22, 217, 227, 0.15)' : 'transparent',
                color: filterSignal === sig ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {sig}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            title="Zoom Out"
          >
            🔍 -
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            title="Zoom In"
          >
            🔍 +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Structured SVG Wiring Diagram Canvas */}
      <div
        style={{
          overflow: 'auto',
          backgroundColor: '#0a0f1d',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        <svg
          width={layout.width * zoom}
          height={layout.height * zoom}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{ display: 'block', transition: 'width 0.2s, height 0.2s' }}
        >
          <defs>
            {/* Grid background pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* Arrowhead markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#06b6d4" />
            </marker>
          </defs>

          {/* Grid background */}
          <rect width={layout.width} height={layout.height} fill="url(#grid)" />

          {/* Render Connection Wires */}
          <g id="wires">
            {visibleConnections.map((conn) => {
              const fromKey = `${conn.fromComponentId}::${conn.fromPin}`;
              const toKey = `${conn.toComponentId}::${conn.toPin}`;
              const p1 = layout.pinCoords[fromKey];
              const p2 = layout.pinCoords[toKey];

              // Fallback to node center if specific pin wasn't mapped
              const fromNode = layout.nodes.find((n) => n.id === conn.fromComponentId);
              const toNode = layout.nodes.find((n) => n.id === conn.toComponentId);
              if (!fromNode || !toNode) return null;

              const x1 = p1 ? p1.x : fromNode.x + fromNode.width;
              const y1 = p1 ? p1.y : fromNode.y + fromNode.height / 2;
              const x2 = p2 ? p2.x : toNode.x;
              const y2 = p2 ? p2.y : toNode.y + toNode.height / 2;

              // Smooth cubic bezier with horizontal curvature
              const dx = Math.abs(x2 - x1) * 0.55;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const wireColor = getSignalColor(conn.signalType);
              const isHovered = hoveredConnId === conn.id;
              const isCompHovered =
                hoveredCompId && (conn.fromComponentId === hoveredCompId || conn.toComponentId === hoveredCompId);
              const isHighlighted = isHovered || isCompHovered;

              return (
                <g
                  key={conn.id || `${fromKey}->${toKey}`}
                  onMouseEnter={() => setHoveredConnId(conn.id)}
                  onMouseLeave={() => setHoveredConnId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible wide stroke for easier hovering */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth="14" />
                  {/* Glow layer on hover */}
                  {isHighlighted && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={wireColor}
                      strokeWidth="6"
                      strokeOpacity="0.4"
                      filter="drop-shadow(0 0 6px rgba(255,255,255,0.8))"
                    />
                  )}
                  {/* Actual wire path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wireColor}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeDasharray={conn.signalType?.toUpperCase().includes('I2C') ? '4 2' : 'none'}
                    strokeOpacity={hoveredConnId && !isHighlighted ? 0.25 : 0.85}
                  />
                  {/* Wire mid-point signal tag */}
                  {isHighlighted && (
                    <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 10})`}>
                      <rect
                        x="-45"
                        y="-12"
                        width="90"
                        height="20"
                        rx="4"
                        fill="#1e293b"
                        stroke={wireColor}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {conn.signalType || 'SIGNAL'} ({conn.voltage || ''})
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render Component Blocks */}
          <g id="components">
            {layout.nodes.map((node) => {
              const catKey = (node.category || 'OTHER').toUpperCase();
              const colors = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.OTHER;
              const isSelected = selectedComponentId === node.id;
              const isHovered = hoveredCompId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredCompId(node.id)}
                  onMouseLeave={() => setHoveredCompId(null)}
                  onClick={() => onSelectComponent && onSelectComponent(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Component Card Background */}
                  <rect
                    width={node.width}
                    height={node.height}
                    rx="8"
                    fill={colors.bg}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#06b6d4' : colors.border}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                    style={{
                      transition: 'all 0.15s ease',
                      filter: isSelected
                        ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.4))'
                        : isHovered
                        ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                        : 'none',
                    }}
                  />

                  {/* Header Bar */}
                  <rect width={node.width} height="32" rx="8" fill="rgba(15, 23, 42, 0.6)" />
                  {/* Category Badge */}
                  <g transform="translate(10, 8)">
                    <rect width="68" height="16" rx="4" fill={colors.badge} />
                    <text
                      x="34"
                      y="11"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="700"
                      fontFamily="sans-serif"
                    >
                      {catKey.slice(0, 11)}
                    </text>
                  </g>

                  {/* Component Name */}
                  <text
                    x="86"
                    y="20"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="sans-serif"
                  >
                    {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
                  </text>

                  {/* Purpose / Spec line */}
                  <text
                    x="10"
                    y="50"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="sans-serif"
                  >
                    {node.specification
                      ? node.specification.slice(0, 32) + '…'
                      : node.purpose
                      ? node.purpose.slice(0, 32) + '…'
                      : ''}
                  </text>

                  {/* Pins divider */}
                  <line
                    x1="10"
                    y1="64"
                    x2={node.width - 10}
                    y2="64"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />

                  {/* Left Pin Terminals */}
                  {(node.leftPins || []).map((pin, idx) => {
                    const py = 80 + idx * 22;
                    return (
                      <g key={`lpin-${pin}-${idx}`}>
                        <circle cx="0" cy={py} r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
                        <text
                          x="10"
                          y={py + 3}
                          fill="#cbd5e1"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {pin}
                        </text>
                      </g>
                    );
                  })}

                  {/* Right Pin Terminals */}
                  {(node.rightPins || []).map((pin, idx) => {
                    const py = 80 + idx * 22;
                    return (
                      <g key={`rpin-${pin}-${idx}`}>
                        <circle cx={node.width} cy={py} r="4.5" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
                        <text
                          x={node.width - 10}
                          y={py + 3}
                          textAnchor="end"
                          fill="#cbd5e1"
                          fontSize="9"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {pin}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Wire Color Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Wire Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Power (VCC)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }} /> Ground (GND)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Digital GPIO
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Analog ADC
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> I2C Bus (SDA/SCL)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} /> SPI Bus
        </span>
      </div>

      {/* Required Disclaimer */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
        ⚠️ Engineering planning guidance — verify the circuit with component datasheets before physical construction.
      </div>
    </div>
  );
}
