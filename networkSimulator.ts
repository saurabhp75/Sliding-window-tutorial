// networkSimulator.ts
import { Packet, NetworkConfig } from './types';

export class NetworkSimulator {
  private packetsInFlight: Array<{ packet: Packet; destination: 'sender' | 'receiver'; arrivalTime: number }> = [];
  private currentTime = 0;

  constructor(private config: NetworkConfig) {}

  sendPacket(packet: Packet, from: 'sender' | 'receiver'): void {
    // Simulate packet loss
    if (Math.random() < this.config.lossProbability) {
      console.log(`📦 Packet ${packet.seqNum} LOST in network`);
      return;
    }

    // Simulate network delay
    const delay = Math.random() * this.config.maxDelayMs;
    const destination = from === 'sender' ? 'receiver' : 'sender';
    const arrivalTime = this.currentTime + delay;

    this.packetsInFlight.push({
      packet,
      destination,
      arrivalTime
    });

    console.log(`📦 Packet ${packet.seqNum} sent from ${from}, will arrive at ${arrivalTime.toFixed(2)}ms`);
  }

  processTime(elapsedMs: number): Packet[] {
    this.currentTime += elapsedMs;
    const arrivedPackets: Packet[] = [];
    
    this.packetsInFlight = this.packetsInFlight.filter(item => {
      if (item.arrivalTime <= this.currentTime) {
        arrivedPackets.push(item.packet);
        console.log(`📦 Packet ${item.packet.seqNum} arrived at ${item.destination}`);
        return false;
      }
      return true;
    });

    return arrivedPackets;
  }

  hasPendingPackets(): boolean {
    return this.packetsInFlight.length > 0;
  }
}
