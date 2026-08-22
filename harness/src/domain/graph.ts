// SPDX-License-Identifier: MIT
import { hash } from '@metaharness/harness';
import type {
  EngineMode,
  GraphCase,
  NodeId,
  Projection,
  RelationalObservables,
  WorkCounters,
} from './types.js';

function round(value: number, digits = 9): number {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

export function seededProjection(nodes: NodeId[], seed: number): Projection {
  let state = seed >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Object.fromEntries(nodes.map((id) => [id, { x: round(random()), y: round(random()) }]));
}

export function projectionDistance(projection: Projection, [a, b]: readonly [NodeId, NodeId]): number {
  const pa = projection[a];
  const pb = projection[b];
  return round(Math.hypot(pa.x - pb.x, pa.y - pb.y));
}

export class GraphEngine {
  private readonly adjacency = new Map<NodeId, NodeId[]>();
  readonly counters: WorkCounters = { neighborQueries: 0, edgeInspections: 0, usefulNeighborHits: 0 };

  constructor(private readonly graph: GraphCase, private readonly mode: EngineMode) {
    if (mode === 'indexed') {
      for (const node of graph.nodes) this.adjacency.set(node, []);
      for (const [a, b] of graph.edges) {
        this.adjacency.get(a)?.push(b);
        this.adjacency.get(b)?.push(a);
      }
      for (const neighbors of this.adjacency.values()) neighbors.sort();
    }
  }

  neighbors(node: NodeId): NodeId[] {
    this.counters.neighborQueries += 1;
    if (this.mode === 'indexed') {
      const found = this.adjacency.get(node) ?? [];
      this.counters.edgeInspections += found.length;
      this.counters.usefulNeighborHits += found.length;
      return found;
    }
    const out: NodeId[] = [];
    for (const [a, b] of this.graph.edges) {
      this.counters.edgeInspections += 1;
      if (a === node) out.push(b);
      else if (b === node) out.push(a);
    }
    out.sort();
    this.counters.usefulNeighborHits += out.length;
    return out;
  }

  shortestPath(start: NodeId, goal: NodeId): number {
    if (start === goal) return 0;
    const queue: Array<[NodeId, number]> = [[start, 0]];
    const seen = new Set<NodeId>([start]);
    for (let i = 0; i < queue.length; i += 1) {
      const [node, distance] = queue[i];
      for (const neighbor of this.neighbors(node)) {
        if (neighbor === goal) return distance + 1;
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push([neighbor, distance + 1]);
        }
      }
    }
    return Number.POSITIVE_INFINITY;
  }

  components(): number {
    const seen = new Set<NodeId>();
    let count = 0;
    for (const start of this.graph.nodes) {
      if (seen.has(start)) continue;
      count += 1;
      const queue = [start];
      seen.add(start);
      for (let i = 0; i < queue.length; i += 1) {
        for (const neighbor of this.neighbors(queue[i])) {
          if (!seen.has(neighbor)) {
            seen.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
    return count;
  }

  diameter(): number {
    let diameter = 0;
    for (const start of this.graph.nodes) {
      const distances = new Map<NodeId, number>([[start, 0]]);
      const queue = [start];
      for (let i = 0; i < queue.length; i += 1) {
        const node = queue[i];
        for (const neighbor of this.neighbors(node)) {
          if (!distances.has(neighbor)) {
            distances.set(neighbor, (distances.get(node) ?? 0) + 1);
            queue.push(neighbor);
          }
        }
      }
      for (const value of distances.values()) diameter = Math.max(diameter, value);
    }
    return diameter;
  }

  spectralDimension(): number {
    const starts = this.graph.nodes.slice(0, Math.min(8, this.graph.nodes.length));
    const times = [2, 4, 8, 16];
    const returns: number[] = [];
    for (const maxStep of times) {
      let total = 0;
      for (const start of starts) {
        let distribution = new Map<NodeId, number>([[start, 1]]);
        for (let step = 0; step < maxStep; step += 1) {
          const next = new Map<NodeId, number>();
          for (const [node, probability] of distribution) {
            const neighbors = this.neighbors(node);
            next.set(node, (next.get(node) ?? 0) + probability * 0.5);
            if (neighbors.length) {
              const share = (probability * 0.5) / neighbors.length;
              for (const neighbor of neighbors) next.set(neighbor, (next.get(neighbor) ?? 0) + share);
            }
          }
          distribution = next;
        }
        total += distribution.get(start) ?? 0;
      }
      returns.push(Math.max(total / starts.length, Number.EPSILON));
    }
    const xs = times.map(Math.log);
    const ys = returns.map(Math.log);
    const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
    const slope = xs.reduce((sum, x, index) => sum + (x - xMean) * (ys[index] - yMean), 0) /
      xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
    return round(Math.max(0, -2 * slope), 6);
  }
}

export function relationalOrder(graph: GraphCase): string[] {
  const ids = graph.events.map((event) => event.id).sort();
  const outgoing = new Map(ids.map((id) => [id, [] as string[]]));
  const incoming = new Map(ids.map((id) => [id, 0]));
  for (const event of graph.events) {
    for (const predecessor of event.before) {
      if (!outgoing.has(predecessor)) throw new Error(`Unknown event predecessor: ${predecessor}`);
      outgoing.get(predecessor)?.push(event.id);
      incoming.set(event.id, (incoming.get(event.id) ?? 0) + 1);
    }
  }
  const ready = ids.filter((id) => incoming.get(id) === 0).sort();
  const ordered: string[] = [];
  while (ready.length) {
    const id = ready.shift() as string;
    ordered.push(id);
    for (const next of (outgoing.get(id) ?? []).sort()) {
      incoming.set(next, (incoming.get(next) ?? 0) - 1);
      if (incoming.get(next) === 0) {
        ready.push(next);
        ready.sort();
      }
    }
  }
  if (ordered.length !== ids.length) throw new Error('Relational event graph contains a cycle');
  return ordered;
}

export function deriveObservables(graph: GraphCase, engine: GraphEngine): RelationalObservables {
  const canonicalPrimitive = {
    nodes: [...graph.nodes].sort(),
    edges: graph.edges.map(([a, b]) => [a, b].sort()).sort((a, b) => a.join(':').localeCompare(b.join(':'))),
    states: Object.fromEntries(Object.entries(graph.states).sort(([a], [b]) => a.localeCompare(b))),
    events: graph.events.map((event) => ({ id: event.id, before: [...event.before].sort() })).sort((a, b) => a.id.localeCompare(b.id)),
  };
  return {
    relationFingerprint: hash(canonicalPrimitive),
    components: engine.components(),
    diameter: engine.diameter(),
    distances: graph.probes.map((probe) => engine.shortestPath(probe[0], probe[1])),
    meanDegree: round((2 * graph.edges.length) / graph.nodes.length, 6),
    spectralDimension: engine.spectralDimension(),
    relationalOrder: relationalOrder(graph),
  };
}
