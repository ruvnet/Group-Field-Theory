// SPDX-License-Identifier: MIT
export type NodeId = string;
export type Edge = readonly [NodeId, NodeId];

export interface RelationalEvent {
  id: string;
  before: string[];
}

export interface GraphCase {
  id: string;
  nodes: NodeId[];
  edges: Edge[];
  states: Record<NodeId, string>;
  probes: Edge[];
  events: RelationalEvent[];
  expected: {
    components: number;
    diameter: number;
    distances: number[];
    relationalOrder: string[];
  };
}

export type Projection = Record<NodeId, { x: number; y: number }>;
export type EngineMode = 'naive' | 'indexed';

export interface WorkCounters {
  neighborQueries: number;
  edgeInspections: number;
  usefulNeighborHits: number;
}

export interface RelationalObservables {
  relationFingerprint: string;
  components: number;
  diameter: number;
  distances: number[];
  meanDegree: number;
  spectralDimension: number;
  relationalOrder: string[];
}

export interface CaseRun {
  caseId: string;
  trials: number;
  passed: number;
  mutationKills: number;
  anchorTruthPassed: boolean;
  work: WorkCounters;
  latencyMs: number[];
  receiptChainVerified: boolean;
  receiptHead: string;
}

export interface BenchmarkReport {
  schema: 1;
  corpus: string;
  engine: EngineMode;
  projectionSeeds: number;
  invariantPassRate: number;
  mutationKillRate: number;
  anchorTruthRate: number;
  receiptChainVerified: boolean;
  p50LatencyMs: number;
  p95LatencyMs: number;
  edgeInspectionsPerPass: number;
  redundantWorkRate: number;
  cases: CaseRun[];
  generatedAt: string;
}
