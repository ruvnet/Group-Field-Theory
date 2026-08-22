// SPDX-License-Identifier: MIT
import type { Edge, GraphCase, RelationalEvent } from './types.js';

function nodeIds(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `n${index.toString().padStart(3, '0')}`);
}

function states(nodes: string[]): Record<string, string> {
  return Object.fromEntries(nodes.map((node, index) => [node, index % 3 === 0 ? 'excited' : 'ground']));
}

const events: RelationalEvent[] = [
  { id: 'prepare', before: [] },
  { id: 'couple', before: ['prepare'] },
  { id: 'measure-a', before: ['couple'] },
  { id: 'measure-b', before: ['couple'] },
  { id: 'compare', before: ['measure-a', 'measure-b'] },
];

function makeCase(id: string, nodes: string[], edges: Edge[], probes: Edge[], diameter: number, distances: number[]): GraphCase {
  return {
    id,
    nodes,
    edges,
    states: states(nodes),
    probes,
    events,
    expected: {
      components: 1,
      diameter,
      distances,
      relationalOrder: ['prepare', 'couple', 'measure-a', 'measure-b', 'compare'],
    },
  };
}

function chain(count: number): GraphCase {
  const nodes = nodeIds(count);
  const edges: Edge[] = nodes.slice(1).map((node, index) => [nodes[index], node] as const);
  return makeCase(`chain-${count}`, nodes, edges, [[nodes[0], nodes[count - 1]], [nodes[10], nodes[20]]], count - 1, [count - 1, 10]);
}

function cycle(count: number): GraphCase {
  const nodes = nodeIds(count);
  const edges: Edge[] = nodes.map((node, index) => [node, nodes[(index + 1) % count]] as const);
  return makeCase(`cycle-${count}`, nodes, edges, [[nodes[0], nodes[count / 2]], [nodes[1], nodes[count - 1]]], count / 2, [count / 2, 2]);
}

function grid(side: number): GraphCase {
  const nodes = nodeIds(side * side);
  const edges: Edge[] = [];
  const id = (row: number, column: number) => nodes[row * side + column];
  for (let row = 0; row < side; row += 1) {
    for (let column = 0; column < side; column += 1) {
      if (column + 1 < side) edges.push([id(row, column), id(row, column + 1)]);
      if (row + 1 < side) edges.push([id(row, column), id(row + 1, column)]);
    }
  }
  return makeCase(`grid-${side}x${side}`, nodes, edges, [[id(0, 0), id(side - 1, side - 1)], [id(0, side - 1), id(side - 1, 0)]], 2 * (side - 1), [2 * (side - 1), 2 * (side - 1)]);
}

function star(count: number): GraphCase {
  const nodes = nodeIds(count);
  const edges: Edge[] = nodes.slice(1).map((node) => [nodes[0], node] as const);
  return makeCase(`star-${count}`, nodes, edges, [[nodes[1], nodes[2]], [nodes[0], nodes[count - 1]]], 2, [2, 1]);
}

function bridgedClusters(size: number): GraphCase {
  const count = size * 2;
  const nodes = nodeIds(count);
  const edges: Edge[] = [];
  for (let offset = 0; offset < count; offset += size) {
    for (let index = 0; index < size; index += 1) {
      edges.push([nodes[offset + index], nodes[offset + ((index + 1) % size)]]);
      edges.push([nodes[offset + index], nodes[offset + ((index + 3) % size)]]);
    }
  }
  edges.push([nodes[size - 1], nodes[size]]);
  return makeCase(`bridged-clusters-${count}`, nodes, edges, [[nodes[0], nodes[count - 1]], [nodes[size - 1], nodes[size]]], 13, [3, 1]);
}

function seededSparse(count: number, seed: number): GraphCase {
  const nodes = nodeIds(count);
  const edgeKeys = new Set<string>();
  const edges: Edge[] = [];
  const add = (a: number, b: number) => {
    if (a === b) return;
    const [left, right] = a < b ? [a, b] : [b, a];
    const key = `${left}:${right}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push([nodes[left], nodes[right]]);
    }
  };
  for (let index = 1; index < count; index += 1) add(index - 1, index);
  let state = seed >>> 0;
  for (let index = 0; index < count * 3; index += 1) {
    state = Math.imul(state ^ (state >>> 15), 1 | state) + 0x6d2b79f5;
    add((state >>> 0) % count, (state >>> 8) % count);
  }
  const preliminary: GraphCase = {
    id: `seeded-sparse-${count}`,
    nodes,
    edges,
    states: states(nodes),
    probes: [[nodes[0], nodes[count - 1]], [nodes[7], nodes[99]]],
    events,
    expected: { components: 1, diameter: 4, distances: [3, 2], relationalOrder: ['prepare', 'couple', 'measure-a', 'measure-b', 'compare'] },
  };
  return preliminary;
}

export function buildCorpus(): GraphCase[] {
  return [chain(64), cycle(64), grid(8), star(64), bridgedClusters(32), seededSparse(128, 0x475446)];
}

export function assertPrimitiveSchema(graph: GraphCase): void {
  const forbidden = new Set(['x', 'y', 'z', 'position', 'coordinate', 'globalTime']);
  const walk = (value: unknown, path: string) => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (forbidden.has(key)) throw new Error(`Forbidden primitive field ${path}.${key}`);
      walk(child, `${path}.${key}`);
    }
  };
  walk(graph, graph.id);
}
