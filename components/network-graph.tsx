"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3-force";
import { initials } from "@/lib/utils";

type Person = {
  id: string;
  name: string;
  role: string | null;
  status: string | null;
  threatLevel: string | null;
  photoUrl: string | null;
};

type Rel = {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: string;
};
type Node = Person & d3.SimulationNodeDatum & { degree?: number };
type Link = { source: string | Node; target: string | Node; type: string };

const ROLE_COLOR: Record<string, string> = {
  target: "#ef4444",
  asset: "#10b981",
  friend: "#6366f1",
  family: "#a78bfa",
  person: "#71717a",
};

const REL_COLOR: Record<string, string> = {
  friend: "rgba(99,102,241,0.45)",
  romantic: "rgba(244,114,182,0.6)",
  family: "rgba(167,139,250,0.45)",
  coworker: "rgba(125,211,252,0.45)",
  teammate: "rgba(252,211,77,0.45)",
  rival: "rgba(239,68,68,0.55)",
};

export function NetworkGraph({
  people,
  relationships,
  filter,
  focusedId,
}: {
  people: Person[];
  relationships: Rel[];
  filter: string;
  focusedId?: string | null;
}) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [hover, setHover] = useState<Node | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ w: r.width, h: Math.max(500, r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const { nodes, links } = useMemo(() => {
    const filtered =
      filter === "all" ? people : people.filter((p) => p.role === filter);
    const visibleIds = new Set(filtered.map((p) => p.id));
    const degree = new Map<string, number>();
    const filteredRels = relationships.filter(
      (r) => visibleIds.has(r.fromPersonId) && visibleIds.has(r.toPersonId),
    );
    for (const r of filteredRels) {
      degree.set(r.fromPersonId, (degree.get(r.fromPersonId) || 0) + 1);
      degree.set(r.toPersonId, (degree.get(r.toPersonId) || 0) + 1);
    }
    const ns: Node[] = filtered.map((p) => ({
      ...p,
      degree: degree.get(p.id) || 0,
    }));
    const ls: Link[] = filteredRels.map((r) => ({
      source: r.fromPersonId,
      target: r.toPersonId,
      type: r.type,
    }));
    return { nodes: ns, links: ls };
  }, [people, relationships, filter]);

  useEffect(() => {
    if (!nodes.length) return;
    if (simulationRef.current) simulationRef.current.stop();
    const sim = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(110)
          .strength(0.6),
      )
      .force("charge", d3.forceManyBody<Node>().strength(-260))
      .force("center", d3.forceCenter(dims.w / 2, dims.h / 2))
      .force(
        "collision",
        d3.forceCollide<Node>().radius((d) => 26 + (d.degree || 0) * 2),
      )
      .alphaDecay(0.04)
      .on("tick", () => setTick((t) => t + 1));
    simulationRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [nodes, links, dims.w, dims.h]);

  function nodeSize(n: Node) {
    return 18 + Math.min(8, (n.degree || 0) * 1.5);
  }
  function nodeColor(n: Node) {
    if (n.role === "target" && n.status === "eliminated_me") return "#52525b";
    return ROLE_COLOR[n.role || "person"] || "#71717a";
  }

  function dragHandlers(n: Node) {
    let dragging = false;
    return {
      onPointerDown: (e: React.PointerEvent) => {
        dragging = true;
        (e.target as Element).setPointerCapture(e.pointerId);
        simulationRef.current?.alphaTarget(0.3).restart();
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (!dragging || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        n.fx = e.clientX - rect.left;
        n.fy = e.clientY - rect.top;
      },
      onPointerUp: (e: React.PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        (e.target as Element).releasePointerCapture(e.pointerId);
        simulationRef.current?.alphaTarget(0);
        n.fx = null;
        n.fy = null;
      },
    };
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-[600px] bg-zinc-950/40 border border-zinc-800/60 rounded-lg overflow-hidden"
    >
      <svg ref={svgRef} width={dims.w} height={dims.h} className="block">
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor="rgba(239,68,68,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width={dims.w} height={dims.h} fill="url(#bgGlow)" />
        <g>
          {links.map((l, i) => {
            const s = l.source as Node;
            const t = l.target as Node;
            if (s.x === undefined || t.x === undefined) return null;
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={REL_COLOR[l.type] || "rgba(113,113,122,0.3)"}
                strokeWidth={1.5}
              />
            );
          })}
        </g>
        <g>
          {nodes.map((n) => {
            const r = nodeSize(n);
            const isFocus = n.id === focusedId;
            const isHover = hover?.id === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x || 0}, ${n.y || 0})`}
                style={{ cursor: "pointer" }}
              >
                {(isFocus || isHover) && (
                  <circle
                    r={r + 8}
                    fill="none"
                    stroke={nodeColor(n)}
                    strokeOpacity={0.4}
                    strokeWidth={2}
                  />
                )}
                <circle
                  r={r}
                  fill={nodeColor(n)}
                  fillOpacity={n.status === "eliminated_me" ? 0.4 : 0.18}
                  stroke={nodeColor(n)}
                  strokeWidth={2}
                  onClick={() => router.push(`/people/${n.id}`)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  {...dragHandlers(n)}
                />
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="#fafafa"
                  fontSize={11}
                  fontWeight={600}
                  pointerEvents="none"
                  style={{ userSelect: "none" }}
                >
                  {initials(n.name)}
                </text>
                {(isHover || isFocus) && (
                  <text
                    textAnchor="middle"
                    y={r + 14}
                    fill="#d4d4d8"
                    fontSize={10}
                    fontWeight={500}
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {n.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 px-3 py-2 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-md">
        {Object.entries(ROLE_COLOR).map(([role, color]) => (
          <div key={role} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border"
              style={{ borderColor: color, background: `${color}30` }}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {role}
            </span>
          </div>
        ))}
      </div>

      {hover && (
        <div className="absolute top-3 right-3 px-3 py-2 bg-zinc-950/95 backdrop-blur border border-zinc-800 rounded-md max-w-xs pointer-events-none">
          <div className="text-sm font-semibold text-zinc-100">
            {hover.name}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">
            {hover.role} · {hover.degree || 0} connection
            {(hover.degree || 0) === 1 ? "" : "s"}
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">
            Click node to open profile
          </div>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-zinc-500">No people in this view.</div>
            <div className="text-xs text-zinc-600 mt-1">
              Add targets and connections to build the web.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
