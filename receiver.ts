// receiver.ts
import { Packet, WindowState } from './types';
import { PacketUtils } from './packetUtils';

export class Receiver {
  private expectedSeqNum = 0;
  private receivedPackets: Map<number, Packet> = new Map();
  private deliveredData: string[] = [];

  constructor(
    private sendPacket: (packet: Packet) => void
  ) {}

  receivePacket(packet: Packet): void {
    if (packet.isAck) return; // Receiver shouldn't get ACKs

    console.log(`📨 RECEIVER: Received packet ${packet.seqNum}, expected ${this.expectedSeqNum}`);

    // Send ACK for any packet within expected range (for selective repeat)
    this.sendAck(packet.seqNum);

    // If this is exactly what we expect, deliver in-order data
    if (packet.seqNum === this.expectedSeqNum) {
      this.deliverData(packet);
      this.deliverBufferedData();
    } else if (packet.seqNum > this.expectedSeqNum) {
      // Out-of-order but within window - buffer it
      this.receivedPackets.set(packet.seqNum, packet);
      console.log(`📦 RECEIVER: Buffered out-of-order packet ${packet.seqNum}`);
    }
    // Ignore duplicates (packet.seqNum < expectedSeqNum)
  }

  private sendAck(seqNum: number): void {
    const ackPacket = PacketUtils.createAckPacket(seqNum);
    console.log(`✅ RECEIVER: Sending ACK for packet ${seqNum}`);
    this.sendPacket(ackPacket);
  }

  private deliverData(packet: Packet): void {
    this.deliveredData.push(packet.data);
    console.log(`🎯 RECEIVER: Delivered data: "${packet.data}"`);
    this.expectedSeqNum++;
  }

  private deliverBufferedData(): void {
    while (this.receivedPackets.has(this.expectedSeqNum)) {
      const packet = this.receivedPackets.get(this.expectedSeqNum)!;
      this.receivedPackets.delete(this.expectedSeqNum);
      this.deliverData(packet);
    }
  }

  getDeliveredData(): string[] {
    return [...this.deliveredData];
  }

  getExpectedSeqNum(): number {
    return this.expectedSeqNum;
  }
}
