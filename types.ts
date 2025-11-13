// types.ts
export interface Packet {
  seqNum: number;
  data: string;
  isAck: boolean;
  timestamp?: number;
}

export interface WindowState {
  base: number;
  nextSeqNum: number;
  buffer: Map<number, Packet>;
  acknowledged: Set<number>;
}

export interface NetworkConfig {
  windowSize: number;
  seqNumSize: number;
  timeoutMs: number;
  lossProbability: number;
  maxDelayMs: number;
}
