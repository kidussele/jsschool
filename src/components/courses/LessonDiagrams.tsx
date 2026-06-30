"use client";

import { useTheme } from "next-themes";

// ── Shared Helpers ─────────────────────────────────────────────

/** Returns true once the theme has mounted and resolved. */
function useResolvedTheme() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}

/** Palette tokens – driven by the project's CSS custom properties. */
function colors(dark: boolean) {
  return {
    bg: dark ? "#0F172A" : "#F8FAFC",
    cardBg: dark ? "#1E293B" : "#FFFFFF",
    cardBorder: dark ? "#334155" : "#E2E8F0",
    text: dark ? "#F1F5F9" : "#1E293B",
    textMuted: dark ? "#94A3B8" : "#64748B",
    jsYellow: "#F7DF1E",
    jsSky: "#38BDF8",
    jsViolet: "#8B5CF6",
    jsEmerald: "#10B981",
    jsOrange: "#F59E0B",
    jsRose: "#F43F5E",
    arrow: dark ? "#64748B" : "#94A3B8",
  };
}

// ── Arrow Marker Definitions ───────────────────────────────────

function ArrowMarkers({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <marker
        id={`${id}-arrow`}
        viewBox="0 0 10 7"
        refX="10"
        refY="3.5"
        markerWidth="10"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 3.5 L 0 7 z" fill={color} />
      </marker>
      <marker
        id={`${id}-arrow-sm`}
        viewBox="0 0 8 6"
        refX="8"
        refY="3"
        markerWidth="8"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 8 3 L 0 6 z" fill={color} />
      </marker>
    </defs>
  );
}

// ── Styled Box ─────────────────────────────────────────────────

function Box({
  x,
  y,
  w,
  h,
  fill,
  fillOpacity,
  stroke,
  label,
  sublabel,
  textFill,
  rx = 12,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  fillOpacity?: number | string;
  stroke: string;
  label: string;
  sublabel?: string;
  textFill: string;
  rx?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - (sublabel ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textFill}
        fontSize="13"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textFill}
          opacity={0.6}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. JSRuntimeDiagram
// ═══════════════════════════════════════════════════════════════

export function JSRuntimeDiagram() {
  const dark = useResolvedTheme();
  const c = colors(dark);

  // Layout constants (viewBox coordinates)
  const W = 520;
  const bw = 180; // box width
  const bh = 44; // box height
  const gap = 62; // vertical gap between row centers
  const cx = W / 2; // center x

  // Row y-centers
  const rows = {
    browser: 40,
    engine: 40 + gap,
    heapStack: 40 + gap * 2,
    webApis: 40 + gap * 3,
    callbackQ: 40 + gap * 4,
    eventLoop: 40 + gap * 5,
    dom: 40 + gap * 6,
  };

  const boxY = (row: number) => row - bh / 2;

  // Arrow helper
  const arrowDown = (fromRow: number, toRow: number) => (
    <line
      x1={cx}
      y1={fromRow + bh / 2 + 2}
      x2={cx}
      y2={toRow - bh / 2 - 2}
      stroke={c.arrow}
      strokeWidth="1.5"
      markerEnd={`url(#jsrt-arrow)`}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${rows.dom + 60}`}
      width="100%"
      className="mx-auto max-w-xl"
      role="img"
      aria-label="JavaScript Runtime architecture diagram"
    >
      <ArrowMarkers id="jsrt" color={c.arrow} />

      {/* Background */}
      <rect
        x="0"
        y="0"
        width={W}
        height={rows.dom + 60}
        rx="16"
        fill={c.bg}
        stroke={c.cardBorder}
        strokeWidth="1"
      />

      {/* Title */}
      <text
        x={cx}
        y="18"
        textAnchor="middle"
        fill={c.jsYellow}
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.08em"
        style={{ textTransform: "uppercase" }}
      >
        JavaScript Runtime
      </text>

      {/* Browser */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.browser)}
        w={bw}
        h={bh}
        fill={c.jsSky}
        fillOpacity={0.15}
        stroke={c.jsSky}
        label="🌐  Browser"
        textFill={c.jsSky}
      />

      {arrowDown(rows.browser, rows.engine)}

      {/* JS Engine */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.engine)}
        w={bw}
        h={bh}
        fill={c.jsYellow}
        fillOpacity={0.15}
        stroke={c.jsYellow}
        label="⚙️  JavaScript Engine"
        sublabel="V8 / SpiderMonkey"
        textFill={c.jsYellow}
      />

      {arrowDown(rows.engine, rows.heapStack)}

      {/* Memory Heap + Call Stack (side by side) */}
      <Box
        x={cx - bw - 8}
        y={boxY(rows.heapStack)}
        w={bw}
        h={bh}
        fill={c.jsViolet}
        fillOpacity={0.12}
        stroke={c.jsViolet}
        label="📦  Memory Heap"
        textFill={c.jsViolet}
      />
      <Box
        x={cx + 8}
        y={boxY(rows.heapStack)}
        w={bw}
        h={bh}
        fill={c.jsRose}
        fillOpacity={0.12}
        stroke={c.jsRose}
        label="📚  Call Stack"
        textFill={c.jsRose}
      />
      {/* Small bracket label */}
      <text
        x={cx}
        y={rows.heapStack - bh / 2 - 6}
        textAnchor="middle"
        fill={c.textMuted}
        fontSize="9"
        fontFamily="system-ui, sans-serif"
      >
        Engine internals
      </text>

      {arrowDown(rows.heapStack, rows.webApis)}

      {/* Web APIs */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.webApis)}
        w={bw}
        h={bh}
        fill={c.jsOrange}
        fillOpacity={0.12}
        stroke={c.jsOrange}
        label="🔌  Web APIs"
        sublabel="DOM · Fetch · setTimeout"
        textFill={c.jsOrange}
      />

      {arrowDown(rows.webApis, rows.callbackQ)}

      {/* Callback Queue */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.callbackQ)}
        w={bw}
        h={bh}
        fill={c.jsEmerald}
        fillOpacity={0.12}
        stroke={c.jsEmerald}
        label="📋  Callback Queue"
        textFill={c.jsEmerald}
      />

      {arrowDown(rows.callbackQ, rows.eventLoop)}

      {/* Event Loop */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.eventLoop)}
        w={bw}
        h={bh}
        fill={c.jsYellow}
        fillOpacity={0.2}
        stroke={c.jsYellow}
        label="🔁  Event Loop"
        textFill={c.jsYellow}
      />

      {arrowDown(rows.eventLoop, rows.dom)}

      {/* DOM Rendering */}
      <Box
        x={cx - bw / 2}
        y={boxY(rows.dom)}
        w={bw}
        h={bh}
        fill={c.jsSky}
        fillOpacity={0.15}
        stroke={c.jsSky}
        label="🖥️  DOM Rendering"
        textFill={c.jsSky}
      />

      {/* Feedback arrow: Event Loop → Call Stack (side arrow) */}
      <path
        d={`M ${cx - bw / 2 - 2} ${rows.eventLoop} 
            L ${cx - bw - 12} ${rows.eventLoop} 
            L ${cx - bw - 12} ${rows.heapStack}
            L ${cx - bw - 2} ${rows.heapStack}`}
        fill="none"
        stroke={c.jsEmerald}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        markerEnd={`url(#jsrt-arrow-sm)`}
        opacity={0.7}
      />
      <text
        x={cx - bw - 18}
        y={(rows.eventLoop + rows.heapStack) / 2 + 3}
        textAnchor="middle"
        fill={c.jsEmerald}
        fontSize="8"
        fontFamily="system-ui, sans-serif"
        transform={`rotate(-90, ${cx - bw - 18}, ${(rows.eventLoop + rows.heapStack) / 2 + 3})`}
      >
        enqueue
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. EventLoopDiagram
// ═══════════════════════════════════════════════════════════════

export function EventLoopDiagram() {
  const dark = useResolvedTheme();
  const c = colors(dark);

  // Viewbox layout
  const W = 560;
  const H = 440;

  // Center of the event loop ring
  const cx = W / 2;
  const cy = H / 2 + 10;

  // Ring radii
  const outerR = 175;
  const innerR = 115;

  // Node positions around the ring (angle in degrees, 0 = top)
  const nodeR = (outerR + innerR) / 2; // mid-ring radius
  const nodeAngle = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const nodePos = (deg: number) => ({
    x: cx + nodeR * Math.cos(nodeAngle(deg)),
    y: cy + nodeR * Math.sin(nodeAngle(deg)),
  });

  // 6 nodes evenly spaced
  const nodes = [
    { deg: 0, label: "Call Stack", sub: "Execute", color: c.jsRose, x: 0, y: 0 },
    { deg: 60, label: "Web APIs", sub: "Async work", color: c.jsOrange, x: 0, y: 0 },
    { deg: 120, label: "Microtasks", sub: "Promises", color: c.jsViolet, x: 0, y: 0 },
    { deg: 180, label: "Callback Q", sub: "setTimeout", color: c.jsEmerald, x: 0, y: 0 },
    { deg: 240, label: "Render", sub: "UI Paint", color: c.jsSky, x: 0, y: 0 },
    { deg: 300, label: "Next Tick", sub: "process.nextTick", color: c.jsYellow, x: 0, y: 0 },
  ];
  nodes.forEach((n) => {
    const pos = nodePos(n.deg);
    n.x = pos.x;
    n.y = pos.y;
  });

  const bw = 110;
  const bh = 40;

  // Build curved arrows between adjacent nodes
  const curvedArrow = (from: (typeof nodes)[number], to: (typeof nodes)[number]) => {
    const midDeg = (from.deg + to.deg) / 2;
    const midRad = nodeAngle(midDeg);
    const cpR = outerR + 20;
    const cpx = cx + cpR * Math.cos(midRad);
    const cpy = cy + cpR * Math.sin(midRad);

    // Start/end points on node edges (approximate toward ring direction)
    const startAngle = nodeAngle(from.deg);
    const endAngle = nodeAngle(to.deg);
    const sx = from.x + 30 * Math.cos(startAngle);
    const sy = from.y + 30 * Math.sin(startAngle);
    const ex = to.x - 30 * Math.cos(endAngle);
    const ey = to.y - 30 * Math.sin(endAngle);

    return (
      <path
        d={`M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`}
        fill="none"
        stroke={c.arrow}
        strokeWidth="1.3"
        markerEnd={`url(#el-arrow-sm)`}
        opacity={0.6}
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="mx-auto max-w-2xl"
      role="img"
      aria-label="Event Loop process diagram"
    >
      <ArrowMarkers id="el" color={c.arrow} />

      {/* Background */}
      <rect x="0" y="0" width={W} height={H} rx="16" fill={c.bg} stroke={c.cardBorder} strokeWidth="1" />

      {/* Title */}
      <text
        x={cx}
        y="24"
        textAnchor="middle"
        fill={c.jsYellow}
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        EVENT LOOP CYCLE
      </text>

      {/* Outer ring track */}
      <circle
        cx={cx}
        cy={cy}
        r={nodeR}
        fill="none"
        stroke={c.cardBorder}
        strokeWidth="1"
        strokeDasharray="6 4"
        opacity={0.5}
      />

      {/* Curved arrows between nodes */}
      {nodes.map((n, i) => curvedArrow(n, nodes[(i + 1) % nodes.length]))}

      {/* Center: Event Loop label with pulse */}
      <style>{`
        @keyframes el-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .el-pulse { animation: el-pulse 2s ease-in-out infinite; }
      `}</style>
      <circle
        cx={cx}
        cy={cy}
        r={68}
        fill={c.jsYellow}
        fillOpacity={0.08}
        stroke={c.jsYellow}
        strokeWidth="1.5"
        className="el-pulse"
      />
      <circle
        cx={cx}
        cy={cy}
        r={48}
        fill={c.jsYellow}
        fillOpacity={0.06}
        stroke={c.jsYellow}
        strokeWidth="0.5"
        className="el-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={c.jsYellow}
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        Event
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={c.jsYellow}
        fontSize="15"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        Loop
      </text>

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={n.label}>
          <rect
            x={n.x - bw / 2}
            y={n.y - bh / 2}
            width={bw}
            height={bh}
            rx="10"
            fill={n.color}
            fillOpacity={dark ? 0.15 : 0.1}
            stroke={n.color}
            strokeWidth="1.5"
          />
          <text
            x={n.x}
            y={n.y - 5}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={n.color}
            fontSize="11.5"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y={n.y + 11}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={n.color}
            opacity={0.55}
            fontSize="9"
            fontFamily="system-ui, sans-serif"
          >
            {n.sub}
          </text>
        </g>
      ))}

      {/* Legend / note at bottom */}
      <text
        x={cx}
        y={H - 14}
        textAnchor="middle"
        fill={c.textMuted}
        fontSize="9"
        fontFamily="system-ui, sans-serif"
      >
        The Event Loop continuously checks the Call Stack and enqueues callbacks from Microtask &amp; Callback Queues
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. LessonDiagramRenderer
// ═══════════════════════════════════════════════════════════════

const diagramMap: Record<string, React.FC> = {
  "js-runtime": JSRuntimeDiagram,
  "event-loop": EventLoopDiagram,
};

export function LessonDiagramRenderer({ diagramId }: { diagramId: string }) {
  const Component = diagramMap[diagramId];
  if (!Component) return null;

  return (
    <figure className="my-6">
      <Component />
    </figure>
  );
}